/* rapttor/yii2-themes background effect: ribbons. Many thin sine lines in a theme-colour gradient, undulating like silk. */
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
    RapttorBg.register('ribbons', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var NL = 18, cs = [];
            function init() {}
            function skin() {
                var i, u;
                for (i = 0; i < NL; i++) {
                    u = i / (NL - 1);
                    cs[i] = a(u < 0.5 ? mix(K.link, K.brand, u * 2) : mix(K.brand, K.accent, (u - 0.5) * 2), D ? 0.42 : 0.34);
                }
            }
            function draw(t, dt) {
                var i, x, u, sp;
                g.clearRect(0, 0, W, H);
                g.lineWidth = 1.1;
                for (i = 0; i < NL; i++) {
                    u = i / (NL - 1);
                    g.strokeStyle = cs[i];
                    g.beginPath();
                    for (x = 0; x <= W + 14; x += 14) {
                        sp = H * (0.18 + 0.12 * Math.sin(x * 0.0025 + t * 0.12));
                        g.lineTo(x, H * 0.5 + (u - 0.5) * sp + Math.sin(x * 0.004 + t * 0.3 + u * 2.2) * H * 0.12 + Math.sin(x * 0.009 - t * 0.22 + u * 1.3) * H * 0.04);
                    }
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
