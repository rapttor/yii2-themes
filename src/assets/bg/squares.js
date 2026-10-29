/* rapttor/yii2-themes background effect: squares. Translucent squares and diamonds rotating slowly while floating upward. */
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
    RapttorBg.register('squares', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var Q = [], fs = [], ss = [];
            function init() {
                var n = cnt(26, 14, 50), i;
                Q = [];
                for (i = 0; i < n; i++) { Q.push({ x: R() * W, y: R() * (H + 100), s: 14 + R() * R() * 70, rot: R() * PI2, vr: (R() - 0.5) * 0.3, vy: 10 + R() * 20, ph: R() * PI2, sw: 6 + R() * 14, c: i % 3 }); }
            }
            function skin() {
                var cs = [K.link, K.brand, K.accent], i;
                for (i = 0; i < 3; i++) { fs[i] = a(cs[i], D ? 0.07 : 0.07); ss[i] = a(cs[i], D ? 0.3 : 0.3); }
            }
            function draw(t, dt) {
                var i, q, c, s;
                g.clearRect(0, 0, W, H);
                g.lineWidth = 1;
                for (i = 0; i < Q.length; i++) {
                    q = Q[i];
                    if (dt) { q.y -= q.vy * dt; q.rot += q.vr * dt; if (q.y < -q.s) { q.y = H + q.s; q.x = R() * W; } }
                    c = Math.cos(q.rot) * dpr; s = Math.sin(q.rot) * dpr;
                    g.setTransform(c, s, -s, c, (q.x + Math.sin(t * 0.3 + q.ph) * q.sw) * dpr, q.y * dpr);
                    g.fillStyle = fs[q.c]; g.strokeStyle = ss[q.c];
                    g.fillRect(-q.s / 2, -q.s / 2, q.s, q.s);
                    g.strokeRect(-q.s / 2, -q.s / 2, q.s, q.s);
                }
                g.setTransform(dpr, 0, 0, dpr, 0, 0);
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
