/* =========================================================
   header.js — scroll-state class + mobile burger toggle.
   ========================================================= */
(function () {
    const header = document.querySelector('[data-header]');
    const burger = document.querySelector('[data-burger]');
    if (!header) return;

    // Sticky background after scroll
    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 16);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    if (burger) {
        burger.addEventListener('click', () => {
            const open = header.classList.toggle('is-menu-open');
            burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            document.body.style.overflow = open ? 'hidden' : '';
        });

        // Close after clicking a link inside the open menu
        header.querySelectorAll('.header__nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (header.classList.contains('is-menu-open')) {
                    header.classList.remove('is-menu-open');
                    burger.setAttribute('aria-label', 'Abrir menú');
                    document.body.style.overflow = '';
                }
            });
        });
    }
})();
