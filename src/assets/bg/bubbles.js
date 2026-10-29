/* rapttor/yii2-themes background effect: bubbles. Rising translucent bubbles. */
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
    RapttorBg.register('bubbles', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var P = [], fillS = [], strokeS = [];
            function init() {
                var n = cnt(32, 12, 52), u = Math.max(0.7, Math.min(1.3, Math.min(W, H) / 700)), i, r;
                P = [];
                for (i = 0; i < n; i++) {
                    r = (4 + R() * R() * 30) * u;
                    P.push({ x: R() * W, y: R() * H, r: r, v: 14 + r * 1.1 + R() * 10, ph: R() * PI2, sw: 8 + R() * 18, c: i % 3 });
                }
            }
            function skin() {
                var cols = [K.link, K.brand, K.accent], i;
                fillS = []; strokeS = [];
                for (i = 0; i < 3; i++) { fillS.push(a(cols[i], 0.07)); strokeS.push(a(cols[i], D ? 0.35 : 0.4)); }
            }
            function draw(t, dt) {
                var i, p, x;
                g.clearRect(0, 0, W, H);
                g.lineWidth = 1;
                for (i = 0; i < P.length; i++) {
                    p = P[i];
                    if (dt) {
                        p.y -= p.v * dt;
                        if (p.y < -p.r * 2) { p.y = H + p.r * 2; p.x = R() * W; }
                    }
                    x = p.x + Math.sin(t * 0.5 + p.ph) * p.sw;
                    g.beginPath();
                    g.arc(x, p.y, p.r, 0, PI2);
                    g.fillStyle = fillS[p.c];
                    g.fill();
                    g.strokeStyle = strokeS[p.c];
                    g.stroke();
                    g.beginPath();
                    g.arc(x, p.y, p.r * 0.72, 3.6, 4.5);
                    g.stroke();
                }
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
