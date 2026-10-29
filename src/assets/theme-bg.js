/* rapttor/yii2-themes: page backgrounds. Static and image backgrounds are plain CSS (see theme.css, --tbg-image / --tbg-overlay);
   this file runs the animated ones and shows the photo credit. The state lives on <html>:
     data-bg="static|gradient|solid|anim|img"   data-bg-id="aurora"   data-bg-credit="Name|username|photoId"
   Effects are loaded on demand from bg/<id>.js (next to this file) and register themselves:

     RapttorBg.register('aurora', { start: function (layer, ctx) { ...; return function stop() {...}; } });

   layer = the fixed full-screen <div id="theme-bg">; ctx = { reduced, colors(), size(), loop(fn), onTheme(cb) } (see below).
   Effects must clean up everything in stop(), cap devicePixelRatio at 1.5 and take their colours from ctx.colors() so they follow the theme. */
(function () {
    'use strict';
    var base = (function () { var s = document.currentScript; return s && s.src ? s.src.replace(/[^\/?#]*([?#].*)?$/, '') : ''; })();
    var stamp = (function () { var s = document.currentScript; var m = s && s.src ? s.src.match(/\?[^#]*/) : null; return m ? m[0] : ''; })(); /* cache-busting ?v= of this file, reused for the effects */
    var root = document.documentElement;
    var registry = {};
    var loading = {};
    var layer = null;
    var stopFn = null;
    var current = '';
    var themeListeners = [];
    var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

    function colors() {
        var cs = getComputedStyle(root);
        var v = function (n, d) { return (cs.getPropertyValue(n) || '').trim() || d; };
        return { bg: v('--bg', '#000'), surface: v('--surface', '#111'), text: v('--text', '#fff'), muted: v('--muted', '#aaa'), brand: v('--brand', '#08f'), link: v('--link', '#6af'), accent: v('--accent', '#f80'), dark: root.getAttribute('data-mode') === 'dark' || (!root.getAttribute('data-mode') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) };
    }

    function size() {
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        return { w: window.innerWidth, h: window.innerHeight, dpr: dpr };
    }

    /* requestAnimationFrame loop that pauses while the tab is hidden and, for people who prefer reduced motion, draws a single still frame. Returns stop(). */
    function loop(fn) {
        var id = 0, last = 0, dead = false;
        function frame(t) {
            if (dead) { return; }
            var dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
            last = t;
            fn(t / 1000, dt);
            if (!motion.matches && !document.hidden) { id = requestAnimationFrame(frame); } else { id = 0; }
        }
        function wake() { if (!dead && !id && !motion.matches && !document.hidden) { last = 0; id = requestAnimationFrame(frame); } }
        document.addEventListener('visibilitychange', wake);
        id = requestAnimationFrame(frame);
        return function () { dead = true; cancelAnimationFrame(id); document.removeEventListener('visibilitychange', wake); };
    }

    var ctx = {
        get reduced() { return !!motion.matches; },
        colors: colors, size: size, loop: loop,
        onTheme: function (cb) { themeListeners.push(cb); return function () { themeListeners = themeListeners.filter(function (f) { return f !== cb; }); }; }
    };

    function stop() {
        if (stopFn) { try { stopFn(); } catch (e) {} stopFn = null; }
        themeListeners = [];
        if (layer) { layer.remove(); layer = null; }
        current = '';
    }

    function run(id) {
        var def = registry[id];
        if (!def || current !== id || layer) { return; }
        layer = document.createElement('div');
        layer.id = 'theme-bg';
        layer.setAttribute('aria-hidden', 'true');
        (document.body || root).insertBefore(layer, (document.body || root).firstChild);
        stopFn = def.start(layer, ctx) || null;
    }

    function load(id) {
        if (registry[id]) { run(id); return; }
        if (loading[id] || !/^[a-z0-9-]+$/.test(id)) { return; }
        loading[id] = true;
        var s = document.createElement('script');
        s.src = base + 'bg/' + id + '.js' + stamp;
        s.onload = function () { run(id); };
        s.onerror = function () { loading[id] = false; };
        document.head.appendChild(s);
    }

    function credit() {
        var old = document.getElementById('theme-bg-credit');
        if (old) { old.remove(); }
        var c = (root.getAttribute('data-bg-credit') || '').split('|');
        if (root.getAttribute('data-bg') !== 'img' || c.length < 2 || !c[0]) { return; }
        var utm = '?utm_source=' + encodeURIComponent(window.rapttorThemeBgApp || location.hostname) + '&utm_medium=referral';
        var a = document.createElement('a');
        a.id = 'theme-bg-credit';
        a.href = 'https://unsplash.com/@' + encodeURIComponent(c[1]) + utm;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Photo: ' + c[0] + ' / Unsplash';
        document.body.appendChild(a);
    }

    /* Reads <html data-bg*> and makes the page match: call after the attributes changed (the picker does it on every choice). */
    function sync() {
        var kind = root.getAttribute('data-bg');
        var id = root.getAttribute('data-bg-id') || '';
        credit();
        if (kind !== 'anim' || !id) { stop(); return; }
        if (current === id && layer) { return; }
        stop();
        current = id;
        load(id);
    }

    document.addEventListener('rapttor:theme', function () {
        themeListeners.slice().forEach(function (cb) { try { cb(colors()); } catch (e) {} });
    });
    if (motion.addEventListener) { motion.addEventListener('change', function () { var id = current; stop(); current = id; run(id); }); }

    window.RapttorBg = { register: function (id, def) { registry[id] = def; }, sync: sync, ctx: ctx };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', sync); } else { sync(); }
})();
