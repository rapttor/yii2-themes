/* rapttor/yii2-themes background effect: dots-wave. A grid of dots whose size and opacity pulse in travelling waves. */
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
    RapttorBg.register('dots-wave', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var SPC = 30, cols = 0, rows = 0, V, cs = [];
            function init() { cols = Math.ceil(W / SPC) + 1; rows = Math.ceil(H / SPC) + 1; V = new Float32Array(cols * rows); }
            function skin() {
                var c = D ? mix(K.text, K.link, 0.35) : K.link;
                cs = [a(c, 0.1), a(c, 0.2), a(c, 0.32), a(c, 0.45)];
            }
            function draw(t, dt) {
                var r, c, k, L, v, x, y, ox = W * 0.5 + Math.sin(t * 0.1) * W * 0.2, oy = H * 0.5;
                g.clearRect(0, 0, W, H);
                for (r = 0; r < rows; r++) {
                    for (c = 0; c < cols; c++) {
                        x = c * SPC; y = r * SPC;
                        V[r * cols + c] = 0.5 + 0.5 * (0.65 * Math.sin(Math.sqrt((x - ox) * (x - ox) + (y - oy) * (y - oy)) * 0.012 - t * 1.1) + 0.35 * Math.sin((x + y) * 0.01 + t * 0.7));
                    }
                }
                for (L = 0; L < 4; L++) {
                    g.fillStyle = cs[L];
                    g.beginPath();
                    for (k = 0; k < V.length; k++) {
                        v = V[k];
                        if (((v * 3.99) | 0) !== L) { continue; }
                        x = (k % cols) * SPC; y = ((k / cols) | 0) * SPC;
                        g.moveTo(x + 0.8 + 2.2 * v, y);
                        g.arc(x, y, 0.8 + 2.2 * v, 0, PI2);
                    }
                    g.fill();
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
