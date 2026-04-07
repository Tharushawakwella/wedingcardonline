/* ============================================================ */
/*  SAHAN & SAFNI — Premium Wedding Invitation v2.0            */
/*  script.js — All interactive logic                          */
/* ============================================================ */

// ─── ELEMENT REFS ────────────────────────────────────────────
const splashScreen  = document.getElementById('splash-screen');
const mainContent   = document.getElementById('main-content');
const audio         = document.getElementById('bg-music');
const musicToggle   = document.getElementById('music-toggle');
const musicIcon     = document.getElementById('music-icon');

// Lock scroll while splash is visible
document.body.classList.add('splash-open');

// ─── ADMIN: Clipboard Copy ───────────────────────────────────
function copyLink() {
    const linkElement = document.getElementById('generatedLinkText');
    if (!linkElement) return;

    const linkText = linkElement.textContent;
    navigator.clipboard.writeText(linkText).then(() => {
        const msg = document.getElementById('copyMessage');
        if (msg) {
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
    }).catch(() => {
        alert('Failed to copy automatically. Please select and copy the link manually.');
    });
}

// ─── ENVELOPE OPENING ────────────────────────────────────────
function openInvitation() {
    if (!splashScreen) return;

    // 1. Trigger the flap/seal animation
    splashScreen.classList.add('opening');

    // 2. After animation, reveal main content
    setTimeout(() => {
        splashScreen.classList.add('hidden');

        // Unlock body scroll
        document.body.classList.remove('splash-open');

        // Two-step reveal: first set display:block, then on next frame fade in
        mainContent.classList.add('reveal');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                mainContent.classList.add('visible');
            });
        });

        // Show music button
        if (musicToggle) musicToggle.classList.add('visible');

        // Attempt auto-play music
        if (audio) {
            audio.play().then(() => {
                musicIcon.classList.replace('fa-play', 'fa-music');
                musicToggle.classList.add('playing');
            }).catch(() => {
                // Browser blocked autoplay — user can click the toggle manually
                console.log('Autoplay blocked by browser. Use the music toggle.');
            });
        }

        // Init particles after reveal
        initParticles();

        // Init countdown
        initCountdown();

        // Trigger fade-up animations for visible elements
        triggerFadeUps();

    }, 900);
}

// ─── MUSIC TOGGLE ────────────────────────────────────────────
function toggleMusic() {
    if (!audio) return;

    if (audio.paused) {
        audio.play();
        musicIcon.classList.replace('fa-play', 'fa-music');
        musicToggle.classList.add('playing');
    } else {
        audio.pause();
        musicIcon.classList.replace('fa-music', 'fa-play');
        musicToggle.classList.remove('playing');
    }
}

// ─── FADE-UP SCROLL ANIMATIONS ───────────────────────────────
function triggerFadeUps() {
    const fadeEls = document.querySelectorAll('.fade-up');
    if (!fadeEls.length) return;

    // Wait 300ms for the browser to fully paint display:block layout
    setTimeout(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,          // Fire as soon as ANY pixel enters viewport
            rootMargin: '0px 0px 60px 0px' // Pre-trigger 60px before entering
        });

        fadeEls.forEach(el => observer.observe(el));
    }, 300);
}

// ─── LIVE COUNTDOWN TIMER ────────────────────────────────────
function initCountdown() {
    const weddingDate = new Date('May 25, 2026 10:00:00').getTime();

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-minutes');
    const sEl = document.getElementById('cd-seconds');

    if (!dEl) return;

    const pad  = n => String(n).padStart(2, '0');

    // Flip animation helper
    function flipUpdate(el, newVal) {
        const formatted = pad(newVal);
        if (el.textContent !== formatted) {
            el.classList.add('flip');
            el.textContent = formatted;
            el.addEventListener('animationend', () => el.classList.remove('flip'), { once: true });
        }
    }

    const timer = setInterval(() => {
        const distance = weddingDate - Date.now();

        if (distance <= 0) {
            clearInterval(timer);
            [dEl, hEl, mEl, sEl].forEach(el => { if (el) el.textContent = '00'; });
            return;
        }

        flipUpdate(dEl, Math.floor(distance / 86400000));
        flipUpdate(hEl, Math.floor((distance % 86400000) / 3600000));
        flipUpdate(mEl, Math.floor((distance % 3600000)  / 60000));
        flipUpdate(sEl, Math.floor((distance % 60000)    / 1000));
    }, 1000);
}

// ─── PHOTO CAROUSEL ──────────────────────────────────────────
function initCarousel() {
    const track   = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dots    = document.querySelectorAll('.carousel-dot');

    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    const total  = slides.length;
    let current  = 0;
    let autoTimer;

    function goTo(index) {
        current = ((index % total) + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function startAuto() {
        autoTimer = setInterval(() => goTo(current + 1), 4500);
    }

    function resetAuto() {
        clearInterval(autoTimer);
        startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goTo(parseInt(dot.dataset.index, 10));
            resetAuto();
        });
    });

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
    }, { passive: true });

    startAuto();
}

// ─── PARTICLES (Gold Sparkle Effect) ─────────────────────────
function initParticles() {
    if (typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
        particles: {
            number:  { value: 45, density: { enable: true, value_area: 900 } },
            color:   { value: ['#D4AF37', '#C9956C', '#E8C4A0'] },
            shape:   { type: 'circle' },
            opacity: { value: 0.55, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.1 } },
            size:    { value: 3.5, random: true },
            line_linked: { enable: false },
            move: {
                enable:    true,
                speed:     1.2,
                direction: 'bottom',
                random:    true,
                straight:  false,
                out_mode:  'out',
                bounce:    false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: false },
                onclick: { enable: false },
                resize:  true
            }
        },
        retina_detect: true
    });
}

// ─── INIT ON DOM READY ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Wire carousel (ready immediately on DOM load)
    initCarousel();
});
