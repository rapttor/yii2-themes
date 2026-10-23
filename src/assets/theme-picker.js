/* rapttor/yii2-themes: live preview. Picking a theme in the picker restyles the page at once; the form's Save stores it. */
(function () {
    'use strict';
    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!el || !el.hasAttribute || !el.hasAttribute('data-theme-key')) { return; }
        var style = document.getElementById('theme-vars');
        if (style) { style.textContent = el.getAttribute('data-css'); }
        var root = document.documentElement;
        ['data-theme', 'data-mode', 'data-style'].forEach(function (a) { root.removeAttribute(a); });
        (el.getAttribute('data-attrs') || '').replace(/([\w-]+)="([^"]*)"/g, function (_, k, v) { root.setAttribute(k, v); return ''; });
    });
})();
