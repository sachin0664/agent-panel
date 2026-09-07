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
// LOGIN
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

        message.innerText = "Login successful!";

        setTimeout(function () {

            window.location.href = "agents.html";

        }, 1000);

    } else {

        message.innerText =
            "Invalid mobile number or password.";

    }

}


// ===============================
// ADMIN DASHBOARD
// ===============================

async function loadAdminDashboard() {

    const totalAgentsElement =
        document.getElementById("totalAgents");

    if (!totalAgentsElement) {
        return;
    }


    // -------------------------------
    // AGENTS
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

        return;

    }


    const totalAgents =
        agentsResult.data
            ? agentsResult.data.length
            : 0;


    document.getElementById(
        "totalAgents"
    ).innerText = totalAgents;


    // -------------------------------
    // DEPOSITS
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
    // WITHDRAWALS
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
    // COMMISSION 10%
    // -------------------------------

    const totalCommission =
        totalDeposits * COMMISSION_RATE;


    document.getElementById(
        "totalCommission"
    ).innerText =
        "₹" + totalCommission.toFixed(2);

}


// ===============================
// LOAD AGENTS
// ===============================

async function loadAgents() {

    const table =
        document.getElementById("agentTable");

    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="5">
                Loading agents...
            </td>
        </tr>
    `;


    const { data, error } =
        await supabaseClient
            .from("agents")
            .select("*")
            .order("id", {
                ascending: true
            });


    if (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Error loading agents.
                </td>
            </tr>
        `;

        return;
    }


    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    No agents found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = "";


    data.forEach(function (agent) {

        const statusClass =
            agent.status === "Active"
                ? "active"
                : "inactive";


        table.innerHTML += `

            <tr>

                <td>
                    ${agent.id}
                </td>

                <td>
                    ${agent.name}
                </td>

                <td>
                    ${agent.mobile}
                </td>

                <td class="${statusClass}">
                    ${agent.status}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteAgent(${agent.id})"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;
