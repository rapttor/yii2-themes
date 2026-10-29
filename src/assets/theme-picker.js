/* rapttor/yii2-themes: live preview. Picking a theme in the picker restyles the page at once; the form's Save stores it. */
(function () {
    'use strict';
    var chosen = null; /* the theme the user picked ({css, attrs}); a background that carries its own palette may show another one meanwhile */
    function apply(css, attrs, temporary) {
        var style = document.getElementById('theme-vars');
        if (style) { style.textContent = css; }
        var root = document.documentElement;
        ['data-theme', 'data-mode', 'data-style'].forEach(function (a) { root.removeAttribute(a); });
        (attrs || '').replace(/([\w-]+)="([^"]*)"/g, function (_, k, v) { root.setAttribute(k, v); return ''; });
        if (!temporary) { chosen = { css: css, attrs: attrs }; }
        document.dispatchEvent(new Event('rapttor:theme'));
    }
    /* used by theme-bg-picker.js: show another theme without changing the choice, or go back to the chosen one */
    window.RapttorThemePreview = {
        show: function (css, attrs) { apply(css, attrs, true); },
        restore: function () {
            if (chosen) { apply(chosen.css, chosen.attrs); return; }
            var r = document.querySelector('input[data-theme-key]:checked');
            if (r) { apply(r.getAttribute('data-css'), r.getAttribute('data-attrs')); }
        },
        option: function (key) { var r = document.querySelector('input[data-theme-key="' + key + '"]'); return r ? { css: r.getAttribute('data-css'), attrs: r.getAttribute('data-attrs') } : null; }
    };

    /* The user-defined theme: colour + light/dark are turned into a theme by the server (same builder as the saved page). */
    var timer = null;
    function previewCustom() {
        var picker = document.querySelector('.theme-picker');
        var color = document.querySelector('[data-custom-color]');
        var mode = document.querySelector('[data-custom-mode]:checked');
        var field = document.querySelector('[data-custom-field]');
        var radio = document.querySelector('input[data-custom]');
        if (!picker || !color || !field || !radio) { return; }
        var value = (mode ? mode.value : 'light') + ':' + color.value;
        field.value = value;
        radio.checked = true;
        var url = picker.getAttribute('data-preview-url');
        if (!url) { return; }
        clearTimeout(timer);
        timer = setTimeout(function () {
            fetch(url + (url.indexOf('?') > -1 ? '&' : '?') + 'theme=custom&custom=' + encodeURIComponent(value), { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (p) { apply(p.css, p.attrs); })
                .catch(function () {});
        }, 120);
    }

    document.addEventListener('input', function (e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-custom-color')) { previewCustom(); }
    });
    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!el || !el.hasAttribute) { return; }
        if (el.hasAttribute('data-custom-color') || el.hasAttribute('data-custom-mode') || el.hasAttribute('data-custom')) { previewCustom(); return; }
        if (!el.hasAttribute('data-theme-key')) { return; }
        apply(el.getAttribute('data-css'), el.getAttribute('data-attrs'));
    });

    /* Category chips (one category at a time, or All) and the All / Light / Dark filter. With many themes the picker opens on
       the category of the current choice; System (Device) is always visible above the chips. */
    var STORE = 'rapttor-theme-tab';
    function applyFilter(picker, mode) {
        picker.querySelectorAll('.theme-option').forEach(function (o) {
            var m = o.getAttribute('data-mode');
            o.classList.toggle('is-filtered', mode !== 'all' && m !== 'auto' && m !== mode);
        });
    }
    function showTab(picker, tab) {
        var bar = document.querySelector('.theme-tabs');
        if (bar) {
            bar.querySelectorAll('button').forEach(function (b) {
                var on = b.getAttribute('data-theme-tab') === tab;
                b.classList.toggle('is-on', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
                if (on && bar.scrollWidth > bar.clientWidth) { bar.scrollLeft = Math.max(0, b.offsetLeft - 16); } // phone: bring the chip into view
            });
        }
        picker.setAttribute('data-tab', tab);
        picker.querySelectorAll('.theme-option').forEach(function (o) {
            var g = o.getAttribute('data-group');
            o.classList.toggle('is-tab-hidden', tab !== 'all' && g !== 'system' && g !== tab);
        });
        var card = document.querySelector('.theme-card');
        if (card) { card.classList.toggle('is-tab-hidden', tab !== 'all' && tab !== 'custom'); }
        try { sessionStorage.setItem(STORE, tab); } catch (e) {}
    }
    document.addEventListener('click', function (e) {
        var t = e.target.closest && e.target.closest('[data-theme-tab]');
        if (t) { var p = document.querySelector('.theme-picker'); if (p) { showTab(p, t.getAttribute('data-theme-tab')); } return; }
        var f = e.target.closest && e.target.closest('[data-theme-filter]');
        if (f) {
            var picker = document.querySelector('.theme-picker');
            f.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-on', b === f); });
            if (picker) { applyFilter(picker, f.getAttribute('data-theme-filter')); }
        }
    });
    document.querySelectorAll('.theme-picker').forEach(function (picker) {
        var bar = document.querySelector('.theme-tabs');
        if (picker.getAttribute('data-layout') !== 'tabs') { return; } // `list`: everything stays visible, grouped
        var checked = picker.querySelector('input:checked');
        var customOn = document.querySelector('input[data-custom]:checked');
        var tab = customOn ? 'custom' : (checked ? checked.closest('.theme-option').getAttribute('data-group') : null);
        if (!tab || tab === 'system') { try { tab = sessionStorage.getItem(STORE); } catch (e) {} }
        var first = bar && bar.querySelector('[data-theme-tab]:not([data-theme-tab=all])'); /* never open on "All" unless it is the only chip */
        showTab(picker, tab && bar && bar.querySelector('[data-theme-tab="' + tab + '"]') ? tab : (first ? first.getAttribute('data-theme-tab') : 'all'));
    });
})();
