/* rapttor/yii2-themes background effect: plasma. Low-resolution plasma rendered coarse and scaled up by the browser. */
(function () {
    'use strict';
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
    RapttorBg.register('plasma', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d'), w = 0, h = 0, img, dist, lut = new Uint8Array(768), D = false, alpha = 120, T = 0, last = -1, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function theme() {
                var C = ctx.colors(), st = [rgb(C.bg), rgb(C.brand), rgb(C.link), rgb(C.accent), rgb(C.bg)], i, p, k, f, c;
                D = C.dark;
                alpha = Math.round(255 * (D ? 0.38 : 0.32));
                layer.style.background = C.bg;
                for (i = 0; i < 256; i++) {
                    p = i / 255 * 4; k = Math.min(3, p | 0); f = p - k;
                    c = mix(st[k], st[k + 1], f);
                    lut[i * 3] = c[0]; lut[i * 3 + 1] = c[1]; lut[i * 3 + 2] = c[2];
                }
                if (w) { draw(T, 0); }
            }
            function resize() {
                var s = ctx.size(), x, y;
                if (!s.w || !s.h) { return; }
                if (w && Math.abs(s.h / s.w - h / w) < 0.05) { return; }
                w = s.w < 600 ? 56 : 96;
                h = Math.max(24, Math.round(w * s.h / s.w));
                cv.width = w; cv.height = h;
                img = g.createImageData(w, h);
                dist = new Float32Array(w * h);
                for (y = 0; y < h; y++) { for (x = 0; x < w; x++) { dist[y * w + x] = Math.sqrt((x - w / 2) * (x - w / 2) + (y - h / 2) * (y - h / 2)); } }
                draw(T, 0);
            }
            function draw(t, dt) {
                var d = img.data, x, y, o = 0, i = 0, v, ix;
                if (dt && t - last < 0.05) { return; }
                last = t;
                for (y = 0; y < h; y++) {
                    for (x = 0; x < w; x++, i++, o += 4) {
                        v = Math.sin(x * 0.16 + t * 0.5) + Math.sin(y * 0.2 - t * 0.4) + Math.sin((x + y) * 0.1 + t * 0.3) + Math.sin(dist[i] * 0.17 - t * 0.6);
                        ix = ((v + 4) * 31.9) | 0;
                        d[o] = lut[ix * 3]; d[o + 1] = lut[ix * 3 + 1]; d[o + 2] = lut[ix * 3 + 2]; d[o + 3] = alpha;
                    }
                }
                g.putImageData(img, 0, 0);
            }
            function onResize() { clearTimeout(rt); rt = setTimeout(resize, 150); }
            theme();
            resize();
            window.addEventListener('resize', onResize);
            ctx.onTheme(theme);
            stopLoop = ctx.loop(function (t, dt) { T = t; draw(t, dt); });
            return function () { stopLoop(); clearTimeout(rt); window.removeEventListener('resize', onResize); cv.remove(); };
        }
    });
})();
