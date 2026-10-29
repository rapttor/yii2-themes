/* rapttor/yii2-themes background effect: matrix. Digital rain in theme colours. */
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
    RapttorBg.register('matrix', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var fs = 16, cols = 0, ys = [], sp = [], glyphs = [], head = '', fade = '', acc = 0, i0;
            for (i0 = 0; i0 < 30; i0++) { glyphs.push(String.fromCharCode(0xFF71 + i0)); }
            for (i0 = 0; i0 < 10; i0++) { glyphs.push(String(i0)); }
            function step() {
                var c, y;
                g.fillStyle = fade;
                g.fillRect(0, 0, W, H);
                g.fillStyle = head;
                for (c = 0; c < cols; c++) {
                    if (R() > sp[c]) { continue; }
                    y = ys[c];
                    g.fillText(glyphs[(R() * glyphs.length) | 0], c * fs, y * fs);
                    ys[c] = (y * fs > H && R() > 0.96) ? 0 : y + 1;
                }
            }
            function init() {
                var c;
                fs = W < 600 ? 14 : 16;
                cols = Math.ceil(W / fs);
                ys = []; sp = [];
                for (c = 0; c < cols; c++) { ys.push(-((R() * H / fs) | 0)); sp.push(0.35 + R() * 0.65); }
                g.font = fs + 'px monospace';
                g.textBaseline = 'top';
            }
            function skin() {
                var i;
                head = a(D ? mix(K.brand, K.text, 0.35) : K.brand, D ? 0.9 : 0.7);
                fade = a(K.bg, 0.09);
                g.clearRect(0, 0, W, H);
                for (i = 0; i < 110; i++) { step(); }
            }
            function draw(t, dt) {
                if (!dt) { return; }
                acc += dt * 12;
                while (acc >= 1) { step(); acc--; }
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
