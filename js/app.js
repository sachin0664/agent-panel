function login(event) {
    event.preventDefault();

    const mobile = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("loginMessage");

    if (mobile === "9999999999" && password === "123456") {
        message.innerText = "Login successful!";

        setTimeout(function () {
            window.location.href = "agents.html";
        }, 500);
    } else {
        message.innerText = "Invalid mobile number or password.";
    }
}
    }
}

function submitDeposit(event) {
    event.preventDefault();

    const agent = document.getElementById("depositAgent").value;
    const amount = document.getElementById("depositAmount").value;

    document.getElementById("depositMessage").innerText =
        "Deposit submitted for " + agent + " : ₹" + amount;
}

function submitWithdrawal(event) {
    event.preventDefault();

    const agent = document.getElementById("withdrawAgent").value;
    const amount = document.getElementById("withdrawAmount").value;

    document.getElementById("withdrawMessage").innerText =
        "Withdrawal submitted for " + agent + " : ₹" + amount;
}
