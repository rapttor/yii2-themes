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

    /* Collapsible groups and the All / Light / Dark filter. With many themes only the group of the current choice starts open. */
    function groupOptions(picker, group) { return picker.querySelectorAll('.theme-option[data-group="' + group + '"]'); }
    function applyFilter(picker, mode) {
        picker.querySelectorAll('.theme-option').forEach(function (o) {
            var m = o.getAttribute('data-mode');
            o.classList.toggle('is-filtered', mode !== 'all' && m !== 'auto' && m !== mode);
        });
    }
    function setOpen(picker, button, open) {
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        groupOptions(picker, button.getAttribute('data-group')).forEach(function (o) { o.classList.toggle('is-collapsed', !open); });
    }
    document.addEventListener('click', function (e) {
        var g = e.target.closest && e.target.closest('.theme-group');
        if (g) { setOpen(g.closest('.theme-picker'), g, g.getAttribute('aria-expanded') !== 'true'); return; }
        var f = e.target.closest && e.target.closest('[data-theme-filter]');
        if (f) {
            var picker = document.querySelector('.theme-picker');
            f.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-on', b === f); });
            if (picker) { applyFilter(picker, f.getAttribute('data-theme-filter')); }
        }
    });
    document.querySelectorAll('.theme-picker').forEach(function (picker) {
        if (picker.querySelectorAll('.theme-option').length <= 30) { return; }
        var checked = picker.querySelector('input:checked');
        var keep = { system: true };
        if (checked) { keep[checked.closest('.theme-option').getAttribute('data-group')] = true; }
        picker.querySelectorAll('.theme-group').forEach(function (b) { if (!keep[b.getAttribute('data-group')]) { setOpen(picker, b, false); } });
    });
})();
