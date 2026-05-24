/* =========================================================
   showcase.js — fill the homepage Showcase from projects.json.

   Selection rules:
     1. If any projects have showcase=true → show those (capped at 6).
     2. If none are flagged → pick 6 at random.

   Clicking a tile deep-links to portfolio.html#<id>, which opens
   the project's modal carousel.
   ========================================================= */
(function () {
    const grid = document.querySelector('[data-showcase]');
    if (!grid) return;

    const MAX = 6;
    const shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const isEnglish = (window.BM_LANG === 'en') || location.pathname.indexOf('/en/') === 0;
    const projectsUrl = isEnglish ? '/assets/jsons/projects.en.json' : '/assets/jsons/projects.json';
    const abs = (s) => !s ? s : (s.startsWith('http') || s.startsWith('/') || s.startsWith('data:')) ? s : '/' + s;
    fetch(projectsUrl)
        .then(res => {
            if (!res.ok) throw new Error('Cannot load projects.json');
            return res.json();
        })
        .then(({ projects }) => {
            const flagged = projects.filter(p => p.showcase === true);
            const pool = flagged.length > 0 ? flagged : shuffle(projects);
            const featured = pool.slice(0, MAX);

            grid.innerHTML = featured.map(p => `
                <li class="showcase__item ${p.size === 'lg' ? 'showcase__item--lg' : ''}">
                    <a class="showcase__link" href="${isEnglish ? '/en/portfolio.html' : '/portfolio.html'}#${encodeURIComponent(p.id)}" aria-label="${p.title} — ${p.category}">
                        <div class="showcase__media">
                            <img src="${abs(p.showcaseImage || p.thumb)}" alt="${p.title}" loading="lazy">
                        </div>
                        <div class="showcase__overlay">
                            <span class="showcase__overlay-title">${p.title}</span>
                            <span class="showcase__overlay-tag">${p.tag}</span>
                        </div>
                    </a>
                    <div class="showcase__meta">
                        <span class="showcase__client">${p.client}</span>
                        <span class="showcase__type">${p.category}</span>
                    </div>
                </li>
            `).join('');

            document.dispatchEvent(new CustomEvent('showcase:ready'));
        })
        .catch(err => {
            console.error('[showcase]', err);
            grid.innerHTML = `<li class="showcase__error">${isEnglish ? "Couldn't load the portfolio." : 'No se pudo cargar el portafolio.'}</li>`;
        });
})();
