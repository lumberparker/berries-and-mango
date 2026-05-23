/* =========================================================
   main.js — small site-wide helpers (year stamp, anchor offset, external links)
   ========================================================= */
(function () {

    // Footer year stamp
    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    // Smooth scroll with header offset for in-page anchors
    const header = document.querySelector('[data-header]');

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (event) => {
            const id = link.getAttribute('href');
            if (!id || id === '#' || id.length < 2) return;

            const target = document.querySelector(id);
            if (!target) return;

            event.preventDefault();

            const offset = (header?.offsetHeight ?? 0) + 12;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // Open external links in new tab
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');

        if (
            href &&
            (
                href.startsWith('http') ||
                href.startsWith('https') ||
                href.startsWith('//') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')
            )
        ) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

})();