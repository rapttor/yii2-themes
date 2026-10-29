/* rapttor/yii2-themes background effect: aurora. Soft drifting aurora ribbons. */
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
    RapttorBg.register('aurora', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var bands = [], grads = [];
            function init() {
                var n = W < 600 ? 3 : 4, i;
                bands = [];
                for (i = 0; i < n; i++) {
                    bands.push({ y: H * (0.14 + 0.17 * i) + R() * H * 0.05, amp: H * (0.04 + 0.04 * R()), f: 0.8 + R() * 1.2, s: 0.04 + 0.05 * R(), p: R() * PI2, h: H * (0.34 + 0.12 * R()) });
                }
            }
            function skin() {
                var cols = [K.brand, K.link, K.accent, K.brand], al = D ? 0.24 : 0.2, i, b, gr;
                grads = [];
                for (i = 0; i < bands.length; i++) {
                    b = bands[i];
                    gr = g.createLinearGradient(0, b.y - b.amp, 0, b.y + b.h);
                    gr.addColorStop(0, a(cols[i], 0));
                    gr.addColorStop(0.14, a(cols[i], al));
                    gr.addColorStop(1, a(cols[i], 0));
                    grads.push(gr);
                }
            }
            function draw(t, dt) {
                var i, x, b, st = Math.max(8, W / 80);
                g.clearRect(0, 0, W, H);
                g.globalCompositeOperation = D ? 'lighter' : 'source-over';
                for (i = 0; i < bands.length; i++) {
                    b = bands[i];
                    g.beginPath();
                    for (x = 0; x <= W + st; x += st) {
                        g.lineTo(x, b.y + b.amp * Math.sin(x / W * b.f * PI2 + t * b.s * PI2 + b.p) + b.amp * 0.5 * Math.sin(x / W * b.f * 2.7 * PI2 - t * b.s * 3 + b.p * 2));
                    }
                    g.lineTo(W + st, b.y + b.h);
                    g.lineTo(0, b.y + b.h);
                    g.closePath();
                    g.fillStyle = grads[i];
                    g.fill();
                }
                g.globalCompositeOperation = 'source-over';
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
