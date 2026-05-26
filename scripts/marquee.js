/* =========================================================
   marquee.js — pause on tab blur + reduced-motion.

   IMPORTANT: applies the pause via a class on the .marquee container
   instead of inline animation-play-state on the track. Inline styles
   would override the CSS :hover pause and prevent hover-to-pause
   from ever working.
   ========================================================= */
(function () {
    const marquees = document.querySelectorAll('.marquee');
    if (!marquees.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = () => {
        const paused = reduce.matches || document.hidden;
        marquees.forEach(m => m.classList.toggle('is-paused', paused));
    };

    apply();
    reduce.addEventListener?.('change', apply);
    document.addEventListener('visibilitychange', apply);
})();
