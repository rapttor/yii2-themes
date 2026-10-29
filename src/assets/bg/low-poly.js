/* rapttor/yii2-themes background effect: low-poly. Jittered triangular mesh whose facets shimmer between theme shades under a drifting light spot. */
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
    RapttorBg.register('low-poly', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var cols = 0, rows = 0, CW = 0, PX, PY, PH, FL = [], spr = null;
            function init() {
                var r, c, k = 0;
                CW = Math.max(90, W / 14);
                cols = Math.ceil(W / CW) + 2; rows = Math.ceil(H / CW) + 2;
                PX = new Float32Array((cols + 1) * (rows + 1)); PY = new Float32Array((cols + 1) * (rows + 1));
                for (r = 0; r <= rows; r++) {
                    for (c = 0; c <= cols; c++) { PX[k] = (c - 1) * CW + (R() - 0.5) * CW * 0.6; PY[k] = (r - 1) * CW + (R() - 0.5) * CW * 0.6; k++; }
                }
                PH = new Float32Array(cols * rows * 2);
                for (k = 0; k < PH.length; k++) { PH[k] = R() * PI2; }
            }
            function skin() {
                var k, tt, p, c, q;
                FL = [];
                for (k = 0; k < 6; k++) {
                    tt = k / 5;
                    p = tt < 0.5 ? mix(K.brand, K.link, tt * 2) : mix(K.link, K.accent, (tt - 0.5) * 2);
                    c = mix(K.bg, p, 0.03 + 0.11 * tt);
                    FL.push('rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
                }
                spr = document.createElement('canvas'); spr.width = spr.height = 128;
                q = spr.getContext('2d');
                p = q.createRadialGradient(64, 64, 0, 64, 64, 64);
                c = D ? K.text : K.accent;
                p.addColorStop(0, a(c, 0.5)); p.addColorStop(1, a(c, 0));
                q.fillStyle = p; q.fillRect(0, 0, 128, 128);
            }
            function tri(t, sx, sy, ti, i, j, k) {
                var s = 0.5 + 0.5 * Math.sin(t * 0.5 + PH[ti]), d = Math.sqrt(Math.pow((PX[i] + PX[j] + PX[k]) / 3 - sx, 2) + Math.pow((PY[i] + PY[j] + PY[k]) / 3 - sy, 2));
                s += Math.max(0, 1 - d / (CW * 3.5)) * 0.7;
                g.fillStyle = FL[(Math.min(s, 1) * 5.99) | 0];
                g.beginPath();
                g.moveTo(PX[i], PY[i]); g.lineTo(PX[j], PY[j]); g.lineTo(PX[k], PY[k]);
                g.fill();
            }
            function draw(t, dt) {
                var r, c, p, ti = 0, sx = W * (0.5 + 0.35 * Math.sin(t * 0.07)), sy = H * (0.45 + 0.3 * Math.cos(t * 0.05));
                g.fillStyle = FL[1];
                g.fillRect(0, 0, W, H);
                for (r = 0; r < rows; r++) {
                    for (c = 0; c < cols; c++) {
                        p = r * (cols + 1) + c;
                        tri(t, sx, sy, ti++, p, p + 1, p + cols + 1);
                        tri(t, sx, sy, ti++, p + 1, p + cols + 2, p + cols + 1);
                    }
                }
                g.globalAlpha = 0.5;
                g.drawImage(spr, sx - 220, sy - 220, 440, 440);
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
