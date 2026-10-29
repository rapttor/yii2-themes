/* rapttor/yii2-themes background effect: clouds. Slow drifting soft clouds. */
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
    RapttorBg.register('clouds', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var C = [], spr = [];
            function puff(c) {
                var s = document.createElement('canvas'), x = s.getContext('2d'), B = [[110, 140, 70], [190, 105, 85], [280, 115, 90], [370, 140, 68], [240, 150, 95], [150, 160, 60], [330, 165, 60]], i, b, gr;
                s.width = 480; s.height = 220;
                for (i = 0; i < B.length; i++) {
                    b = B[i];
                    gr = x.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
                    gr.addColorStop(0, a(c, 0.5));
                    gr.addColorStop(1, a(c, 0));
                    x.fillStyle = gr;
                    x.fillRect(b[0] - b[2], b[1] - b[2], b[2] * 2, b[2] * 2);
                }
                return s;
            }
            function init() {
                var n = W < 600 ? 5 : 8, i, s;
                C = [];
                for (i = 0; i < n; i++) {
                    s = 0.7 + R() * 1.3;
                    C.push({ x: -480 * s + R() * (W + 480 * s), y: H * R() * 0.75 - 60, s: s, v: (5 + R() * 8) * s, al: 0.35 + R() * 0.45, k: i % 2 });
                }
            }
            function skin() { spr = [puff(D ? mix(K.link, K.text, 0.25) : K.link), puff(D ? K.brand : mix(K.brand, K.accent, 0.4))]; }
            function draw(t, dt) {
                var i, c;
                g.clearRect(0, 0, W, H);
                for (i = 0; i < C.length; i++) {
                    c = C[i];
                    if (dt) { c.x += c.v * dt; if (c.x > W) { c.x = -480 * c.s; } }
                    g.globalAlpha = c.al * (D ? 0.55 : 0.7);
                    g.drawImage(spr[c.k], c.x, c.y, 480 * c.s, 220 * c.s);
                }
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
