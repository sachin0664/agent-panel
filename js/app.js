function login(event) {
    event.preventDefault();

    const mobile = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("loginMessage");

    if (mobile === "9999999999" && password === "Admin@2026Secure") {

        message.innerText = "Login successful!";

        setTimeout(function () {
            window.location.href = "agents.html";
        }, 1000);

    } else {

        message.innerText = "Invalid mobile number or password.";

    }
}
