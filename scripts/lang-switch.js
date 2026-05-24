/* =========================================================
   lang-switch.js — handle manual language toggle.

   Any <a data-lang-switch="es|en"> click sets localStorage so the
   auto-redirect respects the user's explicit choice on future visits.
   ========================================================= */
(function () {
    document.addEventListener('click', function (e) {
        const link = e.target.closest('[data-lang-switch]');
        if (!link) return;
        try {
            localStorage.setItem('bm-lang', link.dataset.langSwitch);
        } catch (err) { /* private mode etc — fine */ }
        // Allow the link's default navigation to happen.
    });
})();
