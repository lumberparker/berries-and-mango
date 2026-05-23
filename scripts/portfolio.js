/* =========================================================
   portfolio.js — dense dark grid + immersive project viewer.

   Card hover  → title + date overlay
   Card click  → opens fullscreen viewer for that project
   Viewer:
     · mini-portfolio gallery of all media (grid)
     · click any cell → fullscreen lightbox w/ prev/next
     · creator card hover-reveals bio + Trabaja conmigo
     · prev / next project (side bleeds + bottom-right button)
     · details panel toggle (slide-up from bottom)
     · grid icon / Esc closes
   Deep-link with #<project-id>
   ========================================================= */
(function () {
    const grid    = document.querySelector('[data-portfolio]');
    const filters = document.querySelector('[data-filters]');
    const viewer  = document.querySelector('[data-viewer]');
    if (!grid || !viewer) return;

    /* ---------- DOM refs ---------- */
    const galleryEl   = viewer.querySelector('[data-gallery]');
    const titleEl     = viewer.querySelector('[data-title]');
    const descEl      = viewer.querySelector('[data-desc]');
    const clientEl    = viewer.querySelector('[data-client]');
    const categoryEl  = viewer.querySelector('[data-category]');
    const dateEl      = viewer.querySelector('[data-date]');
    const behanceEl   = viewer.querySelector('[data-behance]');
    const detailsBtn  = viewer.querySelector('[data-details-toggle]');
    const closeBtns   = viewer.querySelectorAll('[data-close]');
    const creatorEl   = viewer.querySelector('[data-creator]');
    const creatorBtn  = viewer.querySelector('[data-creator-toggle]');
    const prevProjBtn = viewer.querySelector('.viewer__bleed--prev[data-prev-project]');
    const nextProjBtn = viewer.querySelector('.viewer__bleed--next[data-next-project]');
    const nextBtn     = viewer.querySelector('.viewer__next[data-next-project]');
    const prevThumb   = viewer.querySelector('[data-prev-thumb]');
    const nextThumb   = viewer.querySelector('[data-next-thumb]');
    const nextThumbBl = viewer.querySelector('[data-next-thumb-bleed]');

    /* ---------- Lightbox refs ---------- */
    const lightbox     = document.querySelector('[data-lightbox]');
    const lightboxStage   = lightbox && lightbox.querySelector('[data-lightbox-stage]');
    const lightboxClose   = lightbox && lightbox.querySelector('[data-lightbox-close]');
    const lightboxPrev    = lightbox && lightbox.querySelector('[data-lightbox-prev]');
    const lightboxNext    = lightbox && lightbox.querySelector('[data-lightbox-next]');
    const lightboxCounter = lightbox && lightbox.querySelector('[data-lightbox-counter]');

    let projects     = [];
    let visible      = [];
    let activeIndex  = -1;
    let activeMedia  = [];
    let lightboxIdx  = -1;

    /* ---------- Load ---------- */
    fetch('assets/jsons/projects.json')
        .then(res => res.json())
        .then(data => {
            projects = data.projects;
            visible = projects;
            renderGrid(visible);
            buildFilters(projects);
            handleHash();
        })
        .catch(err => {
            console.error('[portfolio]', err);
            grid.innerHTML = '<li class="portfolio__error">No se pudo cargar el portafolio.</li>';
        });

    /* ---------- Grid render ---------- */
    function renderGrid(list) {
        grid.innerHTML = list.map((p, i) => `
            <li class="portfolio__item" data-id="${p.id}" style="--delay:${i * 50}ms">
                <button class="portfolio__cell" type="button" data-open="${p.id}" aria-label="Abrir ${p.title}">
                    ${cellMedia(p)}
                    <div class="portfolio__overlay">
                        <span class="portfolio__overlay-title">${p.title}</span>
                        <span class="portfolio__overlay-date">${p.date || p.year || ''}</span>
                    </div>
                </button>
            </li>
        `).join('');

        // After render, decide per-cell whether to cover or contain the
        // image. Tall / portrait / square-ish images fill the cell.
        // Significantly wider images shrink to contain + the cell takes on
        // the image's edge color as a seamless mask.
        grid.querySelectorAll('.portfolio__cell img').forEach(adaptCellImage);
    }

    /* Cell-fit + edge-color mask. Only letterbox an image when it's BOTH
       significantly wider than the cell AND has a uniform edge color
       (i.e. a logo / flat-bg design). Photos with varied edges always
       fill the cell. */
    const CELL_RATIO = 3 / 4;                  // .portfolio__cell aspect-ratio
    const WIDE_THRESHOLD = CELL_RATIO * 1.25;  // ratio > ~0.94 is "wide"
    const SOLID_BG_STDDEV = 22;                // edge variance below this = solid bg

    function adaptCellImage(img) {
        const apply = () => {
            const cell = img.closest('.portfolio__cell');
            if (!cell || !img.naturalWidth || !img.naturalHeight) return;
            const ratio = img.naturalWidth / img.naturalHeight;
            if (ratio <= WIDE_THRESHOLD) return; // tall/square — full bleed
            const edge = sampleEdge(img);
            if (!edge) return;
            if (edge.stddev <= SOLID_BG_STDDEV) {
                // Solid background — almost certainly a logo/design with
                // embedded text. Contain + paint cell with edge color.
                cell.classList.add('portfolio__cell--contain');
                cell.style.setProperty('--portfolio-bg',
                    `rgb(${edge.r}, ${edge.g}, ${edge.b})`);
            }
            // else: a photo (varied edge pixels) → keep cover, crop as-is.
        };
        if (img.complete && img.naturalWidth) apply();
        else img.addEventListener('load', apply, { once: true });
    }

    function sampleEdge(img) {
        try {
            const canvas = document.createElement('canvas');
            const w = canvas.width  = Math.min(img.naturalWidth, 32);
            const h = canvas.height = Math.min(img.naturalHeight, 32);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, w, h);

            // Collect a thin border ring of pixels.
            const pts = [];
            for (let x = 0; x < w; x++) { pts.push([x, 0], [x, h - 1]); }
            for (let y = 1; y < h - 1; y++) { pts.push([0, y], [w - 1, y]); }
            const samples = pts.map(([x, y]) => ctx.getImageData(x, y, 1, 1).data);

            // Mean RGB.
            let r = 0, g = 0, b = 0;
            samples.forEach(s => { r += s[0]; g += s[1]; b += s[2]; });
            const n = samples.length;
            r /= n; g /= n; b /= n;

            // Standard deviation across channels — proxy for "is the edge
            // uniform?". Solid logo bg ≈ 0–15, photo edge ≈ 40–80+.
            let varSum = 0;
            samples.forEach(s => {
                const dr = s[0] - r, dg = s[1] - g, db = s[2] - b;
                varSum += dr * dr + dg * dg + db * db;
            });
            const stddev = Math.sqrt(varSum / (n * 3));

            return {
                r: Math.round(r),
                g: Math.round(g),
                b: Math.round(b),
                stddev,
            };
        } catch (e) {
            // Canvas tainted (cross-origin image) — fall back to defaults.
            return null;
        }
    }

    function cellMedia(p) {
        const first = (p.media && p.media[0]) || { type: 'image', src: (p.showcaseImage || p.thumb) };
        if (first.type === 'video') {
            return `<video src="${first.src}" muted loop playsinline preload="metadata" poster="${first.poster || (p.showcaseImage || p.thumb) || ''}"></video>`;
        }
        return `<img src="${(p.showcaseImage || p.thumb) || first.src}" alt="${p.title}" loading="lazy">`;
    }

    /* ---------- Filters ---------- */
    function buildFilters(list) {
        if (!filters) return;
        const cats = ['Todos', ...new Set(list.map(p => p.category))];
        const glowColors = ['mango', 'pink', 'violet', 'mint', 'coral', 'skyblue', 'yolk', 'green'];
        filters.innerHTML = cats.map((c, i) => {
            const color = glowColors[i % glowColors.length];
            const delay = (i * 0.18).toFixed(2);
            return `
                <button class="portfolio__filter glow glow--${color} ${i === 0 ? 'is-active' : ''}"
                        type="button" data-filter="${c}" style="--glow-delay:${delay}s">${c}</button>
            `;
        }).join('');

        filters.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            filters.querySelectorAll('.portfolio__filter').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            const cat = btn.dataset.filter;
            visible = cat === 'Todos' ? projects : projects.filter(p => p.category === cat);
            renderGrid(visible);
        });
    }

    /* ---------- Viewer open ---------- */
    grid.addEventListener('click', (e) => {
        const cell = e.target.closest('[data-open]');
        if (!cell) return;
        const id = cell.dataset.open;
        const idx = visible.findIndex(p => p.id === id);
        if (idx === -1) return;
        openViewer(idx);
    });

    function openViewer(index) {
        if (index < 0 || index >= visible.length) return;
        activeIndex = index;
        renderProject(visible[index]);
        updateNeighbors();

        viewer.classList.add('is-open');
        viewer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (viewer.querySelector('.viewer__main')) {
            viewer.querySelector('.viewer__main').scrollTop = 0;
        }
        history.replaceState(null, '', `#${encodeURIComponent(visible[index].id)}`);
    }

    function closeViewer() {
        if (lightbox && lightbox.classList.contains('is-open')) closeLightbox();
        // Pause any playing videos before tearing down
        galleryEl.querySelectorAll('video').forEach(v => v.pause());
        viewer.classList.remove('is-open', 'is-details-open');
        viewer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (history.replaceState) history.replaceState(null, '', window.location.pathname);
        activeIndex = -1;
    }

    function renderProject(p) {
        // Title / desc / meta
        titleEl.textContent   = p.title;
        descEl.textContent    = p.description || '';
        clientEl.textContent  = p.client || '—';
        categoryEl.textContent = p.category || '—';
        dateEl.textContent    = p.date || p.year || '—';

        if (p.behanceUrl) {
            behanceEl.href = p.behanceUrl;
            behanceEl.style.display = '';
        } else {
            behanceEl.style.display = 'none';
        }

        // Mini-portfolio gallery (or single hero if only one media item)
        activeMedia = (p.media && p.media.length)
            ? p.media
            : [{ type: 'image', src: (p.showcaseImage || p.thumb) }];

        const single = activeMedia.length === 1;
        galleryEl.classList.toggle('viewer__gallery--single', single);

        if (single) {
            const m = activeMedia[0];
            const inner = m.type === 'video'
                ? `<video src="${m.src}" autoplay muted loop playsinline ${m.poster ? `poster="${m.poster}"` : ''}></video>`
                : `<img src="${m.src}" alt="${p.title}" loading="eager" decoding="async">`;
            galleryEl.innerHTML = `
                <button type="button" class="viewer__gallery-item viewer__gallery-item--single"
                        data-gallery-open="0"
                        aria-label="Ampliar ${p.title}">
                    ${inner}
                    <span class="viewer__gallery-zoom" aria-hidden="true">+</span>
                </button>
            `;
        } else {
            galleryEl.innerHTML = activeMedia.map((m, i) => {
                const wide = i === 0 ? 'viewer__gallery-item--wide' : '';
                const inner = m.type === 'video'
                    ? `<video src="${m.src}" muted loop playsinline preload="metadata" ${m.poster ? `poster="${m.poster}"` : ''}></video>`
                    : `<img src="${m.src}" alt="${p.title} — ${i + 1}" loading="eager" decoding="async">`;
                return `
                    <button type="button" class="viewer__gallery-item ${wide}"
                            data-gallery-open="${i}"
                            style="--delay:${i * 60}ms"
                            aria-label="Ampliar imagen ${i + 1}">
                        ${inner}
                        <span class="viewer__gallery-zoom" aria-hidden="true">+</span>
                    </button>
                `;
            }).join('');
        }
    }

    function updateNeighbors() {
        const n = visible.length;
        if (n <= 1) {
            prevProjBtn.style.visibility = 'hidden';
            nextProjBtn.style.visibility = 'hidden';
            nextBtn.style.visibility = 'hidden';
            return;
        }
        const prev = visible[(activeIndex - 1 + n) % n];
        const next = visible[(activeIndex + 1) % n];
        prevThumb.src = prev.showcaseImage || prev.thumb;
        nextThumb.src = next.showcaseImage || next.thumb;
        if (nextThumbBl) nextThumbBl.src = next.showcaseImage || next.thumb;
        prevProjBtn.style.visibility = '';
        nextProjBtn.style.visibility = '';
        nextBtn.style.visibility = '';
    }

    /* ---------- Gallery → Lightbox ---------- */
    if (galleryEl) {
        galleryEl.addEventListener('click', (e) => {
            const cell = e.target.closest('[data-gallery-open]');
            if (!cell) return;
            const idx = parseInt(cell.dataset.galleryOpen, 10);
            openLightbox(idx);
        });
    }

    function openLightbox(idx) {
        if (!lightbox || !activeMedia.length) return;
        lightboxIdx = Math.max(0, Math.min(idx, activeMedia.length - 1));
        renderLightboxSlide();
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxStage.querySelectorAll('video').forEach(v => v.pause());
        lightboxStage.innerHTML = '';
        lightboxIdx = -1;
    }

    function renderLightboxSlide() {
        if (!lightboxStage) return;
        const m = activeMedia[lightboxIdx];
        const total = activeMedia.length;
        const tag = m.type === 'video'
            ? `<video src="${m.src}" autoplay muted loop playsinline ${m.poster ? `poster="${m.poster}"` : ''}></video>`
            : `<img src="${m.src}" alt="Imagen ${lightboxIdx + 1}">`;
        lightboxStage.innerHTML = tag;

        const media = lightboxStage.firstElementChild;
        if (media) {
            const reveal = () => media.classList.add('is-loaded');
            if (media.tagName === 'IMG') {
                if (media.complete) reveal();
                else media.addEventListener('load', reveal, { once: true });
            } else {
                reveal();
            }
        }

        lightboxPrev.disabled = lightboxIdx === 0;
        lightboxNext.disabled = lightboxIdx === total - 1;
        if (total > 1) {
            lightboxCounter.textContent = `${lightboxIdx + 1} / ${total}`;
            lightboxCounter.style.display = '';
            lightboxPrev.style.display = '';
            lightboxNext.style.display = '';
        } else {
            lightboxCounter.style.display = 'none';
            lightboxPrev.style.display = 'none';
            lightboxNext.style.display = 'none';
        }
    }

    function stepLightbox(delta) {
        if (lightboxIdx < 0) return;
        const next = lightboxIdx + delta;
        if (next < 0 || next >= activeMedia.length) return;
        lightboxIdx = next;
        renderLightboxSlide();
    }

    if (lightbox) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => stepLightbox(-1));
        lightboxNext.addEventListener('click', () => stepLightbox(1));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Touch swipe in lightbox
        let lbTouch = 0;
        lightboxStage.addEventListener('touchstart', (e) => {
            lbTouch = e.touches[0].clientX;
        }, { passive: true });
        lightboxStage.addEventListener('touchend', (e) => {
            const delta = e.changedTouches[0].clientX - lbTouch;
            if (Math.abs(delta) > 50) stepLightbox(delta < 0 ? 1 : -1);
        });
    }

    /* ---------- Project nav ---------- */
    function nextProject() {
        if (visible.length < 2) return;
        openViewer((activeIndex + 1) % visible.length);
    }
    function prevProject() {
        if (visible.length < 2) return;
        openViewer((activeIndex - 1 + visible.length) % visible.length);
    }

    nextProjBtn.addEventListener('click', nextProject);
    nextBtn.addEventListener('click', nextProject);
    prevProjBtn.addEventListener('click', prevProject);

    /* ---------- Details panel toggle ---------- */
    detailsBtn.addEventListener('click', () => {
        viewer.classList.toggle('is-details-open');
        detailsBtn.setAttribute('aria-expanded', viewer.classList.contains('is-details-open'));
    });

    /* ---------- Creator card (hover on desktop, tap on touch) ---------- */
    // Click toggles the pinned-open state (mainly for touch).
    creatorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = creatorEl.classList.toggle('is-open');
        creatorBtn.setAttribute('aria-expanded', open);
    });

    // On desktop, leaving the pill+card area closes any pinned state.
    creatorEl.addEventListener('mouseleave', () => {
        creatorEl.classList.remove('is-open');
        creatorBtn.setAttribute('aria-expanded', 'false');
        // Drop focus so :focus-within does not keep it open.
        if (document.activeElement && creatorEl.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    });

    // Tap-outside closes (for touch devices that pinned it open).
    document.addEventListener('click', (e) => {
        if (creatorEl && !creatorEl.contains(e.target)) {
            creatorEl.classList.remove('is-open');
            creatorBtn.setAttribute('aria-expanded', 'false');
        }
    });

    /* ---------- Close ---------- */
    closeBtns.forEach(btn => btn.addEventListener('click', closeViewer));

    /* ---------- Keyboard ---------- */
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('is-open')) {
            if (e.key === 'Escape') return closeLightbox();
            if (e.key === 'ArrowRight') return stepLightbox(1);
            if (e.key === 'ArrowLeft')  return stepLightbox(-1);
            return;
        }
        if (!viewer.classList.contains('is-open')) return;
        if (e.key === 'Escape') return closeViewer();
        if (e.key === 'ArrowRight' && e.shiftKey) nextProject();
        if (e.key === 'ArrowLeft'  && e.shiftKey) prevProject();
    });

    /* ---------- Deep link via #id ---------- */
    function handleHash() {
        const id = decodeURIComponent(window.location.hash.replace('#', ''));
        if (!id) return;
        const idx = visible.findIndex(p => p.id === id);
        if (idx !== -1) openViewer(idx);
    }
    window.addEventListener('hashchange', handleHash);
})();
