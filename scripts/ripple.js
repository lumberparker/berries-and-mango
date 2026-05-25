/* =========================================================
   ripple.js — liquid mango ripple from the tap point.

   Fires on touch (mobile / tablet) only. Spawns a radial mango
   gradient at the tap coordinates inside any interactive host
   (links, buttons, magnetic CTAs, lang options). Scales out and
   fades with a liquid easing curve.
   ========================================================= */
(function () {
    if (typeof window === 'undefined') return;

    const SELECTOR = 'a, button, [data-magnetic], .lang__opt, .portfolio__cell, .showcase__link';
    const RIPPLE_DURATION = 720;

    document.addEventListener('pointerdown', (e) => {
        // Touch-only — keep desktop pristine
        if (e.pointerType !== 'touch') return;

        const host = e.target.closest(SELECTOR);
        if (!host) return;

        // Avoid stacking ripples on rapid taps
        if (host._rippling) return;
        host._rippling = true;
        setTimeout(() => { host._rippling = false; }, RIPPLE_DURATION);

        const rect = host.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Ripple diameter — big enough to cover the whole element from anywhere
        const dx = Math.max(x, rect.width - x);
        const dy = Math.max(y, rect.height - y);
        const radius = Math.sqrt(dx * dx + dy * dy);
        const size = radius * 2;

        // Ensure the host can position the absolute ripple
        const hostStyle = getComputedStyle(host);
        if (hostStyle.position === 'static') {
            host.style.position = 'relative';
        }

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        host.appendChild(ripple);

        // Clean up after the animation
        setTimeout(() => {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, RIPPLE_DURATION + 40);
    }, { passive: true });
})();
