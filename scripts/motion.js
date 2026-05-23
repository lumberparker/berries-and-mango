/* =========================================================
   motion.js — custom cursor, scroll-reveal, parallax stickers,
                magnetic CTAs, hero letter wave on hover.
   ========================================================= */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Reveal on scroll ---------- */
    if ('IntersectionObserver' in window) {
        const targets = document.querySelectorAll(
            '.hero__copy, .conoce__heading, .conoce__body, .propiedades__heading, .propiedades__item, ' +
            '.presentaciones__heading, .presentaciones__row, .showcase__heading, .showcase__item, ' +
            '.encuentra__heading, .encuentra__list, .encuentra__form'
        );

        targets.forEach(el => el.classList.add('reveal'));

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => entry.target.classList.add('is-in'), (i % 6) * 60);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        targets.forEach(t => io.observe(t));
    }

    /* ---------- Parallax stickers ---------- */
    if (!reduce) {
        const parallaxItems = Array.from(document.querySelectorAll('[data-parallax]'));
        if (parallaxItems.length) {
            const onScroll = () => {
                const y = window.scrollY;
                parallaxItems.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.2;
                    const rect = el.getBoundingClientRect();
                    const ref = rect.top + y;
                    el.style.translate = `0 ${(y - ref) * speed}px`;
                });
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    }

    /* ---------- Magnetic buttons ---------- */
    if (fine && !reduce) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            const strength = parseFloat(el.dataset.magnetic) || 0.35;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                el.style.translate = `${dx * strength}px ${dy * strength}px`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.translate = '0 0';
            });
        });
    }

    /* ---------- Hero letter wave ---------- */
    document.querySelectorAll('[data-wave] .color-mix__l').forEach((letter, i) => {
        letter.addEventListener('mouseenter', () => {
            letter.classList.add('is-wave');
            setTimeout(() => letter.classList.remove('is-wave'), 600);
        });
    });
})();
