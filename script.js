document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Hamburger Menu Toggle
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("open");

            const isExpanded = hamburger.classList.contains("open");
            hamburger.setAttribute("aria-expanded", isExpanded);
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                hamburger.classList.remove("open");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });
    }

    // 2. Sticky Navbar Scroll Effect
    const navbar = document.getElementById("navbar");

    const handleNavbarScroll = () => {
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    window.addEventListener("scroll", handleNavbarScroll);
    handleNavbarScroll();

    // 3. FAQ Accordion Logic
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        if (!question || !answer) return;

        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            faqItems.forEach((faq) => {
                const faqQuestion = faq.querySelector(".faq-question");
                const faqAnswer = faq.querySelector(".faq-answer");

                faq.classList.remove("active");
                if (faqQuestion) faqQuestion.setAttribute("aria-expanded", "false");
                if (faqAnswer) faqAnswer.style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add("active");
                question.setAttribute("aria-expanded", "true");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // 4. Number Counter Animation
    const animatedCounters = new WeakSet();

    const animateCounter = (counter) => {
        if (animatedCounters.has(counter)) return;
        animatedCounters.add(counter);

        const target = Number(counter.getAttribute("data-target")) || 0;
        let current = 0;
        const duration = 1800;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            current = Math.floor(target * easedProgress);
            counter.innerText = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };

        requestAnimationFrame(update);
    };

    // 5. Scroll Intersection Observer
    const fadeElements = document.querySelectorAll(".fade-in");

    const observerOptions = {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");

                if (entry.target.classList.contains("counter")) {
                    animateCounter(entry.target);
                }

                const counters = entry.target.querySelectorAll(".counter");
                counters.forEach((counter) => animateCounter(counter));

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach((el) => {
        scrollObserver.observe(el);
    });

    document.querySelectorAll(".counter").forEach((counter) => {
        scrollObserver.observe(counter);
    });

    // 6. Promo Carousel Auto-Slider
    const track = document.getElementById("carouselTrack");

    if (track) {
        const slides = Array.from(track.children);
        let slideIndex = 0;

        if (slides.length > 1) {
            setInterval(() => {
                slideIndex = (slideIndex + 1) % slides.length;
                track.style.transform = `translateX(-${slideIndex * 100}%)`;
            }, 4000);
        }
    }

    // 7. Newsletter Form Mock Submission
    const newsletterForm = document.getElementById("newsletter-form");
    const formMessage = document.getElementById("form-message");
    const emailInput = document.getElementById("email-input");

    if (newsletterForm && formMessage && emailInput) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const emailValue = emailInput.value.trim();

            if (emailValue) {
                formMessage.textContent = "Thanks for subscribing! Check your inbox soon.";
                formMessage.style.color = "#4ade80";
                formMessage.style.fontSize = "0.95rem";
                newsletterForm.reset();

                setTimeout(() => {
                    formMessage.textContent = "";
                }, 5000);
            }
        });
    }
});
