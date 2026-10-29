/* rapttor/yii2-themes background effect: fireworks. Subtle slow fireworks: rockets rise and burst into fading sparkles, low frequency. */
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
    RapttorBg.register('fireworks', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var SM = 260, SX, SY, SVX, SVY, SL, SA, SK, si = 0, RK = [], nxt = 1, cs = [];
            function burst(x, y, c) {
                var n = 40 + (R() * 30 | 0), s0 = 70 + R() * 60, k, an, sp;
                for (k = 0; k < n; k++) {
                    si = (si + 1) % SM;
                    an = k * PI2 / n + R() * 0.2; sp = s0 * (0.55 + 0.45 * R());
                    SX[si] = x; SY[si] = y; SVX[si] = Math.cos(an) * sp; SVY[si] = Math.sin(an) * sp;
                    SL[si] = 1.5 + R(); SA[si] = 0; SK[si] = R() < 0.25 ? (c + 1) % 3 : c;
                }
            }
            function step(dt) {
                var i, r, f = 1 - 1.3 * dt;
                nxt -= dt;
                if (nxt <= 0) {
                    for (i = 0; i < RK.length; i++) { if (!RK[i].on) { r = RK[i]; r.on = true; r.x = W * (0.15 + 0.7 * R()); r.y = H + 10; r.vy = -(160 + 80 * R()); r.ty = H * (0.2 + 0.3 * R()); r.c = (R() * 3) | 0; break; } }
                    nxt = 2.5 + 3 * R();
                }
                for (i = 0; i < RK.length; i++) {
                    r = RK[i];
                    if (!r.on) { continue; }
                    r.y += r.vy * dt;
                    if (r.y <= r.ty) { r.on = false; burst(r.x, r.y, r.c); }
                }
                for (i = 0; i < SM; i++) {
                    if (SL[i] <= 0) { continue; }
                    SA[i] += dt;
                    if (SA[i] >= SL[i]) { SL[i] = 0; continue; }
                    SVX[i] *= f; SVY[i] = SVY[i] * f + 35 * dt;
                    SX[i] += SVX[i] * dt; SY[i] += SVY[i] * dt;
                }
            }
            function init() {
                var i;
                SX = new Float32Array(SM); SY = new Float32Array(SM); SVX = new Float32Array(SM); SVY = new Float32Array(SM); SL = new Float32Array(SM); SA = new Float32Array(SM); SK = new Uint8Array(SM);
                RK = [];
                for (i = 0; i < 3; i++) { RK.push({ on: false, x: 0, y: 0, vy: 0, ty: 0, c: 0 }); }
                nxt = 1.5;
                burst(W * 0.6, H * 0.35, 0);
                for (i = 0; i < 12; i++) { step(0.05); }
                nxt = 1.5;
            }
            function skin() { cs = [a(K.link, 1), a(K.brand, 1), a(K.accent, 1)]; }
            function draw(t, dt) {
                var i, c, r, f;
                if (dt) { step(dt); }
                g.clearRect(0, 0, W, H);
                g.lineWidth = 1.5;
                for (i = 0; i < RK.length; i++) {
                    r = RK[i];
                    if (!r.on) { continue; }
                    g.strokeStyle = cs[r.c]; g.globalAlpha = 0.6;
                    g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x, r.y + 16); g.stroke();
                }
                for (c = 0; c < 3; c++) {
                    g.fillStyle = cs[c];
                    for (i = 0; i < SM; i++) {
                        if (SL[i] <= 0 || SK[i] !== c) { continue; }
                        f = 1 - SA[i] / SL[i];
                        g.globalAlpha = f * f * (D ? 0.85 : 0.75);
                        g.fillRect(SX[i] - 1, SY[i] - 1, 2, 2);
                    }
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
