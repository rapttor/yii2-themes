/* rapttor/yii2-themes background effect: kelp. Swaying kelp blades rising from the bottom in three depth layers. */
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
    RapttorBg.register('kelp', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var BL = [[], [], []], fills = [];
            function init() {
                var l, i, n, h;
                BL = [[], [], []];
                for (l = 0; l < 3; l++) {
                    n = cnt(16, 8, 30);
                    for (i = 0; i < n; i++) {
                        h = H * (0.1 + 0.07 * l) * (0.6 + 0.8 * R());
                        BL[l].push({ x: (i + R() * 0.8) / n * W, h: h, w: (3 + 2 * l) * (0.7 + 0.6 * R()), ph: R() * PI2, sp: 0.5 + 0.6 * R() });
                    }
                }
            }
            function skin() { fills = [a(K.link, D ? 0.1 : 0.1), a(K.brand, D ? 0.13 : 0.12), a(D ? K.accent : K.brand, D ? 0.14 : 0.15)]; }
            function draw(t, dt) {
                var l, i, b, sw, arr;
                g.clearRect(0, 0, W, H);
                for (l = 0; l < 3; l++) {
                    arr = BL[l];
                    g.fillStyle = fills[l];
                    g.beginPath();
                    for (i = 0; i < arr.length; i++) {
                        b = arr[i];
                        sw = Math.sin(t * b.sp + b.ph) * b.h * 0.16 + Math.sin(t * 0.35 + b.x * 0.004) * b.h * 0.08;
                        g.moveTo(b.x - b.w, H + 2);
                        g.bezierCurveTo(b.x - b.w * 0.6 + sw * 0.1, H - b.h * 0.35, b.x + sw * 0.7, H - b.h * 0.7, b.x + sw, H - b.h);
                        g.bezierCurveTo(b.x + sw * 0.7 + b.w * 0.3, H - b.h * 0.65, b.x + b.w * 0.6 + sw * 0.1, H - b.h * 0.3, b.x + b.w, H + 2);
                        g.closePath();
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
