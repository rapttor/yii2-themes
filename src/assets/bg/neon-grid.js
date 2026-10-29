/* rapttor/yii2-themes background effect: neon-grid. Synthwave perspective grid scrolling toward a horizon. */
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
    RapttorBg.register('neon-grid', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var hz = 0, cx = 0, sunG, vG, hS = '';
            function init() { hz = Math.round(H * 0.52); cx = W / 2; }
            function skin() {
                var r = Math.min(W, H) * 0.22;
                sunG = g.createLinearGradient(0, hz - r, 0, hz);
                sunG.addColorStop(0, a(K.accent, D ? 0.3 : 0.22));
                sunG.addColorStop(1, a(K.brand, D ? 0.3 : 0.22));
                vG = g.createLinearGradient(0, hz, 0, H);
                vG.addColorStop(0, a(K.brand, 0));
                vG.addColorStop(1, a(K.brand, D ? 0.5 : 0.45));
                hS = a(K.brand, 1);
            }
            function draw(t, dt) {
                var r = Math.min(W, H) * 0.22, n = W < 600 ? 10 : 18, half = W * 1.1, ph = (t * 0.12) % 1, i, z, y;
                g.clearRect(0, 0, W, H);
                g.fillStyle = sunG;
                g.beginPath();
                g.arc(cx, hz, r, Math.PI, PI2);
                g.fill();
                g.strokeStyle = vG;
                g.lineWidth = 1;
                g.beginPath();
                for (i = -n; i <= n; i++) { g.moveTo(cx, hz); g.lineTo(cx + i * half / n, H); }
                g.stroke();
                g.strokeStyle = hS;
                for (i = 0; i < 12; i++) {
                    z = (i + ph) / 12;
                    y = hz + (H - hz) * z * z;
                    g.globalAlpha = z * (D ? 0.5 : 0.45);
                    g.beginPath();
                    g.moveTo(0, y);
                    g.lineTo(W, y);
                    g.stroke();
                }
                g.globalAlpha = 0.55;
                g.beginPath();
                g.moveTo(0, hz);
                g.lineTo(W, hz);
                g.stroke();
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
