/* =========================================
   SATHI PAY - CUSTOMER GUARD
   FINAL SESSION + SECURITY GUARD
========================================= */

(function(){

    "use strict";


    /* =========================================
       STORAGE KEYS
    ========================================= */

    const CUSTOMER_ID_KEY =
        "sathiPayCustomerId";

    const CUSTOMER_UID_KEY =
        "sathiPayUID";

    const INVITATION_CODE_KEY =
        "sathiPayInvitationCode";

    const SECURITY_ALERT_KEY =
        "sathiPaySecurityAlertShown";


    /* =========================================
       GET CUSTOMER ID
    ========================================= */

    function getCustomerId(){

        const id =
            localStorage.getItem(
                CUSTOMER_ID_KEY
            );

        if(
            id &&
            id.trim() !== ""
        ){
            return id.trim();
        }

        return null;
    }


    /* =========================================
       CUSTOMER SESSION CHECK
       
       IMPORTANT:
       Never remove customer session
       automatically.
    ========================================= */

    function hasCustomerSession(){

        return !!getCustomerId();

    }


    /* =========================================
       CLEAR CUSTOMER SESSION
       
       ONLY REAL LOGOUT USES THIS.
    ========================================= */

    function clearCustomerSession(){

        localStorage.removeItem(
            CUSTOMER_ID_KEY
        );

        localStorage.removeItem(
            CUSTOMER_UID_KEY
        );

        localStorage.removeItem(
            INVITATION_CODE_KEY
        );

        localStorage.removeItem(
            SECURITY_ALERT_KEY
        );

    }


    /* =========================================
       REAL LOGOUT
    ========================================= */

    window.sathiPayLogout =
        function(){

            clearCustomerSession();

            window.location.href =
                "customer-login.html";

        };


    /* =========================================
       REDIRECT LOGIN
    ========================================= */

    function redirectToLogin(){

        window.location.href =
            "customer-login.html";

    }


    /* =========================================
       SECURITY ALERT
       
       SHOW ONLY ONCE FOR CURRENT LOGIN.
       
       localStorage is used instead of
       sessionStorage so browser navigation,
       Back button and page reload cannot
       trigger it repeatedly.
    ========================================= */

    function showSecurityAlertOnce(){

        const customerId =
            getCustomerId();

        if(!customerId){
            return;
        }


        /*
           Customer-specific alert key.
           This means each customer login
           can have its own one-time alert.
        */

        const customerAlertKey =
            SECURITY_ALERT_KEY +
            "_" +
            customerId;


        /*
           Already shown?
        */

        const alreadyShown =
            localStorage.getItem(
                customerAlertKey
            );


        if(alreadyShown === "true"){

            return;

        }


        /*
           Lock immediately.
           This prevents duplicate alerts
           even if the page initializes twice.
        */

        localStorage.setItem(
            customerAlertKey,
            "true"
        );


        /*
           Small delay so page UI loads first.
        */

        setTimeout(
            function(){

                /*
                   Prevent duplicate overlay.
                */

                if(
                    document.getElementById(
                        "sathiSecurityAlert"
                    )
                ){

                    return;

                }


                const overlay =
                    document.createElement(
                        "div"
                    );


                overlay.id =
                    "sathiSecurityAlert";


                overlay.style.position =
                    "fixed";

                overlay.style.inset =
                    "0";

                overlay.style.background =
                    "rgba(0,0,0,.48)";

                overlay.style.display =
                    "flex";

                overlay.style.alignItems =
                    "center";

                overlay.style.justifyContent =
                    "center";

                overlay.style.padding =
                    "20px";

                overlay.style.zIndex =
                    "999999";


                overlay.innerHTML = `

                    <div
                        style="
                            width:100%;
                            max-width:590px;
                            background:#ffffff;
                            border-radius:28px;
                            padding:30px 24px 25px;
                            box-shadow:0 25px 70px rgba(0,0,0,.25);
                            text-align:center;
                            font-family:Arial,Helvetica,sans-serif;
                        "
                    >

                        <div
                            style="
                                width:72px;
                                height:72px;
                                margin:0 auto 18px;
                                border-radius:20px;
                                background:#fff8df;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:42px;
                            "
                        >
                            🔐
                        </div>


                        <h2
                            style="
                                margin:0;
                                color:#17345f;
                                font-size:28px;
                            "
                        >
                            Security Alert
                        </h2>


                        <div
                            style="
                                margin-top:12px;
                                color:#c96b1b;
                                font-size:18px;
                                font-weight:bold;
                                line-height:1.45;
                            "
                        >
                            Never share your OTP or password
                            with anyone.
                        </div>


                        <p
                            style="
                                margin:15px auto 20px;
                                max-width:470px;
                                color:#7a8799;
                                font-size:14px;
                                line-height:1.6;
                            "
                        >
                            Genuine Sathi Pay support will never
                            ask you to reveal your OTP,
                            password or PIN.
                        </p>


                        <div
                            style="
                                text-align:left;
                                background:#fafbfc;
                                border:1px solid #edf0f5;
                                border-radius:18px;
                                padding:16px;
                                margin-bottom:22px;
                                color:#59677c;
                                font-size:13px;
                                line-height:1.7;
                            "
                        >

                            <div>
                                🛡️
                                <b style="color:#d9534f;">
                                    Never share
                                </b>
                                your OTP.
                            </div>


                            <div>
                                🔑
                                Never share your
                                <b style="color:#d9534f;">
                                    password
                                </b>
                                or PIN.
                            </div>


                            <div>
                                🚨
                                If someone asks for these
                                details, do not share them.
                            </div>

                        </div>


                        <button
                            id="sathiSecurityContinue"
                            type="button"
                            style="
                                width:100%;
                                border:0;
                                border-radius:18px;
                                padding:16px;
                                background:linear-gradient(
                                    135deg,
                                    #087ff5,
                                    #12cfa4
                                );
                                color:white;
                                font-size:16px;
                                font-weight:bold;
                                cursor:pointer;
                                box-shadow:
                                    0 8px 20px
                                    rgba(8,127,245,.20);
                            "
                        >
                            I Understand — Continue
                        </button>

                    </div>

                `;


                document.body.appendChild(
                    overlay
                );


                const continueButton =
                    document.getElementById(
                        "sathiSecurityContinue"
                    );


                if(continueButton){

                    continueButton.addEventListener(
                        "click",
                        function(){

                            overlay.remove();

                        }
                    );

                }

            },
            150
        );

    }


    /* =========================================
       PROTECT CUSTOMER PAGE
    ========================================= */

    function protectPage(){

        if(!hasCustomerSession()){

            redirectToLogin();

            return false;

        }

        return true;

    }


    /* =========================================
       INITIALIZE
    ========================================= */

    async function initializeGuard(){

        /*
           localStorage is only a navigation helper.
           The real session must come from Supabase Auth.
           This prevents stale localStorage from opening a
           protected page and fixes RLS failures after refresh.
        */

        const storedCustomerId =
            getCustomerId();

        if(!storedCustomerId){

            redirectToLogin();

            return;

        }


        try{

            /*
               Different customer pages initialize Supabase
               at different points. Reuse the page's client
               when available instead of treating a missing
               global client as a logout.
            */

            const authClient =
                window.supabaseClient ||
                window.db;

            if(
                !authClient ||
                !authClient.auth
            ){

                /*
                   Give page-level Supabase initialization
                   a moment to finish. Never log the customer
                   out just because the client is not ready yet.
                */

                setTimeout(
                    initializeGuard,
                    150
                );

                return;

            }

            const {
                data,
                error
            } =
                await authClient.auth.getUser();

            if(
                error ||
                !data ||
                !data.user ||
                !data.user.id
            ){

                clearCustomerSession();
                await authClient.auth.signOut();

                redirectToLogin();

                return;

            }


            if(
                data.user.id !==
                storedCustomerId
            ){

                clearCustomerSession();

                await supabaseClient.auth.signOut();

                redirectToLogin();

                return;

            }


            /*
               Show security alert only once.
            */

            showSecurityAlertOnce();

        }
        catch(error){

            console.error(
                "Customer session check error:",
                error
            );

            clearCustomerSession();

            try{
                const authClient =
                    window.supabaseClient ||
                    window.db;

                if(
                    authClient &&
                    authClient.auth
                ){
                    await authClient.auth.signOut();
                }
            }catch(_){}

            redirectToLogin();

        }

    }


    /* =========================================
       EXPOSE FUNCTIONS
    ========================================= */

    window.getCustomerId =
        getCustomerId;


    window.sathiPayHasCustomerSession =
        hasCustomerSession;


    window.sathiPayClearCustomerSession =
        clearCustomerSession;


    window.sathiPayProtectPage =
        protectPage;


    /* =========================================
       START
    ========================================= */

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            initializeGuard
        );

    }else{

        initializeGuard();

    }

})();
