/* rapttor/yii2-themes background effect: confetti-dust. Slow floating dust motes and bokeh circles. */
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
    RapttorBg.register('confetti-dust', {
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

            var P = [], spr = [];
            function bokeh(c) {
                var s = document.createElement('canvas'), x = s.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
                s.width = s.height = 64;
                gr.addColorStop(0, a(c, 0.08));
                gr.addColorStop(0.8, a(c, 0.18));
                gr.addColorStop(0.92, a(c, 0.4));
                gr.addColorStop(1, a(c, 0));
                x.fillStyle = gr;
                x.fillRect(0, 0, 64, 64);
                return s;
            }
            function init() {
                var n = cnt(34, 14, 56), i, big;
                P = [];
                for (i = 0; i < n; i++) {
                    big = R() < 0.45;
                    P.push({ x: R() * W, y: R() * H, s: big ? 30 + R() * 70 : 3 + R() * 5, k: i % 3, big: big, vx: (R() - 0.5) * 14, vy: -(3 + R() * 10), ph: R() * PI2, tw: 0.3 + R() * 0.6 });
                }
            }
            function skin() {
                var c = [K.brand, K.accent, K.link];
                spr = [bokeh(c[0]), bokeh(c[1]), bokeh(c[2]), sprite(c[0], D), sprite(c[1], D), sprite(c[2], D)];
            }
            function draw(t, dt) {
                var i, p, m;
                g.clearRect(0, 0, W, H);
                g.globalCompositeOperation = D ? 'lighter' : 'source-over';
                for (i = 0; i < P.length; i++) {
                    p = P[i];
                    if (dt) {
                        p.x += p.vx * dt; p.y += p.vy * dt;
                        m = p.s;
                        if (p.x < -m) { p.x = W + m; } else if (p.x > W + m) { p.x = -m; }
                        if (p.y < -m) { p.y = H + m; }
                    }
                    g.globalAlpha = (p.big ? (D ? 0.7 : 0.55) : (D ? 0.9 : 0.7)) * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph)));
                    g.drawImage(spr[p.k + (p.big ? 0 : 3)], p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
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
