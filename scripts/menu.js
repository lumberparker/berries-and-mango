/* =========================================================
   menu.js — toggle the floating menu pill's overlay drawer.
   ========================================================= */
(function () {
    const menu    = document.querySelector('[data-menu]');
    const toggle  = document.querySelector('[data-menu-toggle]');
    const overlay = document.querySelector('[data-menu-overlay]');
    if (!menu || !toggle || !overlay) return;

    const setOpen = (open) => {
        menu.classList.toggle('is-open', open);
        overlay.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => {
        setOpen(!menu.classList.contains('is-open'));
    });

    // Close when a link is clicked
    overlay.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => setOpen(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
            setOpen(false);
        }
    });

    // Click outside overlay content closes (the overlay itself is the backdrop)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) setOpen(false);
    });
})();
