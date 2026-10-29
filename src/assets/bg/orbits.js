/* rapttor/yii2-themes background effect: orbits. Thin elliptical orbit rings around a centre with small planets moving on them. */
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
    RapttorBg.register('orbits', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var OB = [], PL = [], cx = 0, cy = 0, cs = [];
            function init() {
                var i, j, m = Math.min(W, H * 1.7) * 0.5, n;
                cx = W * 0.5; cy = H * 0.5; OB = []; PL = [];
                for (i = 0; i < 6; i++) {
                    OB.push({ rx: m * (0.16 + 0.15 * i), k: 0.4 + 0.2 * R(), rot: 0.35 + (R() - 0.5) * 0.4 });
                    n = 1 + (R() < 0.5 ? 1 : 0);
                    for (j = 0; j < n; j++) { PL.push({ o: i, ph: R() * PI2, sp: 0.35 / (0.6 + i * 0.55), r: 2 + R() * 3, c: (i + j) % 3 }); }
                }
            }
            function skin() { cs = [a(K.link, 1), a(K.brand, 1), a(K.accent, 1)]; }
            function draw(t, dt) {
                var i, o, p, u, ex, ey, cr, sr;
                g.clearRect(0, 0, W, H);
                g.strokeStyle = a(D ? mix(K.text, K.link, 0.4) : K.link, D ? 0.2 : 0.24);
                g.lineWidth = 1;
                for (i = 0; i < OB.length; i++) {
                    o = OB[i];
                    g.beginPath();
                    g.ellipse(cx, cy, o.rx, o.rx * o.k, o.rot, 0, PI2);
                    g.stroke();
                }
                g.globalAlpha = D ? 0.75 : 0.65;
                for (i = 0; i < PL.length; i++) {
                    p = PL[i]; o = OB[p.o];
                    u = p.ph + t * p.sp;
                    ex = Math.cos(u) * o.rx; ey = Math.sin(u) * o.rx * o.k;
                    cr = Math.cos(o.rot); sr = Math.sin(o.rot);
                    g.fillStyle = cs[p.c];
                    g.beginPath();
                    g.arc(cx + ex * cr - ey * sr, cy + ex * sr + ey * cr, p.r, 0, PI2);
                    g.fill();
                }
                g.fillStyle = cs[2];
                g.globalAlpha = 0.18;
                g.beginPath(); g.arc(cx, cy, 14, 0, PI2); g.fill();
                g.globalAlpha = D ? 0.8 : 0.7;
                g.beginPath(); g.arc(cx, cy, 5, 0, PI2); g.fill();
                g.globalAlpha = 1;
            }
            function theme() {
                var C = ctx.colors();
                D = C.dark;
                K = { bg: rgb(C.bg), surface: rgb(C.surface), text: rgb(C.text), muted: rgb(C.muted), brand: rgb(C.brand), link: rgb(C.link), accent: rgb(C.accent) };
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
            ctx.onTheme(theme);
            stopLoop = ctx.loop(function (t, dt) { T = t; draw(t, dt); });
            return function () {
                stopLoop();
                clearTimeout(rt);
                window.removeEventListener('resize', onResize);
                cv.remove();
            };
        }
    });
})();
