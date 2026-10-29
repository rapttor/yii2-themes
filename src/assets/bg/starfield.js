/* rapttor/yii2-themes background effect: starfield. Slow warp-speed starfield. */
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
    RapttorBg.register('starfield', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var S = [], cx = 0, cy = 0, m = 1, col = '';
            function init() {
                var n = cnt(170, 60, 300), i;
                cx = W / 2; cy = H / 2; m = Math.max(W, H) * 0.13;
                S = [];
                for (i = 0; i < n; i++) { S.push({ x: R() * 2 - 1, y: R() * 2 - 1, z: 0.15 + R() * 0.85 }); }
            }
            function skin() { col = a(D ? mix(K.text, K.link, 0.3) : K.brand, 1); }
            function draw(t, dt) {
                var i, s, sx, sy, ex, ey, k;
                g.clearRect(0, 0, W, H);
                g.strokeStyle = col;
                g.lineCap = 'round';
                for (i = 0; i < S.length; i++) {
                    s = S[i];
                    if (dt) { s.z -= dt * 0.045; }
                    sx = cx + s.x * m / s.z; sy = cy + s.y * m / s.z;
                    if (s.z < 0.03 || sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) {
                        s.x = R() * 2 - 1; s.y = R() * 2 - 1; s.z = 1;
                        continue;
                    }
                    ex = cx + s.x * m / (s.z + 0.03); ey = cy + s.y * m / (s.z + 0.03);
                    k = 1 - s.z;
                    g.globalAlpha = Math.min(1, k * 1.2 + 0.1) * (D ? 0.85 : 0.6);
                    g.lineWidth = 0.4 + k * 1.4;
                    g.beginPath();
                    g.moveTo(ex, ey);
                    g.lineTo(sx, sy);
                    g.stroke();
                }
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
