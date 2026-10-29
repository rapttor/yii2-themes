/* rapttor/yii2-themes background effect: spirograph. Slowly drawing and fading hypotrochoid figures in theme colours that rotate and morph as they are traced. */
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
    RapttorBg.register('spirograph', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var th = [R() * PI2, R() * PI2, R() * PI2], cs = [], pre = 0, ox = 0, oy = 0, fadeT = 0;
            function init() {}
            function skin() { var o = D ? 0.6 : 0.7; pre = 0; cs = [a(K.brand, o), a(K.link, o), a(K.accent, o)]; }
            function pen(k, ang, t) {
                var r = 0.3 + 0.1 * Math.sin(t * 0.021 + k * 2), d = r * (1.4 + 0.5 * Math.sin(t * 0.033 + k)), q = (1 - r) / r, rot = t * 0.05 * (k % 2 ? -1 : 1);
                var sc = Math.min(W, H) * (0.44 - k * 0.1), x = (1 - r) * Math.cos(ang) + d * Math.cos(q * ang), y = (1 - r) * Math.sin(ang) - d * Math.sin(q * ang);
                ox = W / 2 + sc * (x * Math.cos(rot) - y * Math.sin(rot));
                oy = H / 2 + sc * (x * Math.sin(rot) + y * Math.cos(rot));
            }
            function trace(t, dang) {
                var k, n = Math.ceil(dang / 0.05), i;
                g.lineWidth = 1.2;
                for (k = 0; k < 3; k++) {
                    g.strokeStyle = cs[k];
                    g.beginPath();
                    pen(k, th[k], t); g.moveTo(ox, oy);
                    for (i = 0; i < n; i++) { th[k] += dang / n; pen(k, th[k], t); g.lineTo(ox, oy); }
                    g.stroke();
                }
            }
            function draw(t, dt) {
                if (!pre) { pre = 1; g.clearRect(0, 0, W, H); trace(t, 40); }
                if (!dt) { return; }
                fadeT += dt;
                if (fadeT > 0.12) {
                    fadeT = 0;
                    g.globalCompositeOperation = 'destination-out';
                    g.fillStyle = 'rgba(0,0,0,0.05)';
                    g.fillRect(0, 0, W, H);
                    g.globalCompositeOperation = 'source-over';
                }
                trace(t, dt * 4);
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
