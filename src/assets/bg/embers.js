/* rapttor/yii2-themes background effect: embers. Rising glowing embers over a faint warm glow. */
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
    RapttorBg.register('embers', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            /* soft glow sprite (hot = lighter core for dark themes) */
            function sprite(c, hot) {
                var s = document.createElement('canvas'), x = s.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
                s.width = s.height = 64;
                gr.addColorStop(0, a(hot ? mix(c, [255, 255, 255], 0.4) : c, 1));
                gr.addColorStop(0.2, a(c, 0.7));
                gr.addColorStop(0.5, a(c, 0.16));
                gr.addColorStop(1, a(c, 0));
                x.fillStyle = gr;
                x.fillRect(0, 0, 64, 64);
                return s;
            }

            var P = [], spr = [], glowG;
            function init() {
                var n = cnt(36, 14, 64), i;
                P = [];
                for (i = 0; i < n; i++) { P.push({ x: R() * W, y: R() * H, s: 8 + R() * 18, v: 18 + R() * 45, ph: R() * PI2, sw: 6 + R() * 18, k: i % 2, f: 3 + R() * 5 }); }
            }
            function skin() {
                spr = [sprite(K.accent, D), sprite(mix(K.accent, K.brand, 0.55), D)];
                glowG = g.createLinearGradient(0, H, 0, H * 0.6);
                glowG.addColorStop(0, a(K.accent, D ? 0.2 : 0.14));
                glowG.addColorStop(1, a(K.accent, 0));
            }
            function draw(t, dt) {
                var i, p, k, s;
                g.clearRect(0, 0, W, H);
                g.fillStyle = glowG;
                g.fillRect(0, H * 0.6, W, H * 0.4);
                g.globalCompositeOperation = D ? 'lighter' : 'source-over';
                for (i = 0; i < P.length; i++) {
                    p = P[i];
                    if (dt) { p.y -= p.v * dt; if (p.y < -p.s) { p.y = H + p.s; p.x = R() * W; } }
                    k = Math.max(0, p.y / H);
                    s = p.s * (0.4 + 0.6 * k);
                    g.globalAlpha = Math.min(1, k * 1.3) * (0.55 + 0.45 * Math.sin(t * p.f + p.ph)) * (D ? 0.9 : 0.6);
                    g.drawImage(spr[p.k], p.x + Math.sin(t * 0.7 + p.ph) * p.sw - s / 2, p.y - s / 2, s, s);
                }
                g.globalAlpha = 1;
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
