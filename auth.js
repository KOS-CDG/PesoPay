document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".auth-panel");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    const loginMessage = document.getElementById("login-message");
    const signupMessage = document.getElementById("signup-message");

    const toggleButtons = document.querySelectorAll(".toggle-password");

    const GOOGLE_PLACEHOLDER_MESSAGE = "Google sign-in UI is ready. Connect Google OAuth or Firebase to make it live.";
    const FACEBOOK_PLACEHOLDER_MESSAGE = "Facebook sign-in UI is ready. Connect Facebook Login SDK to make it live.";
    const EMAIL_PLACEHOLDER_MESSAGE = "Use the email form fields below to continue.";

    const getUsers = () => {
        return JSON.parse(localStorage.getItem("pesopayUsers")) || [];
    };

    const saveUsers = (users) => {
        localStorage.setItem("pesopayUsers", JSON.stringify(users));
    };

    const setMessage = (element, message, type = "") => {
        if (!element) return;
        element.textContent = message;
        element.className = "form-message";
        if (type) {
            element.classList.add(type);
        }
    };

    const switchTab = (targetId) => {
        tabButtons.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.target === targetId);
        });

        panels.forEach((panel) => {
            panel.classList.toggle("active", panel.id === targetId);
        });
    };

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            switchTab(btn.dataset.target);
        });
    });

    toggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;

            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            btn.textContent = isPassword ? "Hide" : "Show";
        });
    });

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const prefilledEmail = params.get("email");
    const cardStatus = params.get("card");

    if (mode === "signup") {
        switchTab("signup-panel");
    } else {
        switchTab("login-panel");
    }

    const loginIdentifier = document.getElementById("login-identifier");
    if (prefilledEmail && loginIdentifier) {
        loginIdentifier.value = prefilledEmail;
    }

    if (cardStatus === "success") {
        setMessage(loginMessage, "Card details saved successfully. You can now log in.", "success");
        switchTab("login-panel");
    }

    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const firstName = document.getElementById("first-name").value.trim();
            const lastName = document.getElementById("last-name").value.trim();
            const email = document.getElementById("signup-email").value.trim().toLowerCase();
            const mobile = document.getElementById("signup-mobile").value.trim();
            const birthdate = document.getElementById("birthdate").value;
            const civilStatus = document.getElementById("civil-status").value;
            const address = document.getElementById("address").value.trim();
            const password = document.getElementById("signup-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            const termsCheck = document.getElementById("terms-check").checked;

            if (!firstName || !lastName || !email || !mobile || !birthdate || !civilStatus || !address || !password || !confirmPassword) {
                setMessage(signupMessage, "Please complete all required fields.", "error");
                return;
            }

            if (password.length < 8) {
                setMessage(signupMessage, "Password must be at least 8 characters long.", "error");
                return;
            }

            if (password !== confirmPassword) {
                setMessage(signupMessage, "Passwords do not match.", "error");
                return;
            }

            if (!termsCheck) {
                setMessage(signupMessage, "You must agree to the terms before creating an account.", "error");
                return;
            }

            const users = getUsers();

            const alreadyExists = users.some(
                (user) => user.email === email || user.mobile === mobile
            );

            if (alreadyExists) {
                setMessage(signupMessage, "An account with this email or mobile number already exists.", "error");
                return;
            }

            const newUser = {
                firstName,
                lastName,
                email,
                mobile,
                birthdate,
                civilStatus,
                address,
                password,
                cardSetupComplete: false,
                cards: []
            };

            users.push(newUser);
            saveUsers(users);

            localStorage.setItem("pesopayPendingSignupEmail", email);

            setMessage(
                signupMessage,
                "Account created. Opening the card setup step in a new tab...",
                "success"
            );

            setTimeout(() => {
                window.open(`card-setup.html?email=${encodeURIComponent(email)}`, "_blank", "noopener,noreferrer");
            }, 400);

            setTimeout(() => {
                switchTab("login-panel");
                if (loginIdentifier) {
                    loginIdentifier.value = email;
                }
                setMessage(loginMessage, "Your account was created. Complete the card step in the new tab, then log in here.", "success");
            }, 900);

            signupForm.reset();
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const identifier = document.getElementById("login-identifier").value.trim().toLowerCase();
            const password = document.getElementById("login-password").value;

            if (!identifier || !password) {
                setMessage(loginMessage, "Please enter your email/mobile number and password.", "error");
                return;
            }

            const users = getUsers();

            const matchedUser = users.find((user) => {
                return (
                    (user.email === identifier || user.mobile === identifier) &&
                    user.password === password
                );
            });

            if (!matchedUser) {
                setMessage(loginMessage, "Invalid login credentials. Please try again.", "error");
                return;
            }

            localStorage.setItem("pesopayCurrentUser", JSON.stringify(matchedUser));

            if (matchedUser.cardSetupComplete) {
                setMessage(loginMessage, `Welcome back, ${matchedUser.firstName}! Login successful.`, "success");
            } else {
                setMessage(
                    loginMessage,
                    `Welcome back, ${matchedUser.firstName}. Your account is active, but card setup is not yet complete.`,
                    "success"
                );
            }

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        });
    }

    const socialButtons = [
        "google-login-btn",
        "facebook-login-btn",
        "quick-email-btn",
        "google-signup-btn",
        "facebook-signup-btn",
        "email-signup-btn"
    ];

    socialButtons.forEach((id) => {
        const button = document.getElementById(id);
        if (!button) return;

        button.addEventListener("click", () => {
            const targetMessage = id.includes("signup") ? signupMessage : loginMessage;

            if (id.includes("google")) {
                setMessage(targetMessage, GOOGLE_PLACEHOLDER_MESSAGE, "success");
            } else if (id.includes("facebook")) {
                setMessage(targetMessage, FACEBOOK_PLACEHOLDER_MESSAGE, "success");
            } else {
                setMessage(targetMessage, EMAIL_PLACEHOLDER_MESSAGE, "success");
            }
        });
    });
});
