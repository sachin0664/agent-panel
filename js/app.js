// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL =
    "https://lozluohksmjxbxixkbmq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_R6LUj2dUcEwVL5Xuce-7Wg_8y4ZpnBm";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ===============================
// COMMISSION RATE
// ===============================

const COMMISSION_RATE = 0.10;


// ===============================
// LOGIN FUNCTION
// ===============================

function login(event) {

    event.preventDefault();

    const mobile =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const message =
        document.getElementById("loginMessage");


    if (
        mobile === "9999999999" &&
        password === "Admin@2026Secure"
    ) {

        message.innerText =
            "Login successful!";


        setTimeout(function () {

            window.location.href =
                "agents.html";

        }, 1000);

    } else {

        message.innerText =
            "Invalid mobile number or password.";

    }

}


// ===============================
// LOAD ADMIN DASHBOARD
// ===============================

async function loadAdminDashboard() {

    const totalAgentsElement =
        document.getElementById("totalAgents");

    if (!totalAgentsElement) {
        return;
    }


    // -------------------------------
    // TOTAL AGENTS
    // -------------------------------

    const agentsResult =
        await supabaseClient
            .from("agents")
            .select("id");


    if (agentsResult.error) {

        console.error(
            "Agents error:",
            agentsResult.error
        );

    }


    const totalAgents =
        agentsResult.data
            ? agentsResult.data.length
            : 0;


    document.getElementById(
        "totalAgents"
    ).innerText =
        totalAgents;



    // -------------------------------
    // TOTAL DEPOSITS
    // -------------------------------

    const depositsResult =
        await supabaseClient
            .from("deposits")
            .select("amount,status");


    if (depositsResult.error) {

        console.error(
            "Deposits error:",
            depositsResult.error
        );

    }


    const deposits =
        depositsResult.data || [];


    let totalDeposits = 0;

    let pendingDeposits = 0;


    deposits.forEach(function (deposit) {

        const amount =
            Number(deposit.amount) || 0;


        totalDeposits += amount;


        if (deposit.status === "Pending") {

            pendingDeposits++;

        }

    });


    document.getElementById(
        "totalDeposits"
    ).innerText =
        "₹" + totalDeposits.toFixed(2);


    document.getElementById(
        "pendingDeposits"
    ).innerText =
        pendingDeposits;



    // -------------------------------
    // TOTAL WITHDRAWALS
    // -------------------------------

    const withdrawalsResult =
        await supabaseClient
            .from("withdrawals")
            .select("amount,status");


    if (withdrawalsResult.error) {

        console.error(
            "Withdrawals error:",
            withdrawalsResult.error
        );

    }


    const withdrawals =
        withdrawalsResult.data || [];


    let totalWithdrawals = 0;

    let pendingWithdrawals = 0;


    withdrawals.forEach(function (withdrawal) {

        const amount =
            Number(withdrawal.amount) || 0;


        totalWithdrawals += amount;


        if (withdrawal.status === "Pending") {

            pendingWithdrawals++;

        }

    });


    document.getElementById(
        "totalWithdrawals"
    ).innerText =
        "₹" + totalWithdrawals.toFixed(2);


    document.getElementById(
        "pendingWithdrawals"
    ).innerText =
        pendingWithdrawals;



    // -------------------------------
    // TOTAL
