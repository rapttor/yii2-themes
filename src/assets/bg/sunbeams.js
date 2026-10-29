/* rapttor/yii2-themes background effect: sunbeams. Soft god-rays fanning from the top-left corner with floating dust motes. */
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
    RapttorBg.register('sunbeams', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var RY = [], M = [], grd = null, ox = 0, oy = 0, L = 0, N = 7, dust = '';
            function init() {
                var i, n;
                ox = -W * 0.03; oy = -H * 0.1; L = Math.sqrt(W * W + H * H) * 1.1;
                RY = [];
                for (i = 0; i < N; i++) { RY.push({ an: 0.12 + 1.1 * (i + R() * 0.6) / N, w: 0.025 + 0.05 * R(), sp: 0.15 + 0.2 * R(), ph: R() * PI2, al: 0.5 + 0.5 * R() }); }
                n = cnt(26, 14, 50); M = [];
                for (i = 0; i < n; i++) { M.push({ r: RY[i % N], d: R() * L * 0.8, lat: (R() - 0.5) * 2, v: 3 + 6 * R(), s: 0.8 + 1.6 * R(), ph: R() * PI2 }); }
            }
            function skin() {
                var c = D ? mix(K.text, K.link, 0.25) : K.link;
                grd = g.createRadialGradient(ox, oy, 0, ox, oy, L);
                grd.addColorStop(0, a(c, 0.5)); grd.addColorStop(0.45, a(c, 0.18)); grd.addColorStop(1, a(c, 0));
                dust = a(D ? K.text : K.accent, 1);
            }
            function breathe(r, t) { return r.al * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * r.sp + r.ph))) * (D ? 0.6 : 0.55); }
            function draw(t, dt) {
                var i, r, m, x, y, d;
                g.clearRect(0, 0, W, H);
                g.fillStyle = grd;
                for (i = 0; i < N; i++) {
                    r = RY[i];
                    g.globalAlpha = breathe(r, t);
                    g.beginPath();
                    g.moveTo(ox, oy);
                    g.lineTo(ox + Math.cos(r.an - r.w) * L, oy + Math.sin(r.an - r.w) * L);
                    g.lineTo(ox + Math.cos(r.an + r.w) * L, oy + Math.sin(r.an + r.w) * L);
                    g.closePath();
                    g.fill();
                }
                g.fillStyle = dust;
                for (i = 0; i < M.length; i++) {
                    m = M[i];
                    if (dt) { m.d += m.v * dt; if (m.d > L * 0.8) { m.d = 0; } }
                    d = m.r.w * m.d * m.lat;
                    x = ox + Math.cos(m.r.an) * m.d - Math.sin(m.r.an) * d;
                    y = oy + Math.sin(m.r.an) * m.d + Math.cos(m.r.an) * d;
                    if (x < 0 || y < 0 || x > W || y > H) { continue; }
                    g.globalAlpha = breathe(m.r, t) * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.3 + m.ph))) * 1.3;
                    g.beginPath();
                    g.arc(x, y, m.s, 0, PI2);
                    g.fill();
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
