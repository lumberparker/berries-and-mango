/* =========================================================
   loader.js — fast splash, hide as soon as the page is interactive.

   Strategy:
     - Loader is pointer-events:none in CSS, so it never blocks taps.
     - Fire .is-hidden the instant the DOM is parsed (rAF after
       DOMContentLoaded or immediately if we're already past it).
     - Backups: window.load, +400ms safety, +2500ms hard ceiling.
   ========================================================= */
(function () {
    const loader = document.querySelector('[data-loader]');
    if (!loader) return;

    const progress = document.querySelector('[data-loader-progress]');
    const bar = document.querySelector('[data-loader-bar]');

    let value = 0;
    let ticking = true;
    const tick = setInterval(() => {
        if (!ticking) return;
        value = Math.min(value + Math.random() * 24, 96);
        if (progress) progress.textContent = `${Math.floor(value)}%`;
        if (bar) bar.style.width = `${value}%`;
    }, 70);

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        ticking = false;
        clearInterval(tick);
        if (progress) progress.textContent = '100%';
        if (bar) bar.style.width = '100%';
        // Immediately start the fade. CSS handles the 280ms opacity
        // transition; once that's done visibility flips to hidden.
        requestAnimationFrame(() => loader.classList.add('is-hidden'));
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM is already parsed — dismiss next frame
        requestAnimationFrame(dismiss);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            requestAnimationFrame(dismiss);
        }, { once: true });
    }

    // Safety nets — never let the loader linger
    window.addEventListener('load', dismiss, { once: true });
    setTimeout(dismiss, 2500);
})();
