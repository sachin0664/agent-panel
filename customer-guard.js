(function () {

    const CUSTOMER_ID_KEY = "sathiPayCustomerId";
    const UID_KEY = "sathiPayUID";
    const INVITE_KEY = "sathiPayInvitationCode";

    async function checkCustomerSession() {

        try {

            if (typeof supabaseClient === "undefined") {

                console.error(
                    "Supabase client not available."
                );

                clearCustomerSession();

                return;
            }


            const {
                data,
                error
            } =
                await supabaseClient.auth.getSession();


            if (error) {

                console.error(
                    "Session check error:",
                    error
                );

                clearCustomerSession();

                return;
            }


            const session =
                data && data.session
                    ? data.session
                    : null;


            if (!session || !session.user) {

                clearCustomerSession();

                return;
            }


            const authUserId =
                session.user.id;


            const localCustomerId =
                localStorage.getItem(
                    CUSTOMER_ID_KEY
                );


            if (!localCustomerId) {

                clearCustomerSession();

                return;
            }


            if (
                String(localCustomerId) !==
                String(authUserId)
            ) {

                console.error(
                    "Customer session mismatch."
                );

                clearCustomerSession();

                return;
            }


            const {
                data: customer,
                error: customerError
            } =
                await supabaseClient
                    .from("customers")
                    .select(`
                        id,
                        uid,
                        invitation_code,
                        status
                    `)
                    .eq(
                        "id",
                        authUserId
                    )
                    .maybeSingle();


            if (customerError) {

                console.error(
                    "Customer verification error:",
                    customerError
                );

                clearCustomerSession();

                return;
            }


            if (!customer) {

                clearCustomerSession();

                return;
            }


            if (
                customer.status &&
                String(customer.status)
                    .toLowerCase() !== "active"
            ) {

                clearCustomerSession();

                return;
            }


            localStorage.setItem(
                CUSTOMER_ID_KEY,
                customer.id
            );


            localStorage.setItem(
                UID_KEY,
                customer.uid || ""
            );


            localStorage.setItem(
                INVITE_KEY,
                customer.invitation_code || ""
            );


            console.log(
                "Sathi Pay customer session verified."
            );

        }

        catch (error) {

            console.error(
                "Customer guard exception:",
                error
            );

            clearCustomerSession();

        }

    }


    function clearCustomerSession() {

        localStorage.removeItem(
            CUSTOMER_ID_KEY
        );

        localStorage.removeItem(
            UID_KEY
        );

        localStorage.removeItem(
            INVITE_KEY
        );

        localStorage.removeItem(
            "sathiPayCustomerName"
        );

        localStorage.removeItem(
            "sathiPayCustomerMobile"
        );


        window.location.href =
            "customer-login.html";

    }


    window.sathiPayLogout =
        async function () {

            try {

                if (
                    typeof supabaseClient !==
                    "undefined"
                ) {

                    await supabaseClient.auth.signOut();

                }

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            clearCustomerSession();

        };


    window.getSathiPayCustomerId =
        function () {

            return localStorage.getItem(
                CUSTOMER_ID_KEY
            );

        };


    checkCustomerSession();

})();
