/* rapttor/yii2-themes background effect: psychedelic. Concentric warped rings in two offset sets (moire) cycling through the theme colours, slowly breathing. */
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
    RapttorBg.register('psychedelic', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            function pc(x, o) { var n = P.length, f = Math.floor(x), i = ((f % n) + n) % n; return a(mix(P[i], P[(i + 1) % n], x - f), o); }
            function cyc(n, o) { var out = [], i; for (i = 0; i < n; i++) { out.push(pc(i / n * 3, o)); } return out; }
            var cs = [], NS = 72, CA = new Float32Array(NS + 1), SA = new Float32Array(NS + 1), AA = new Float32Array(NS + 1);
            function init() { var i; for (i = 0; i <= NS; i++) { AA[i] = i / NS * PI2; CA[i] = Math.cos(AA[i]); SA[i] = Math.sin(AA[i]); } }
            function skin() { cs = cyc(64, D ? 0.17 : 0.14); }
            function rings(cx, cy, gap, t, off, k, w) {
                var n = Math.ceil(Math.hypot(W, H) / gap) + 2, i, j, r, wb, ph = (t * 0.1) % 1;
                g.lineWidth = w;
                for (i = 0; i < n; i++) {
                    r = (i + ph) * gap;
                    g.strokeStyle = cs[((i * 2 + off + (t * 2.5 | 0)) % 64 + 64) % 64];
                    g.beginPath();
                    for (j = 0; j <= NS; j++) {
                        wb = 1 + 0.025 * Math.sin(AA[j] * (4 + k) + t * 0.5 + i * 0.2) + 0.015 * Math.sin(AA[j] * 3 - t * 0.4 * k);
                        g.lineTo(cx + CA[j] * r * wb, cy + SA[j] * r * wb);
                    }
                    g.stroke();
                }
            }
            function draw(t, dt) {
                var gap = 40 * (1 + 0.1 * Math.sin(t * 0.35));
                g.clearRect(0, 0, W, H);
                rings(W * (0.5 + 0.12 * Math.sin(t * 0.13)), H * (0.5 + 0.1 * Math.cos(t * 0.11)), gap, t, 0, 1, 2.4);
                rings(W * (0.5 + 0.15 * Math.sin(t * 0.09 + 2)), H * (0.5 + 0.12 * Math.cos(t * 0.14 + 1)), gap * 1.07, t, 32, -1, 1.8);
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
