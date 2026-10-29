/* rapttor/yii2-themes background effect: scroll-hue. A multi-stop gradient of theme colours whose hue, angle and position follow the page scroll, plus a slow idle drift. */
(function () {
    'use strict';
    var R = Math.random, PI2 = Math.PI * 2;
    function rgb(s) {
        var m = /^#([0-9a-f]{3,8})$/i.exec(String(s).trim()), h;
        if (m) {
            h = m[1];
            if (h.length < 6) { h = h.replace(/./g, '$&$&'); }
            return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
        }
        m = String(s).match(/[\d.]+/g);
        return m && m.length > 2 ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
    }
    function a(c, o) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + o + ')'; }
    function mix(p, q, t) { return [Math.round(p[0] + (q[0] - p[0]) * t), Math.round(p[1] + (q[1] - p[1]) * t), Math.round(p[2] + (q[2] - p[2]) * t)]; }
    RapttorBg.register('scroll-hue', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            function pc(x, o) { var n = P.length, f = Math.floor(x), i = ((f % n) + n) % n; return a(mix(P[i], P[(i + 1) % n], x - f), o); }
            function cyc(n, o) { var out = [], i; for (i = 0; i < n; i++) { out.push(pc(i / n * 3, o)); } return out; }
            var s = 0.2, tgt = 0.2, pend = 0, raf = 0;
            function init() {}
            function skin() {}
            function lin(ang, o, sh) {
                var l = Math.hypot(W, H) / 2, c = Math.cos(ang) * l, d = Math.sin(ang) * l, gr = g.createLinearGradient(W / 2 - c, H / 2 - d, W / 2 + c, H / 2 + d), i;
                for (i = 0; i < 5; i++) { gr.addColorStop(i / 4, pc(sh + i * 0.8, o)); }
                return gr;
            }
            function draw(t, dt) {
                s += (tgt - s) * (1 - Math.exp(-dt * 4));
                g.clearRect(0, 0, W, H);
                g.fillStyle = lin(0.6 + s * 2.4 + t * 0.012, D ? 0.3 : 0.26, s * 3 + t * 0.02);
                g.fillRect(0, 0, W, H);
                g.fillStyle = lin(-0.9 - s * 1.6 - t * 0.009, D ? 0.15 : 0.12, s * 2 + 1.5 + t * 0.015);
                g.fillRect(0, 0, W, H);
            }
            function read() {
                var h = Math.max(1, (document.documentElement.scrollHeight || 1) - H);
                pend = 0;
                tgt = Math.min(1, Math.max(0, (window.pageYOffset || 0) / h));
            }
            function onScroll() { if (!pend) { pend = 1; raf = requestAnimationFrame(read); } }
            function theme() {
                var C = ctx.colors();
                D = C.dark;
                K = { bg: rgb(C.bg), surface: rgb(C.surface), text: rgb(C.text), muted: rgb(C.muted), brand: rgb(C.brand), link: rgb(C.link), accent: rgb(C.accent) };
                P = [K.brand, K.link, K.accent];
                layer.style.background = C.bg;
                if (W) { skin(); draw(T, 0); }
            }
            function resize() {
                var s = ctx.size();
                if (W && s.w === W && Math.abs(s.h - H) < 120) { return; }
                W = s.w; H = s.h; dpr = s.dpr;
                cv.width = Math.round(W * dpr);
                cv.height = Math.round(H * dpr);
                g.setTransform(dpr, 0, 0, dpr, 0, 0);
                init(); skin(); draw(T, 0);
            }
            function onResize() { clearTimeout(rt); rt = setTimeout(resize, 150); }
            theme();
            resize();
            window.addEventListener('resize', onResize);
            if (!ctx.reduced) { window.addEventListener('scroll', onScroll, { passive: true }); }
            ctx.onTheme(theme);
            stopLoop = ctx.loop(function (t, dt) { T = t; draw(t, dt); });
            return function () {
                stopLoop();
                clearTimeout(rt);
                window.removeEventListener('resize', onResize);
                window.removeEventListener('scroll', onScroll);
                cancelAnimationFrame(raf);
                cv.remove();
            };
        }
    });
})();
