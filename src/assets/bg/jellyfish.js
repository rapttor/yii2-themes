/* rapttor/yii2-themes background effect: jellyfish. A few translucent jellyfish with pulsing bells and trailing tentacles drifting upward through a tinted water gradient. */
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
    RapttorBg.register('jellyfish', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var J = [], cs = [], water;
            function init() {
                var n = cnt(4, 3, 7), i;
                J = [];
                for (i = 0; i < n; i++) { J.push({ x: R() * W, y: R() * H * 1.2, s: 30 + R() * 34, ph: R() * PI2, sp: 0.5 + R() * 0.5, vy: 10 + R() * 14, dr: R() * PI2, c: i % 3 }); }
            }
            function skin() {
                cs = [K.brand, K.link, K.accent];
                water = g.createLinearGradient(0, 0, 0, H);
                water.addColorStop(0, a(K.link, D ? 0.1 : 0.06));
                water.addColorStop(1, a(K.brand, D ? 0.3 : 0.17));
            }
            function jelly(j, t, dt) {
                var c = cs[j.c], p = Math.sin(t * j.sp * 2.2 + j.ph), w, h, x, y, s = j.s, k, q, ax, ay;
                j.y -= j.vy * dt; j.x += Math.sin(t * 0.3 + j.dr) * 8 * dt;
                if (j.y < -s * 5) { j.y = H + s * 2; j.x = R() * W; }
                x = j.x; y = j.y; w = s * (1 + 0.1 * p); h = s * (0.75 - 0.12 * p);
                g.fillStyle = a(c, D ? 0.04 : 0.03);
                g.beginPath(); g.ellipse(x, y - h * 0.3, w * 1.9, h * 1.7, 0, 0, PI2); g.fill();
                g.beginPath(); g.ellipse(x, y - h * 0.3, w * 1.4, h * 1.3, 0, 0, PI2); g.fill();
                g.beginPath();
                g.moveTo(x - w, y);
                g.bezierCurveTo(x - w, y - h * 1.35, x + w, y - h * 1.35, x + w, y);
                g.quadraticCurveTo(x, y + h * 0.25, x - w, y);
                g.fillStyle = a(c, D ? 0.15 : 0.12);
                g.fill();
                g.strokeStyle = a(c, D ? 0.38 : 0.3);
                g.lineWidth = 1.2;
                g.stroke();
                g.strokeStyle = a(c, D ? 0.26 : 0.2);
                g.beginPath();
                for (k = 0; k < 7; k++) {
                    ax = x - w * 0.8 + k * w * 1.6 / 6;
                    g.moveTo(ax, y);
                    for (q = 1; q <= 9; q++) { g.lineTo(ax + Math.sin(t * 1.4 - q * 0.7 + k + j.ph) * s * 0.05 * q, y + q * s * 0.26 + p * q * 0.8); }
                }
                g.stroke();
            }
            function draw(t, dt) {
                var i;
                g.clearRect(0, 0, W, H);
                g.fillStyle = water;
                g.fillRect(0, 0, W, H);
                for (i = 0; i < J.length; i++) { jelly(J[i], t, dt); }
            }
            function theme() {
                var C = ctx.colors();
                D = C.dark;
                K = { bg: rgb(C.bg), surface: rgb(C.surface), text: rgb(C.text), muted: rgb(C.muted), brand: rgb(C.brand), link: rgb(C.link), accent: rgb(C.accent) };
                P = [K.brand, K.link, K.accent];
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
