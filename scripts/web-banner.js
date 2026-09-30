/**
 * web-banner.js
 * "Diseño y desarrollo web" service row → banner to web.berriesandmango.com.
 * - Pointer devices: the banner appears on hover (CSS); clicking anywhere on
 *   the row opens the web studio site.
 * - Wide touch screens: the first tap reveals the banner, tapping the
 *   banner follows the link; tapping the row again hides it.
 * - Phones / narrow screens: the banner is always visible (CSS), so tapping
 *   the row opens the site as well.
 */
(function () {
    'use strict';

    // Mouse/trackpad: hovering already reveals the banner (see presentaciones.css),
    // so a click goes straight to the site. Touch: tap to reveal first.
    var canHover = window.matchMedia('(hover: hover)');
    var narrow = window.matchMedia('(max-width: 900px)');

    document.querySelectorAll('[data-web-row]').forEach(function (row) {
        var link = row.querySelector('.presentaciones__web');
        if (!link) return;

        row.addEventListener('click', function (e) {
            if (e.target.closest('.presentaciones__web')) return; // native link

            if (canHover.matches || narrow.matches) {
                window.open(link.href, '_blank', 'noopener');
            } else {
                row.classList.toggle('is-open');
            }
        });
    });
})();
