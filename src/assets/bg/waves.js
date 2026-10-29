/* rapttor/yii2-themes background effect: waves. Layered sine waves along the bottom. */
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
    RapttorBg.register('waves', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var L = [], fills = [];
            function init() {
                var i;
                L = [];
                for (i = 0; i < 5; i++) {
                    L.push({ y: H * (0.66 + 0.06 * i), amp: H * (0.018 + 0.006 * i), len: Math.max(260, W * (0.5 + 0.3 * R())), sp: (0.25 + 0.1 * i) * (i % 2 ? -1 : 1), p: R() * PI2 });
                }
            }
            function skin() {
                var cols = [K.link, K.brand, K.accent, K.link, K.brand], i;
                fills = [];
                for (i = 0; i < 5; i++) { fills.push(a(cols[i], D ? 0.14 : 0.12)); }
            }
            function draw(t, dt) {
                var i, x, l;
                g.clearRect(0, 0, W, H);
                for (i = 0; i < L.length; i++) {
                    l = L[i];
                    g.beginPath();
                    for (x = 0; x <= W + 10; x += 10) {
                        g.lineTo(x, l.y + l.amp * Math.sin(x / l.len * PI2 + t * l.sp + l.p) + l.amp * 0.5 * Math.sin(x / l.len * PI2 * 2.3 - t * l.sp * 1.4));
                    }
                    g.lineTo(W + 10, H);
                    g.lineTo(0, H);
                    g.closePath();
                    g.fillStyle = fills[i];
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
