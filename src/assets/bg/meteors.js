/* rapttor/yii2-themes background effect: meteors. Night sky with faint static stars and occasional diagonal meteors. */
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
    RapttorBg.register('meteors', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var NS = 0, SX, SY, SZ, M = [], nxt = 1, sc = [], mc = '';
            function launch(m) {
                var an = 0.5 + 0.35 * R(), sp = 520 + 300 * R();
                m.vx = -Math.cos(an) * sp; m.vy = Math.sin(an) * sp; m.sp = sp;
                m.x = W * (0.3 + 0.9 * R()); m.y = -20 + R() * H * 0.4;
                m.life = 0.7 + 0.5 * R(); m.age = 0; m.len = 110 + 90 * R(); m.on = true;
            }
            function init() {
                var i;
                NS = cnt(70, 40, 150);
                SX = new Float32Array(NS); SY = new Float32Array(NS); SZ = new Uint8Array(NS);
                for (i = 0; i < NS; i++) { SX[i] = R() * W; SY[i] = R() * H; SZ[i] = R() < 0.2 ? 1 : 0; }
                M = [];
                for (i = 0; i < 3; i++) { M.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, sp: 1, age: 0, life: 1, len: 100 }); }
                launch(M[0]); M[0].age = M[0].life * 0.35; M[0].x = W * 0.7; M[0].y = H * 0.15;
                nxt = 2;
            }
            function skin() { sc = [a(D ? K.text : K.muted, D ? 0.4 : 0.35), a(D ? K.link : K.brand, D ? 0.6 : 0.5)]; mc = a(D ? mix(K.text, K.link, 0.2) : K.brand, 1); }
            function draw(t, dt) {
                var i, k, m, f, ux, uy;
                if (dt) {
                    nxt -= dt;
                    if (nxt <= 0) { for (i = 0; i < 3; i++) { if (!M[i].on) { launch(M[i]); break; } } nxt = 1.8 + 3.2 * R(); }
                    for (i = 0; i < 3; i++) {
                        m = M[i];
                        if (!m.on) { continue; }
                        m.age += dt; m.x += m.vx * dt; m.y += m.vy * dt;
                        if (m.age > m.life) { m.on = false; }
                    }
                }
                g.clearRect(0, 0, W, H);
                for (k = 0; k < 2; k++) {
                    g.fillStyle = sc[k];
                    for (i = 0; i < NS; i++) { if (SZ[i] === k) { g.fillRect(SX[i], SY[i], 1 + k * 0.6, 1 + k * 0.6); } }
                }
                g.strokeStyle = mc; g.lineCap = 'round';
                for (i = 0; i < 3; i++) {
                    m = M[i];
                    if (!m.on) { continue; }
                    f = Math.sin(Math.PI * Math.min(1, m.age / m.life));
                    ux = m.vx / m.sp; uy = m.vy / m.sp;
                    for (k = 0; k < 8; k++) {
                        g.globalAlpha = f * (1 - k / 8) * (D ? 0.8 : 0.6);
                        g.lineWidth = 2 * (1 - k / 12);
                        g.beginPath();
                        g.moveTo(m.x - ux * m.len * k / 8, m.y - uy * m.len * k / 8);
                        g.lineTo(m.x - ux * m.len * (k + 1) / 8, m.y - uy * m.len * (k + 1) / 8);
                        g.stroke();
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
