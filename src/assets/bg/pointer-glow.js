/* rapttor/yii2-themes background effect: pointer-glow. A soft glow of theme colours that eases after the pointer and drifts on a Lissajous path when idle. */
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
    RapttorBg.register('pointer-glow', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            function sprite(c, o) {
                var s = document.createElement('canvas'), x = s.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
                s.width = s.height = 128;
                gr.addColorStop(0, a(c, o)); gr.addColorStop(0.5, a(c, o * 0.4)); gr.addColorStop(1, a(c, 0));
                x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
                return s;
            }
            var px = 0, py = 0, qx = 0, qy = 0, sx = 0, sy = 0, tx = 0, ty = 0, last = -99, ok = 0, spr = [];
            function init() { if (!ok) { ok = 1; px = qx = sx = tx = W / 2; py = qy = sy = ty = H / 2; } }
            function skin() { var o = D ? 0.5 : 0.36; spr = [sprite(K.brand, o), sprite(K.link, o * 0.9), sprite(K.accent, o * 0.8)]; }
            function blob(s, x, y, r) { g.drawImage(s, x - r, y - r, r * 2, r * 2); }
            function draw(t, dt) {
                var e = 1 - Math.exp(-dt * 2.2), m = Math.max(W, H);
                if (t - last > 4) { tx = W * (0.5 + 0.36 * Math.sin(t * 0.21)); ty = H * (0.5 + 0.34 * Math.sin(t * 0.33 + 1.3)); }
                px += (tx - px) * e; py += (ty - py) * e;
                qx += (px - qx) * e * 0.6; qy += (py - qy) * e * 0.6;
                sx += (qx - sx) * e * 0.5; sy += (qy - sy) * e * 0.5;
                g.clearRect(0, 0, W, H);
                blob(spr[2], sx, sy, m * 0.36);
                blob(spr[1], qx, qy, m * 0.3);
                blob(spr[0], px, py, m * 0.24);
            }
            function mv(e) { tx = e.clientX; ty = e.clientY; last = T; }
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
            if (!ctx.reduced) { window.addEventListener('pointermove', mv, { passive: true }); }
            ctx.onTheme(theme);
            stopLoop = ctx.loop(function (t, dt) { T = t; draw(t, dt); });
            return function () {
                stopLoop();
                clearTimeout(rt);
                window.removeEventListener('resize', onResize);
                window.removeEventListener('pointermove', mv);
                cv.remove();
            };
        }
    });
})();
