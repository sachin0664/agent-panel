-- Sathi Pay financial consistency fix
-- Keeps deposit commission and referral income separate.
-- Run in Supabase SQL Editor if this database must be rebuilt/recovered.

create or replace function public.protect_customer_financial_fields()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if current_user not in ('postgres','service_role') and not public.is_admin() then
    new.wallet_balance := old.wallet_balance;
    new.deposit_balance := old.deposit_balance;
    new.commission_balance := old.commission_balance;
    new.referral_balance := old.referral_balance;
    new.bonus_balance := old.bonus_balance;
    new.bonus_received := old.bonus_received;
    new.uid := old.uid;
    new.invitation_code := old.invitation_code;
    new.referred_by := old.referred_by;
    new.status := old.status;
  end if;
  return new;
end;
$function$;

create or replace function public.process_customer_referral_commission()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_current_customer_id uuid;
  v_parent_code text;
  v_parent_id uuid;
  v_level integer;
  v_percentage numeric;
  v_commission numeric;
  v_ledger_balance numeric;
begin
  if lower(coalesce(new.status,'')) <> 'approved' or new.customer_id is null then
    return new;
  end if;

  v_current_customer_id := new.customer_id;

  for v_level in 1..3 loop
    select referred_by into v_parent_code
    from public.customers where id = v_current_customer_id;

    if v_parent_code is null or trim(v_parent_code) = '' then exit; end if;

    select id into v_parent_id
    from public.customers
    where invitation_code = trim(v_parent_code)
    limit 1;

    if v_parent_id is null then exit; end if;

    v_percentage := case v_level when 1 then 0.01 when 2 then 0.005 else 0.002 end;
    v_commission := round(new.amount * v_percentage,2);

    if not exists (
      select 1
      from public.customer_referral_commissions
      where deposit_id::bigint = new.id
        and customer_id = v_parent_id
        and level::integer = v_level
    ) then
      insert into public.customer_referral_commissions
        (customer_id,source_customer_id,deposit_id,level,percentage,transaction_amount,commission_amount,status,created_at)
      values
        (v_parent_id,new.customer_id,new.id,v_level::text,v_percentage*100,new.amount,v_commission,'approved',now());

      select coalesce(sum(case when direction='credit' then amount else -amount end),0)
      into v_ledger_balance
      from public.wallet_ledger
      where customer_id = v_parent_id;

      insert into public.wallet_ledger
        (customer_id,component,direction,amount,balance_after,reason,reference,created_at)
      values
        (v_parent_id,'referral','credit',v_commission,v_ledger_balance+v_commission,
         'Referral commission - Level '||v_level,
         'REFERRAL-COMMISSION-'||(select id::text
          from public.customer_referral_commissions
          where customer_id=v_parent_id
            and source_customer_id=new.customer_id
            and deposit_id=new.id
            and level::integer=v_level
          order by created_at desc limit 1),
         now());

      update public.customers
      set referral_balance = coalesce(referral_balance,0) + v_commission,
          wallet_balance = coalesce(wallet_balance,0) + v_commission,
          updated_at = now()
      where id = v_parent_id;
    end if;

    v_current_customer_id := v_parent_id;
  end loop;

  return new;
end;
$function$;

create or replace function public.get_my_earnings_summary()
returns table(today_earnings numeric, total_earnings numeric)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_customer_id uuid;
  v_auth_id uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt()->>'email','')));
begin
  select c.id into v_customer_id
  from public.customers c
  where c.id = v_auth_id
     or (c.auth_user_id = v_auth_id and v_auth_id is not null)
     or (v_email <> '' and lower(coalesce(c.email,'')) = v_email)
  order by
    case when c.id = v_auth_id then 0
         when c.auth_user_id = v_auth_id then 1
         else 2 end,
    c.created_at desc
  limit 1;

  if v_customer_id is null then
    return query select 0::numeric, 0::numeric;
    return;
  end if;

  return query
  select
    coalesce(sum(w.amount) filter (
      where w.direction='credit'
        and w.created_at >= date_trunc('day',now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'
        and w.created_at < (date_trunc('day',now() at time zone 'Asia/Kolkata') + interval '1 day') at time zone 'Asia/Kolkata'
        and (
          lower(coalesce(w.component,'')) in ('commission','referral')
          or lower(coalesce(w.reason,'')) like '%commission%'
          or lower(coalesce(w.reason,'')) like '%referral%'
        )
    ),0)::numeric,
    coalesce(sum(w.amount) filter (
      where w.direction='credit'
        and (
          lower(coalesce(w.component,'')) in ('commission','referral')
          or lower(coalesce(w.reason,'')) like '%commission%'
          or lower(coalesce(w.reason,'')) like '%referral%'
        )
    ),0)::numeric
  from public.wallet_ledger w
  where w.customer_id=v_customer_id;
end;
$function$;

create or replace function public.get_my_referral_data()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_customer_id uuid;
  v_invitation_code text;
  v_result jsonb;
begin
  v_customer_id := auth.uid();

  if v_customer_id is null then
    raise exception 'Customer is not logged in';
  end if;

  select invitation_code into v_invitation_code
  from public.customers where id=v_customer_id;

  if v_invitation_code is null then
    raise exception 'Customer referral code not found';
  end if;

  with recursive referral_tree as (
    select c.id,c.name,c.uid,c.invitation_code,c.referred_by,c.created_at,1 as level,array[c.id] as path
    from public.customers c where c.referred_by=v_invitation_code
    union all
    select c.id,c.name,c.uid,c.invitation_code,c.referred_by,c.created_at,rt.level+1,rt.path||c.id
    from public.customers c
    join referral_tree rt on c.referred_by=rt.invitation_code
    where rt.level<3 and not c.id=any(rt.path)
  ),
  structured_earnings as (
    select r.id::text as id,r.level::text as level,r.percentage,
           r.transaction_amount as deposit_amount,r.commission_amount,r.status,r.created_at,
           coalesce(c.name,'Referral member') as member_name,c.uid as member_uid
    from public.customer_referral_commissions r
    left join public.customers c on c.id=r.source_customer_id
    where r.customer_id=v_customer_id and lower(coalesce(r.status,''))='approved'
  ),
  legacy_earnings as (
    select 'ledger-'||w.id::text as id,
           case when lower(coalesce(w.reason,'')) like '%level 3%' then '3'
                when lower(coalesce(w.reason,'')) like '%level 2%' then '2'
                else '1' end as level,
           case when lower(coalesce(w.reason,'')) like '%level 3%' then 0.2
                when lower(coalesce(w.reason,'')) like '%level 2%' then 0.5
                else 1.0 end as percentage,
           null::numeric as deposit_amount,w.amount as commission_amount,
           'approved'::text as status,w.created_at,
           'Referral member'::text as member_name,null::text as member_uid
    from public.wallet_ledger w
    where w.customer_id=v_customer_id
      and lower(coalesce(w.component,''))='referral'
      and lower(coalesce(w.direction,''))='credit'
      and not exists (
        select 1 from public.customer_referral_commissions r
        where ('REFERRAL-COMMISSION-'||r.id::text)=w.reference
      )
  )
  select jsonb_build_object(
    'level_a',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'uid',uid,'created_at',created_at) order by created_at desc) from referral_tree where level=1),'[]'::jsonb),
    'level_b',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'uid',uid,'created_at',created_at) order by created_at desc) from referral_tree where level=2),'[]'::jsonb),
    'level_c',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'uid',uid,'created_at',created_at) order by created_at desc) from referral_tree where level=3),'[]'::jsonb),
    'earnings',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',e.id,'level',e.level,'percentage',e.percentage,
        'deposit_amount',e.deposit_amount,'commission_amount',e.commission_amount,
        'status',e.status,'created_at',e.created_at,
        'member_name',e.member_name,'member_uid',e.member_uid
      ) order by e.created_at desc)
      from (
        select * from structured_earnings
        union all
        select * from legacy_earnings
      ) e
    ),'[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$function$;

-- Reconcile all stored financial fields from authoritative records.
with deposit_totals as (
  select customer_id,
         coalesce(sum(commission) filter (where lower(status)='approved'),0) as commission_total,
         coalesce(sum(amount) filter (where lower(status)='approved'),0) as deposit_total
  from public.customer_deposits group by customer_id
),
ledger_totals as (
  select customer_id,
         coalesce(sum(case when direction='credit' then amount else -amount end),0) as wallet_total,
         coalesce(sum(case when lower(component)='referral' and direction='credit' then amount
                           when lower(component)='referral' and direction='debit' then -amount else 0 end),0) as referral_total,
         coalesce(sum(case when lower(component)='bonus' and direction='credit' then amount
                           when lower(component)='bonus' and direction='debit' then -amount else 0 end),0) as bonus_total
  from public.wallet_ledger group by customer_id
)
update public.customers c
set wallet_balance=coalesce(l.wallet_total,0),
    deposit_balance=coalesce(d.deposit_total,0),
    commission_balance=coalesce(d.commission_total,0),
    referral_balance=coalesce(l.referral_total,0),
    bonus_balance=coalesce(l.bonus_total,0),
    updated_at=now()
from deposit_totals d
full join ledger_totals l on l.customer_id=d.customer_id
where c.id=coalesce(d.customer_id,l.customer_id);
