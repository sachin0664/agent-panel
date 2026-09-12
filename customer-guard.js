(function () {
    const CUSTOMER_ID_KEY = "sathiPayCustomerId";
    const UID_KEY = "sathiPayUID";
    const INVITE_KEY = "sathiPayInvitationCode";

    const customerId = localStorage.getItem(CUSTOMER_ID_KEY);

    // Login ke bina protected page access block
    if (!customerId) {
        window.location.href = "login.html";
        return;
    }

    // Global logout helper
    window.sathiPayLogout = function () {
        localStorage.removeItem(CUSTOMER_ID_KEY);
        localStorage.removeItem(UID_KEY);
        localStorage.removeItem(INVITE_KEY);

        window.location.href = "login.html";
    };

    // Current customer ID helper
    window.getSathiPayCustomerId = function () {
        return localStorage.getItem(CUSTOMER_ID_KEY);
    };
})();
