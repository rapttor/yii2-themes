/* rapttor/yii2-themes background effect: petals. Falling petals swaying and tumbling. */
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
    RapttorBg.register('petals', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var P = [], cs = [];
            function init() {
                var n = cnt(24, 10, 38), i;
                P = [];
                for (i = 0; i < n; i++) {
                    P.push({ x: R() * W, y: R() * H, s: 5 + R() * 7, v: 24 + R() * 30, ph: R() * PI2, sw: 20 + R() * 40, rot: R() * PI2, rs: (R() - 0.5) * 1.6, fl: R() * PI2, fs: 0.8 + R() * 1.5, c: i % 3 });
                }
            }
            function skin() { cs = [a(K.accent, 1), a(K.brand, 1), a(K.link, 1)]; }
            function draw(t, dt) {
                var i, p, x, kx, co, si, s;
                g.clearRect(0, 0, W, H);
                g.globalAlpha = D ? 0.5 : 0.45;
                for (i = 0; i < P.length; i++) {
                    p = P[i];
                    if (dt) {
                        p.y += p.v * dt; p.rot += p.rs * dt; p.fl += p.fs * dt;
                        if (p.y > H + p.s * 2) { p.y = -p.s * 2; p.x = R() * W; }
                    }
                    x = p.x + Math.sin(t * 0.4 + p.ph) * p.sw;
                    kx = 0.25 + 0.75 * Math.abs(Math.cos(p.fl));
                    co = Math.cos(p.rot) * dpr; si = Math.sin(p.rot) * dpr; s = p.s;
                    g.setTransform(co * kx, si * kx, -si, co, x * dpr, p.y * dpr);
                    g.fillStyle = cs[p.c];
                    g.beginPath();
                    g.moveTo(0, -s * 1.4);
                    g.bezierCurveTo(s, -s * 0.8, s, s * 0.6, 0, s * 1.4);
                    g.bezierCurveTo(-s, s * 0.6, -s, -s * 0.8, 0, -s * 1.4);
                    g.fill();
                }
                g.setTransform(dpr, 0, 0, dpr, 0, 0);
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
