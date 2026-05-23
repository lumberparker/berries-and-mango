/* =========================================================
   marquee.js — pause on tab blur, respect reduced motion.
   ========================================================= */
(function () {
    const track = document.querySelector('[data-marquee]');
    if (!track) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
        track.style.animationPlayState = reduce.matches ? 'paused' : 'running';
    };
    apply();
    reduce.addEventListener?.('change', apply);

    document.addEventListener('visibilitychange', () => {
        track.style.animationPlayState =
            (document.hidden || reduce.matches) ? 'paused' : 'running';
    });
})();
