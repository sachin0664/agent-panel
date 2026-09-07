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

                <td>${agent.id}</td>

                <td>${agent.name}</td>

                <td>${agent.mobile}</td>

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

    });

}


// ===============================
// SHOW ADD AGENT FORM
// ===============================

function showAgentForm() {

    const form =
        document.getElementById("agentForm");

    if (!form) {
        return;
    }


    if (form.style.display === "block") {

        form.style.display = "none";

    } else {

        form.style.display = "block";

    }

}


// ===============================
// ADD AGENT
// ===============================

async function addAgent(event) {

    event.preventDefault();


    const name =
        document.getElementById("agentName")
            .value.trim();

    const mobile =
        document.getElementById("agentMobile")
            .value.trim();

    const status =
        document.getElementById("agentStatus")
            .value;

    const message =
        document.getElementById("agentMessage");


    message.innerText = "";


    if (!/^[0-9]{10}$/.test(mobile)) {

        message.innerText =
            "Please enter a valid 10 digit mobile number.";

        return;

    }


    const { error } =
        await supabaseClient
            .from("agents")
            .insert([
                {
                    name: name,
                    mobile: mobile,
                    status: status
                }
            ]);


    if (error) {

        console.error(error);


        if (error.code === "23505") {

            message.innerText =
                "This mobile number already exists.";

        } else {

            message.innerText =
                "Error: " + error.message;

        }

        return;

    }


    message.innerText =
        "Agent added successfully!";


    document.getElementById("agentName").value = "";

    document.getElementById("agentMobile").value = "";

    document.getElementById("agentStatus").value =
        "Active";


    await loadAgents();


    setTimeout(function () {

        document.getElementById("agentForm")
            .style.display = "none";

        message.innerText = "";

    }, 1000);

}


// ===============================
// DELETE AGENT
// ===============================

async function deleteAgent(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this agent?"
        );


    if (!confirmDelete) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("agents")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Error deleting agent: " +
            error.message
        );

        return;

    }


    alert(
        "Agent deleted successfully!"
    );


    await loadAgents();

}


// ===============================
// ADMIN DASHBOARD
// ===============================

async function loadAdminDashboard() {

    // -------------------------------
    // TOTAL AGENTS
    // -------------------------------

    const { count: agentCount, error: agentError } =
        await supabaseClient
            .from("agents")
            .select("*", {
                count: "exact",
                head: true
            });


    if (!agentError) {

        const totalAgents =
            document.getElementById("totalAgents");

        if (totalAgents) {

            totalAgents.innerText =
                agentCount || 0;

        }

    } else {

        console.error(
            "Agent count error:",
            agentError
        );

    }


    // -------------------------------
    // DEPOSITS
    // -------------------------------

    const { data: deposits, error: depositError } =
        await supabaseClient
            .from("deposits")
            .select("amount, status");


    if (!depositError && deposits) {

        let totalDeposit = 0;

        let pendingDeposit = 0;


        deposits.forEach(function (deposit) {

            totalDeposit +=
                Number(deposit.amount || 0);


            if (
                deposit.status === "Pending"
            ) {

                pendingDeposit++;

            }

        });


        const totalDeposits =
            document.getElementById(
                "totalDeposits"
            );

        const pendingDeposits =
            document.getElementById(
                "pendingDeposits"
            );


        if (totalDeposits) {

            totalDeposits.innerText =
                "₹" +
                totalDeposit.toLocaleString(
                    "en-IN"
                );

        }


        if (pendingDeposits) {

            pendingDeposits.innerText =
                pendingDeposit;

        }

    } else {

        console.error(
            "Deposit error:",
            depositError
        );

    }


    // -------------------------------
    // WITHDRAWALS
    // -------------------------------

    const {
        data: withdrawals,
        error: withdrawalError
    } =
        await supabaseClient
            .from("withdrawals")
            .select("amount, status");


    if (
        !withdrawalError &&
        withdrawals
    ) {

        let totalWithdrawal = 0;

        let pendingWithdrawal = 0;


        withdrawals.forEach(
            function (withdrawal) {

                totalWithdrawal +=
                    Number(
                        withdrawal.amount || 0
                    );


                if (
                    withdrawal.status ===
                    "Pending"
                ) {

                    pendingWithdrawal++;

                }

            }
        );


        const totalWithdrawals =
            document.getElementById(
                "totalWithdrawals"
            );

        const pendingWithdrawals =
            document.getElementById(
                "pendingWithdrawals"
            );


        if (totalWithdrawals) {

            totalWithdrawals.innerText =
                "₹" +
                totalWithdrawal.toLocaleString(
                    "en-IN"
                );

        }


        if (pendingWithdrawals) {

            pendingWithdrawals.innerText =
                pendingWithdrawal;

        }

    } else {

        console.error(
            "Withdrawal error:",
            withdrawalError
        );

    }


    // -------------------------------
    // COMMISSION
    // -------------------------------
    // Commission system abhi
    // database me setup nahi hai.
    // Isliye फिलहाल ₹0 rahega.

    const totalCommission =
        document.getElementById(
            "totalCommission"
        );

    if (totalCommission) {

        totalCommission.innerText =
            "₹0";

    }

}


// ===============================
// START ADMIN DASHBOARD
// ===============================

if (
    document.getElementById(
        "totalAgents"
    )
) {

    loadAdminDashboard();

}


// ===============================
// AUTO LOAD AGENTS PAGE
// ===============================

if (
    document.getElementById(
        "agentTable"
    )
) {

    loadAgents();

        }
