/* =========================================================
   loader.js — fake progress + bar fill + fade out.

   The loader is `pointer-events: none` from CSS, so taps already
   pass through it. We still try to dismiss as fast as possible so
   it's visually out of the way. Triggers in this order:
     1. window.load if it's already fired
     2. window.load event
     3. DOMContentLoaded + 400ms (covers slow image loads)
     4. 3.5s safety timeout
   ========================================================= */
(function () {
    const loader = document.querySelector('[data-loader]');
    const progress = document.querySelector('[data-loader-progress]');
    const bar = document.querySelector('[data-loader-bar]');
    if (!loader) return;

    let value = 0;
    let ticking = true;
    const tick = setInterval(() => {
        if (!ticking) return;
        value = Math.min(value + Math.random() * 14, 92);
        if (progress) progress.textContent = `${Math.floor(value)}%`;
        if (bar) bar.style.width = `${value}%`;
    }, 90);

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        ticking = false;
        clearInterval(tick);
        if (progress) progress.textContent = '100%';
        if (bar) bar.style.width = '100%';
        // Brief beat so users see "100%" before fade, then hide
        setTimeout(() => loader.classList.add('is-hidden'), 180);
    };

    if (document.readyState === 'complete') {
        dismiss();
    } else {
        window.addEventListener('load', dismiss, { once: true });
        // If DOM is ready but assets are slow, dismiss anyway after 400ms
        if (document.readyState === 'interactive') {
            setTimeout(dismiss, 400);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(dismiss, 400);
            }, { once: true });
        }
        // Final safety net
        setTimeout(dismiss, 3500);
    }
})();
