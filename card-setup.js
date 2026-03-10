document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("card-setup-form");
    const message = document.getElementById("card-form-message");

    const emailLabel = document.getElementById("card-step-email");

    const holderInput = document.getElementById("card-holder-name");
    const numberInput = document.getElementById("card-number");
    const monthInput = document.getElementById("expiry-month");
    const yearInput = document.getElementById("expiry-year");
    const cvvInput = document.getElementById("card-cvv");
    const billingInput = document.getElementById("billing-address");
    const cardTypeInput = document.getElementById("card-type");
    const consentInput = document.getElementById("card-consent");

    const numberPreview = document.getElementById("card-number-preview");
    const holderPreview = document.getElementById("card-holder-preview");
    const expiryPreview = document.getElementById("card-expiry-preview");
    const networkPreview = document.getElementById("card-network-preview");

    const params = new URLSearchParams(window.location.search);
    const email = (params.get("email") || localStorage.getItem("pesopayPendingSignupEmail") || "").toLowerCase();

    const getUsers = () => JSON.parse(localStorage.getItem("pesopayUsers")) || [];
    const saveUsers = (users) => localStorage.setItem("pesopayUsers", JSON.stringify(users));

    const setMessage = (text, type = "") => {
        message.textContent = text;
        message.className = "form-message";
        if (type) {
            message.classList.add(type);
        }
    };

    if (emailLabel && email) {
        emailLabel.textContent = `Complete your setup for ${email} by entering your current debit or credit card details.`;
    }

    const formatCardNumber = (value) => {
        return value
            .replace(/\D/g, "")
            .slice(0, 16)
            .replace(/(.{4})/g, "$1 ")
            .trim();
    };

    const maskCardNumber = (digits) => {
        const clean = digits.replace(/\D/g, "");
        if (!clean) return "•••• •••• •••• ••••";
        const last4 = clean.slice(-4).padStart(4, "•");
        return `•••• •••• •••• ${last4}`;
    };

    const detectCardBrand = (digits) => {
        const clean = digits.replace(/\D/g, "");

        if (/^4/.test(clean)) return "VISA";
        if (/^(5[1-5]|2[2-7])/.test(clean)) return "MASTERCARD";
        if (/^3[47]/.test(clean)) return "AMEX";
        if (/^6/.test(clean)) return "DISCOVER";
        return "CARD";
    };

    const luhnCheck = (digits) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits.charAt(i), 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const updatePreview = () => {
        const rawNumber = numberInput.value.replace(/\D/g, "");
        const cardBrand = detectCardBrand(rawNumber);

        numberPreview.textContent = maskCardNumber(rawNumber);
        holderPreview.textContent = holderInput.value.trim() || "YOUR NAME";
        expiryPreview.textContent = `${monthInput.value || "MM"}/${yearInput.value ? yearInput.value.slice(-2) : "YY"}`;
        networkPreview.textContent = cardBrand;
    };

    if (numberInput) {
        numberInput.addEventListener("input", () => {
            numberInput.value = formatCardNumber(numberInput.value);
            updatePreview();
        });
    }

    [holderInput, monthInput, yearInput].forEach((input) => {
        if (input) {
            input.addEventListener("input", updatePreview);
            input.addEventListener("change", updatePreview);
        }
    });

    if (cvvInput) {
        cvvInput.addEventListener("input", () => {
            cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4);
        });
    }

    updatePreview();

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const holderName = holderInput.value.trim();
        const cardNumber = numberInput.value.replace(/\D/g, "");
        const expiryMonth = monthInput.value;
        const expiryYear = yearInput.value;
        const cvv = cvvInput.value.trim();
        const billingAddress = billingInput.value.trim();
        const cardType = cardTypeInput.value;
        const consent = consentInput.checked;

        if (!email) {
            setMessage("Missing account reference. Please create your account first.", "error");
            return;
        }

        if (!holderName || !cardNumber || !expiryMonth || !expiryYear || !cvv || !billingAddress || !cardType) {
            setMessage("Please complete all required card fields.", "error");
            return;
        }

        if (cardNumber.length < 13 || cardNumber.length > 16) {
            setMessage("Please enter a valid card number.", "error");
            return;
        }

        if (!luhnCheck(cardNumber)) {
            setMessage("The card number appears invalid. Please check and try again.", "error");
            return;
        }

        if (cvv.length < 3 || cvv.length > 4) {
            setMessage("Please enter a valid CVV.", "error");
            return;
        }

        if (!consent) {
            setMessage("You must confirm that the card belongs to you.", "error");
            return;
        }

        const users = getUsers();
        const userIndex = users.findIndex((user) => user.email === email);

        if (userIndex === -1) {
            setMessage("No matching account was found for this card setup step.", "error");
            return;
        }

        const brand = detectCardBrand(cardNumber);
        const last4 = cardNumber.slice(-4);
        const fakeToken = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

        const storedCard = {
            holderName,
            brand,
            last4,
            expiryMonth,
            expiryYear,
            billingAddress,
            cardType,
            token: fakeToken,
            addedAt: new Date().toISOString()
        };

        if (!Array.isArray(users[userIndex].cards)) {
            users[userIndex].cards = [];
        }

        users[userIndex].cards.push(storedCard);
        users[userIndex].cardSetupComplete = true;

        saveUsers(users);
        localStorage.removeItem("pesopayPendingSignupEmail");

        setMessage("Card saved successfully. Redirecting you to login...", "success");
        form.reset();
        updatePreview();

        setTimeout(() => {
            window.location.href = `auth.html?mode=login&email=${encodeURIComponent(email)}&card=success`;
        }, 1200);
    });
});
