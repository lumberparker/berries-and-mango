/* =========================================================
   ripple.js — liquid mango ripple from the tap point.

   IMPORTANT: ripples are rendered into a fixed body-level overlay,
   NEVER appended to the tapped element. On iOS Safari, mutating an
   interactive element's DOM during a tap can cancel the click/tap.
   The overlay sidesteps that entirely.
   ========================================================= */
(function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const SELECTOR = 'a, button, [data-magnetic], .lang__opt, .portfolio__cell, .showcase__link, .viewer__gallery-item';
    const DURATION = 480;

    // Single portal where every ripple lives. pointer-events:none so
    // it never interferes with taps. Sits above everything visually.
    let overlay = null;
    function ensureOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'ripple-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
        return overlay;
    }

    let lastTap = 0;

    function spawn(clientX, clientY, target) {
        // Only fire if the tap actually landed on something interactive.
        if (!target || !target.closest || !target.closest(SELECTOR)) return;

        const o = ensureOverlay();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        // Size scales with viewport — bigger phone, bigger splash
        const size = Math.max(window.innerWidth, window.innerHeight) * 0.55;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = clientX + 'px';
        ripple.style.top = clientY + 'px';

        o.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, DURATION + 40);
    }

    // touchstart is the most reliable on iOS Safari
    document.addEventListener('touchstart', (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        lastTap = Date.now();
        spawn(t.clientX, t.clientY, e.target);
    }, { passive: true });

    // pointerdown as a fallback for browsers without TouchEvent
    document.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return;
        if (Date.now() - lastTap < 350) return;  // already handled
        spawn(e.clientX, e.clientY, e.target);
    }, { passive: true });
})();
