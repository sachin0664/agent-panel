function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (username === "admin" && password === "admin123") {
        message.innerText = "Login successful!";

        setTimeout(function() {
            window.location.href = "admin.html";
        }, 500);
    } else {
        message.innerText = "Invalid username or password.";
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
