/* =========================================================
   ripple.js — liquid mango ripple from the tap point.

   Listens to BOTH touchstart (most reliable on iOS Safari) and
   pointerdown for touch pointers (covers everything else). Spawns
   a radial mango gradient at the tap coordinates inside the
   nearest interactive host. Short, fast easing so the animation
   is visible even on navigating links before the page changes.
   ========================================================= */
(function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const SELECTOR = 'a, button, [data-magnetic], .lang__opt, .portfolio__cell, .showcase__link, .viewer__gallery-item';
    const DURATION = 480;

    // Dedupe: touchstart and pointerdown both fire on iOS for the same tap.
    let lastTap = 0;

    function spawn(clientX, clientY, target) {
        const host = (target && target.closest) ? target.closest(SELECTOR) : null;
        if (!host) return;

        const rect = host.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Ripple diameter — large enough to cover the host from any tap point.
        const dx = Math.max(x, rect.width - x);
        const dy = Math.max(y, rect.height - y);
        const radius = Math.sqrt(dx * dx + dy * dy);
        const size = Math.max(radius * 2, 60);

        const hostPos = getComputedStyle(host).position;
        if (hostPos === 'static') host.style.position = 'relative';

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        host.appendChild(ripple);

        // Force a paint so the animation actually fires before navigation.
        // Reading offsetWidth synchronously flushes layout.
        // eslint-disable-next-line no-unused-expressions
        ripple.offsetWidth;

        setTimeout(() => {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, DURATION + 40);
    }

    document.addEventListener('touchstart', (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        lastTap = Date.now();
        spawn(t.clientX, t.clientY, e.target);
    }, { passive: true });

    document.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return;
        // Within 350ms of a touchstart? Already handled.
        if (Date.now() - lastTap < 350) return;
        spawn(e.clientX, e.clientY, e.target);
    }, { passive: true });
})();
