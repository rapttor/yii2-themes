/* rapttor/yii2-themes background effect: lightning-storm. A dark stormy sky with drifting cloud banks and a rare, gentle lightning flash (one smooth branching bolt, no strobing). */
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
    RapttorBg.register('lightning-storm', {
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
            var CL = [], spr, glow, sky, SEG = new Float32Array(5 * 90), ns = 0, nextF = 0, fT = -99, fc;
            function init() {
                var n = cnt(14, 10, 26), i;
                CL = [];
                for (i = 0; i < n; i++) { CL.push({ x: R() * W, y: H * (0.04 + 0.5 * R()), r: 140 + R() * 180, v: 5 + R() * 15, al: 0.2 + R() * 0.2, asp: 0.45 + R() * 0.2 }); }
                nextF = 0;
            }
            function skin() {
                fc = D ? K.link : K.accent;
                spr = sprite(K.muted, 0.55); glow = sprite(fc, 0.5);
                sky = g.createLinearGradient(0, 0, 0, H);
                sky.addColorStop(0, D ? a(mix(K.surface, K.brand, 0.2), 0.85) : a(K.muted, 0.38));
                sky.addColorStop(1, a(D ? K.bg : K.muted, 0));
            }
            function trace(x, y, ang, len, steps, w) {
                var i, nx, ny;
                for (i = 0; i < steps && ns < 88; i++) {
                    nx = x + Math.sin(ang) * len + (R() - 0.5) * len * 0.9; ny = y + Math.cos(ang) * len;
                    SEG[ns * 5] = x; SEG[ns * 5 + 1] = y; SEG[ns * 5 + 2] = nx; SEG[ns * 5 + 3] = ny; ns++;
                    if (w > 0.6 && R() < 0.2) { trace(nx, ny, ang + (R() < 0.5 ? -0.8 : 0.8), len * 0.7, 3 + (R() * 3 | 0), w * 0.5); }
                    x = nx; y = ny;
                }
            }
            function bolt() { ns = 0; trace(W * (0.15 + 0.7 * R()), 0, 0, H * 0.5 / 14, 14, 1); }
            function draw(t, dt) {
                var i, age, fl = 0, o;
                if (!nextF) { nextF = t + 3 + R() * 3; }
                if (!ctx.reduced && dt && t >= nextF) { bolt(); fT = t; nextF = t + 6 + R() * 4; }
                age = t - fT;
                if (age >= 0 && age < 4) { fl = Math.min(age / 0.25, 1) * Math.exp(-Math.max(0, age - 0.25) * 2.2); }
                g.clearRect(0, 0, W, H);
                g.fillStyle = sky;
                g.fillRect(0, 0, W, H);
                for (i = 0; i < CL.length; i++) {
                    o = CL[i];
                    o.x += o.v * dt;
                    if (o.x - o.r > W) { o.x = -o.r; }
                    g.globalAlpha = o.al * (1 + fl * 1.5);
                    g.drawImage(spr, o.x - o.r, o.y - o.r * o.asp, o.r * 2, o.r * 2 * o.asp);
                }
                if (fl > 0.01) {
                    g.globalAlpha = fl * 0.5;
                    g.drawImage(glow, SEG[0] - H * 0.4, -H * 0.2, H * 0.8, H * 0.8);
                    g.globalAlpha = 1;
                    g.fillStyle = a(fc, 0.08 * fl);
                    g.fillRect(0, 0, W, H);
                    g.lineJoin = 'round';
                    for (i = 0; i < 2; i++) {
                        g.strokeStyle = a(fc, (i ? 0.55 : 0.14) * fl);
                        g.lineWidth = i ? 1.4 : 5;
                        g.beginPath();
                        for (o = 0; o < ns; o++) { g.moveTo(SEG[o * 5], SEG[o * 5 + 1]); g.lineTo(SEG[o * 5 + 2], SEG[o * 5 + 3]); }
                        g.stroke();
                    }
                }
                g.globalAlpha = 1;
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
