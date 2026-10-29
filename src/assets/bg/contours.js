/* rapttor/yii2-themes background effect: contours. Animated topographic contour lines (marching squares on a coarse noise grid). */
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
    RapttorBg.register('contours', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var cs = 20, gw = 0, gh = 0, F, last = -1, ex = 0, ey = 0, styles = [], widths = [];
            var TB = [[], [3, 0], [0, 1], [3, 1], [1, 2], [3, 0, 1, 2], [0, 2], [3, 2], [3, 2], [0, 2], [0, 1, 3, 2], [1, 2], [3, 1], [0, 1], [3, 0], []];
            function ep(e, x0, y0, a0, b0, c0, d0, L) {
                if (e === 0) { ex = x0 + (L - a0) / (b0 - a0) * cs; ey = y0; }
                else if (e === 1) { ex = x0 + cs; ey = y0 + (L - b0) / (c0 - b0) * cs; }
                else if (e === 2) { ex = x0 + (L - d0) / (c0 - d0) * cs; ey = y0 + cs; }
                else { ex = x0; ey = y0 + (L - a0) / (d0 - a0) * cs; }
            }
            function init() {
                cs = Math.max(18, Math.sqrt(W * H / 2400)) | 0;
                gw = Math.ceil(W / cs) + 1; gh = Math.ceil(H / cs) + 1;
                F = new Float32Array(gw * gh);
                last = -1;
            }
            function skin() {
                var k;
                styles = []; widths = [];
                for (k = 0; k < 9; k++) {
                    styles.push(a(mix(K.brand, K.accent, k / 8), (k % 3 === 0) ? (D ? 0.4 : 0.45) : (D ? 0.22 : 0.28)));
                    widths.push(k % 3 === 0 ? 1.4 : 1);
                }
            }
            function draw(t, dt) {
                var S = Math.max(W, H), x, y, u, w, k, L, i, j, a0, b0, c0, d0, idx, seg, n, x0, y0, o;
                if (dt && t - last < 0.04) { return; }
                last = t;
                for (y = 0; y < gh; y++) {
                    for (x = 0; x < gw; x++) {
                        u = x * cs / S * 6.283; w = y * cs / S * 6.283;
                        F[y * gw + x] = Math.sin(u * 1.3 + t * 0.12) + Math.sin(w * 1.7 - t * 0.09) + Math.sin((u + w) * 1.1 + t * 0.07) + 0.8 * Math.sin(Math.sqrt((u - 3) * (u - 3) + (w - 2) * (w - 2)) * 1.9 - t * 0.1);
                    }
                }
                g.clearRect(0, 0, W, H);
                for (k = 0; k < 9; k++) {
                    L = -3.3 + (k + 1) * 0.66;
                    g.beginPath();
                    for (j = 0; j < gh - 1; j++) {
                        for (i = 0; i < gw - 1; i++) {
                            o = j * gw + i;
                            a0 = F[o]; b0 = F[o + 1]; c0 = F[o + gw + 1]; d0 = F[o + gw];
                            idx = (a0 > L ? 1 : 0) | (b0 > L ? 2 : 0) | (c0 > L ? 4 : 0) | (d0 > L ? 8 : 0);
                            if (idx === 0 || idx === 15) { continue; }
                            seg = TB[idx]; x0 = i * cs; y0 = j * cs;
                            for (n = 0; n < seg.length; n += 2) {
                                ep(seg[n], x0, y0, a0, b0, c0, d0, L);
                                g.moveTo(ex, ey);
                                ep(seg[n + 1], x0, y0, a0, b0, c0, d0, L);
                                g.lineTo(ex, ey);
                            }
                        }
                    }
                    g.strokeStyle = styles[k];
                    g.lineWidth = widths[k];
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
