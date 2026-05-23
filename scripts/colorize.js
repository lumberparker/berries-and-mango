/* =========================================================
   colorize.js — auto-color multi-letter text.

   Any element with [data-color-mix] has its text replaced with
   per-letter spans cycling through the brand palette, while
   wrapping each word in .color-mix__w so letters never break
   mid-word. Optional [data-color-mix="mango,pink,..."] for a
   custom rotation.
   ========================================================= */
(function () {
    const DEFAULT_COLORS = [
        'mango', 'coral', 'mint', 'pink', 'sky', 'violet', 'rust', 'peach'
    ];

    document.querySelectorAll('[data-color-mix]').forEach(el => {
        const palette = (el.dataset.colorMix || '').trim();
        const colors = palette ? palette.split(',').map(s => s.trim()) : DEFAULT_COLORS;

        const text = el.textContent;
        el.textContent = '';
        el.classList.add('color-mix');

        let ci = 0;
        const tokens = text.split(/(\s+)/); // keep whitespace

        tokens.forEach(token => {
            if (!token) return;
            if (/^\s+$/.test(token)) {
                el.appendChild(document.createTextNode(' '));
                return;
            }
            const word = document.createElement('span');
            word.className = 'color-mix__w';
            Array.from(token).forEach(ch => {
                const letter = document.createElement('span');
                letter.className = `color-mix__l color-mix__l--${colors[ci % colors.length]}`;
                letter.textContent = ch;
                word.appendChild(letter);
                ci++;
            });
            el.appendChild(word);
        });
    });
})();
