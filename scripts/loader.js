/* =========================================================
   loader.js — fake progress + bar fill + fade out on window load.
   ========================================================= */
(function () {
    const loader = document.querySelector('[data-loader]');
    const progress = document.querySelector('[data-loader-progress]');
    const bar = document.querySelector('[data-loader-bar]');
    if (!loader) return;

    let value = 0;
    const tick = setInterval(() => {
        value = Math.min(value + Math.random() * 10, 92);
        if (progress) progress.textContent = `${Math.floor(value)}%`;
        if (bar) bar.style.width = `${value}%`;
    }, 120);

    const dismiss = () => {
        clearInterval(tick);
        if (progress) progress.textContent = '100%';
        if (bar) bar.style.width = '100%';
        setTimeout(() => loader.classList.add('is-hidden'), 480);
    };

    if (document.readyState === 'complete') {
        dismiss();
    } else {
        window.addEventListener('load', dismiss, { once: true });
        setTimeout(dismiss, 4500);
    }
})();
