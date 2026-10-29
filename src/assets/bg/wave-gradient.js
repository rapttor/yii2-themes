/* rapttor/yii2-themes background effect: wave-gradient. An animated theme-colour gradient with translucent wave layers drifting over it, like a gradient sea. */
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
    RapttorBg.register('wave-gradient', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            function pc(x, o) { var n = P.length, f = Math.floor(x), i = ((f % n) + n) % n; return a(mix(P[i], P[(i + 1) % n], x - f), o); }
            function cyc(n, o) { var out = [], i; for (i = 0; i < n; i++) { out.push(pc(i / n * 3, o)); } return out; }
            var L = [], fills = [], edges = [];
            function init() {
                var i;
                L = [];
                for (i = 0; i < 5; i++) {
                    L.push({ y: H * (0.34 + 0.13 * i), amp: H * (0.024 + 0.007 * i), len: Math.max(300, W * (0.45 + 0.3 * R())), sp: (0.18 + 0.07 * i) * (i % 2 ? -1 : 1), p: R() * PI2 });
                }
            }
            function skin() {
                var i;
                fills = []; edges = [];
                for (i = 0; i < 5; i++) { fills.push(pc(i * 0.7 + 0.3, D ? 0.11 : 0.1)); edges.push(pc(i * 0.7 + 0.3, D ? 0.2 : 0.18)); }
            }
            function draw(t, dt) {
                var i, x, l, ang = 1.2 + 0.35 * Math.sin(t * 0.07), len = Math.hypot(W, H) / 2, c = Math.cos(ang) * len, d = Math.sin(ang) * len;
                var gr = g.createLinearGradient(W / 2 - c, H / 2 - d, W / 2 + c, H / 2 + d);
                for (i = 0; i < 4; i++) { gr.addColorStop(i / 3, pc(t * 0.04 + i * 0.75, D ? 0.3 : 0.24)); }
                g.clearRect(0, 0, W, H);
                g.fillStyle = gr;
                g.fillRect(0, 0, W, H);
                g.lineWidth = 1.2;
                for (i = 0; i < L.length; i++) {
                    l = L[i];
                    g.beginPath();
                    for (x = 0; x <= W + 12; x += 12) {
                        g.lineTo(x, l.y + l.amp * Math.sin(x / l.len * PI2 + t * l.sp + l.p) + l.amp * 0.45 * Math.sin(x / l.len * PI2 * 2.1 - t * l.sp * 1.3));
                    }
                    g.lineTo(W + 12, H + 4);
                    g.lineTo(0, H + 4);
                    g.closePath();
                    g.fillStyle = fills[i];
                    g.fill();
                    g.strokeStyle = edges[i];
                    g.stroke();
                }
            }
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
