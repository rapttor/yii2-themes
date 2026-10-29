/* rapttor/yii2-themes background effect: particles. Particle network: drifting dots linked by faint lines. */
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
    RapttorBg.register('particles', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var P = [], lim = 120, dotS = '', lineS = '';
            function init() {
                var n = cnt(52, 22, 78), i;
                lim = Math.max(90, Math.min(W, H) * 0.18);
                P = [];
                for (i = 0; i < n; i++) { P.push({ x: R() * W, y: R() * H, vx: (R() - 0.5) * 30, vy: (R() - 0.5) * 30, r: 1.2 + R() * 1.4 }); }
            }
            function skin() { dotS = a(K.brand, D ? 0.7 : 0.6); lineS = a(K.link, 1); }
            function draw(t, dt) {
                var i, j, p, q, dx, dy, d2, lim2 = lim * lim;
                g.clearRect(0, 0, W, H);
                if (dt) {
                    for (i = 0; i < P.length; i++) {
                        p = P[i];
                        p.x += p.vx * dt; p.y += p.vy * dt;
                        if (p.x < -10) { p.x = W + 10; } else if (p.x > W + 10) { p.x = -10; }
                        if (p.y < -10) { p.y = H + 10; } else if (p.y > H + 10) { p.y = -10; }
                    }
                }
                g.strokeStyle = lineS;
                g.lineWidth = 1;
                for (i = 0; i < P.length; i++) {
                    p = P[i];
                    for (j = i + 1; j < P.length; j++) {
                        q = P[j]; dx = p.x - q.x; dy = p.y - q.y; d2 = dx * dx + dy * dy;
                        if (d2 < lim2) {
                            g.globalAlpha = (1 - Math.sqrt(d2) / lim) * (D ? 0.4 : 0.35);
                            g.beginPath();
                            g.moveTo(p.x, p.y);
                            g.lineTo(q.x, q.y);
                            g.stroke();
                        }
                    }
                }
                g.globalAlpha = 1;
                g.fillStyle = dotS;
                g.beginPath();
                for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p.x + p.r, p.y); g.arc(p.x, p.y, p.r, 0, PI2); }
                g.fill();
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
