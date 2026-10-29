/* rapttor/yii2-themes background effect: equalizer. A soft audio-equalizer look: thin rounded bars along the baseline bobbing with layered sine waves, faintly mirrored. No audio access. */
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
    RapttorBg.register('equalizer', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var grd, NB = 0, STEP = 11, hs = new Float32Array(180);
            function init() { NB = Math.min(180, Math.ceil(W / STEP) + 1); }
            function skin() {
                grd = g.createLinearGradient(0, 0, W, 0);
                grd.addColorStop(0, a(K.brand, 1)); grd.addColorStop(0.5, a(K.link, 1)); grd.addColorStop(1, a(K.accent, 1));
            }
            function draw(t, dt) {
                var i, h, x, y0 = H * 0.86, mx = H * 0.26, e;
                g.clearRect(0, 0, W, H);
                g.lineWidth = 6; g.lineCap = 'round'; g.strokeStyle = grd;
                g.globalAlpha = D ? 0.3 : 0.26;
                g.beginPath();
                for (i = 0; i < NB; i++) {
                    x = i * STEP + 3;
                    e = 0.5 + 0.5 * Math.sin(i * 0.05 + t * 0.3);
                    h = 6 + mx * (0.3 + 0.7 * e) * (0.5 + 0.5 * (0.5 * Math.sin(t * 1.3 + i * 0.35) + 0.3 * Math.sin(t * 2.1 - i * 0.17 + 1) + 0.2 * Math.sin(t * 0.7 + i * 0.9)) + 0.25);
                    hs[i] = h; g.moveTo(x, y0); g.lineTo(x, y0 - h);
                }
                g.stroke();
                g.globalAlpha = D ? 0.1 : 0.09;
                g.beginPath();
                for (i = 0; i < NB; i++) { x = i * STEP + 3; g.moveTo(x, y0 + 10); g.lineTo(x, y0 + 10 + hs[i] * 0.4); }
                g.stroke();
                g.globalAlpha = 1;
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
