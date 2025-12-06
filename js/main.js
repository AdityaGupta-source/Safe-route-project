document.addEventListener('DOMContentLoaded', () => {
    const currentLocationBtn = document.getElementById('current-location-btn');
    const startInput = document.getElementById('start-location');
    const findRouteBtn = document.getElementById('find-route-btn');
    const destInput = document.getElementById('destination');
    const suggestionsBox = document.getElementById('suggestions');

    // --- SIDEBAR LOGIC ---
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebarLinks = document.querySelectorAll('#sidebar a, #sidebar button');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
        if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);
        if (overlay) overlay.addEventListener('click', toggleSidebar);
        // Close on link click
        sidebarLinks.forEach(link => {
            link.addEventListener('click', toggleSidebar);
        });
    }

    // --- PROFESSIONAL GSAP ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline();
    // Subtler Hero Entrance
    tl.fromTo('.navbar',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    )
        .fromTo('.hero-content > *',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' },
            '-=0.5'
        )
        .fromTo('.hero-bg-img',
            { opacity: 0, scale: 1.05 },
            { opacity: 0.2, scale: 1, duration: 1.5, ease: 'power2.out' },
            '-=1.0'
        );

    // Subtle Feature Stagger
    gsap.from('.feature-card', {
        scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
    });

    gsap.from('#about .glass', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    // --- REFINED NAVIGATION TRANSITION ---
    function playPageTransition(targetUrl, message) {
        const overlay = document.getElementById('transition-overlay');
        if (!overlay) {
            window.location.href = targetUrl;
            return;
        }

        const icon = overlay.querySelector('i');
        const text = overlay.querySelector('h2');

        if (message) text.innerText = message;

        // 1. Fade in overlay smoothly
        gsap.to(overlay, { opacity: 1, pointerEvents: 'all', duration: 0.4, ease: 'power2.inOut' });

        // 2. Elegant Pulse for Icon
        gsap.fromTo(icon,
            { scale: 0.9, opacity: 0.8 },
            { scale: 1.1, opacity: 1, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' }
        );

        // 3. Simple Text Fade
        gsap.fromTo(text,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.2 }
        );

        // 4. Navigate after short delay
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 1500);
    }

    // Handle "Get Current Location"
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }

            currentLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    sessionStorage.setItem('userLat', latitude);
                    sessionStorage.setItem('userLng', longitude);

                    startInput.value = "Current Location";
                    currentLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                    currentLocationBtn.classList.add('active');
                },
                (error) => {
                    console.error(error);
                    alert('Unable to retrieve your location. Please check permissions.');
                    currentLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                }
            );
        });
    }

    // Autocomplete Logic
    const places = [
        "India Gate, New Delhi",
        "India Gate Circle, Delhi",
        "Indira Gandhi International Airport",
        "Connaught Place, New Delhi",
        "Red Fort, Delhi"
    ];

    if (destInput && suggestionsBox) {
        destInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            suggestionsBox.innerHTML = '';

            if (val.length < 2) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            const filtered = places.filter(p => p.toLowerCase().includes(val));

            if (filtered.length > 0) {
                suggestionsBox.classList.remove('hidden');
                filtered.forEach(place => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>${place}</span>`;
                    div.addEventListener('click', () => {
                        destInput.value = place;
                        suggestionsBox.classList.add('hidden');
                    });
                    suggestionsBox.appendChild(div);
                });
            } else {
                suggestionsBox.classList.add('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!destInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.add('hidden');
            }
        });
    }

    // Handle "Find Safe Route"
    if (findRouteBtn) {
        findRouteBtn.addEventListener('click', () => {
            const destination = destInput.value;
            if (destination) {
                sessionStorage.setItem('routeStart', startInput.value || "Current Location");
                sessionStorage.setItem('routeDest', destination);
                playPageTransition('map.html', 'Navigating to Safe Zone...');
            } else {
                alert('Please select a destination from the list (e.g., India Gate)');
            }
        });
    }

    // Handle Auth Buttons (Login/Register)
    const authBtns = document.querySelectorAll('.nav-auth-btn');
    authBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-href');

            // Button Click Animation
            gsap.to(btn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });

            // Smooth Page Fade Out
            gsap.to('body', {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.inOut',
                onComplete: () => {
                    window.location.href = target;
                }
            });
        });
    });

    // --- REVIEW CAROUSEL ---
    const reviewTrack = document.getElementById('reviews-track');
    const nextReviewBtn = document.getElementById('next-review');
    const prevReviewBtn = document.getElementById('prev-review');

    if (reviewTrack && nextReviewBtn && prevReviewBtn) {
        const getScrollAmount = () => {
            const card = reviewTrack.querySelector('.review-card');
            if (!card) return 300;
            const gap = parseFloat(window.getComputedStyle(reviewTrack).gap) || 0;
            return card.offsetWidth + gap;
        };

        nextReviewBtn.addEventListener('click', () => {
            reviewTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        prevReviewBtn.addEventListener('click', () => {
            reviewTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });
    }

    // --- WRITE REVIEW FORM (MODAL) ---
    const writeReviewBtn = document.getElementById('write-review-btn');
    const reviewForm = document.getElementById('review-form-container');
    const reviewBackdrop = document.getElementById('review-backdrop');
    const closeReviewBtn = document.getElementById('close-review-form');
    const stars = document.querySelectorAll('#review-form-container .fa-star');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    let currentRating = 0;

    function closeReviewModal() {
        if (reviewForm) {
            gsap.to(reviewForm, {
                opacity: 0,
                y: '-40%',
                scale: 0.95,
                duration: 0.2,
                onComplete: () => {
                    reviewForm.classList.add('hidden');
                    gsap.set(reviewForm, { clearProps: "all" });
                }
            });
        }
        if (reviewBackdrop) reviewBackdrop.classList.remove('active');
    }

    function openReviewModal() {
        if (reviewForm) reviewForm.classList.remove('hidden');
        if (reviewBackdrop) reviewBackdrop.classList.add('active');

        gsap.fromTo(reviewForm,
            { opacity: 0, y: '-40%', scale: 0.95 },
            { opacity: 1, y: '-50%', scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
    }

    if (writeReviewBtn && reviewForm) {
        writeReviewBtn.addEventListener('click', openReviewModal);

        if (closeReviewBtn) closeReviewBtn.addEventListener('click', closeReviewModal);
        if (reviewBackdrop) reviewBackdrop.addEventListener('click', closeReviewModal);

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                currentRating = rating;
                stars.forEach(s => {
                    const r = parseInt(s.getAttribute('data-rating'));
                    if (r <= rating) {
                        s.classList.remove('fa-regular');
                        s.classList.add('fa-solid');
                    } else {
                        s.classList.remove('fa-solid');
                        s.classList.add('fa-regular');
                    }
                });
            });
        });

        submitReviewBtn.addEventListener('click', () => {
            // Mock fetching from login logic (or "Anonymous" if not logged in)
            const name = "You";
            const text = document.getElementById('review-text').value;

            if (text && currentRating > 0) {
                const newCard = document.createElement('div');
                newCard.className = 'review-card glass';
                let starHtml = '';
                for (let i = 0; i < 5; i++) {
                    starHtml += i < currentRating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
                }

                newCard.innerHTML = `
                    <div class="stars" style="color: #fbbf24; margin-bottom: 1rem;">${starHtml}</div>
                    <p>"${text}"</p>
                    <div class="user-info">
                        <div class="avatar" style="background: var(--primary);">${name.substring(0, 2).toUpperCase()}</div>
                        <span>${name}</span>
                    </div>
                `;

                if (reviewTrack) reviewTrack.insertBefore(newCard, reviewTrack.firstChild);

                document.getElementById('review-text').value = '';
                currentRating = 0;
                stars.forEach(s => { s.classList.remove('fa-solid'); s.classList.add('fa-regular'); });

                closeReviewModal();
                alert('Review Posted!');
            } else {
                alert('Please write a review and select a rating.');
            }
        });
    }

    // --- DRIVER.JS TOUR ---
    if (window.driver) {
        const driver = window.driver.js.driver;
        const tour = driver({
            showProgress: true,
            steps: [
                { element: '.navbar', popover: { title: 'Navigation', description: 'Access login, registration, and other pages here.' } },
                { element: '.hero h1', popover: { title: 'Welcome to Safe Route', description: 'We help you find the safest path, avoiding dark alleys and construction zones.' } },
                { element: '#start-location', popover: { title: 'Start Point', description: 'Enter your starting location or use the Current Location button.' } },
                { element: '#destination', popover: { title: 'Destination', description: 'Type where you want to go. Try "India Gate"!' } },
                { element: '#find-route-btn', popover: { title: 'Find Route', description: 'Click here to calculate the safest path and view it on the map.' } },
                { element: '.features-grid', popover: { title: 'Key Features', description: 'See what makes our routing engine unique and safe.' } }
            ]
        });

        const startTourBtn = document.getElementById('start-tour-btn');
        if (startTourBtn) {
            startTourBtn.addEventListener('click', () => {
                tour.drive();
            });
        }

        if (!localStorage.getItem('tourSeen')) {
            tour.drive();
            localStorage.setItem('tourSeen', 'true');
        }
    }
});
