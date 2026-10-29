/* rapttor/yii2-themes background effect: birds. Boids flocking: small chevrons flying in loose flocks. */
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
    RapttorBg.register('birds', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var N = 0, X, Y, VX, VY, hd, nx, gw = 0, gh = 0, CS = 70, fill = '';
            function cell(v, n) { return Math.min(n - 1, Math.max(0, (v / CS) | 0)); }
            function init() {
                var i, f, cx = 0, cy = 0, an = 0;
                N = cnt(34, 20, 70);
                X = new Float32Array(N); Y = new Float32Array(N); VX = new Float32Array(N); VY = new Float32Array(N); nx = new Int16Array(N);
                gw = Math.ceil(W / CS) + 1; gh = Math.ceil(H / CS) + 1; hd = new Int16Array(gw * gh);
                for (i = 0; i < N; i++) {
                    if (i % 9 === 0) { cx = R() * W; cy = R() * H; an = R() * PI2; }
                    X[i] = cx + (R() - 0.5) * 160; Y[i] = cy + (R() - 0.5) * 120;
                    f = an + (R() - 0.5) * 0.6;
                    VX[i] = Math.cos(f) * 50; VY[i] = Math.sin(f) * 50;
                }
            }
            function skin() { fill = a(D ? mix(K.text, K.link, 0.3) : K.link, D ? 0.6 : 0.5); }
            function step(dt) {
                var i, j, c, cx, cy, gx, gy, n, ax, ay, px, py, sx, sy, dx, dy, d2, sp, k = dt * 60;
                hd.fill(-1);
                for (i = 0; i < N; i++) {
                    c = cell(Y[i], gh) * gw + cell(X[i], gw);
                    nx[i] = hd[c]; hd[c] = i;
                }
                for (i = 0; i < N; i++) {
                    cx = cell(X[i], gw); cy = cell(Y[i], gh);
                    n = 0; ax = ay = px = py = sx = sy = 0;
                    for (gy = Math.max(0, cy - 1); gy <= Math.min(gh - 1, cy + 1); gy++) {
                        for (gx = Math.max(0, cx - 1); gx <= Math.min(gw - 1, cx + 1); gx++) {
                            for (j = hd[gy * gw + gx]; j >= 0; j = nx[j]) {
                                if (j === i) { continue; }
                                dx = X[j] - X[i]; dy = Y[j] - Y[i]; d2 = dx * dx + dy * dy;
                                if (d2 < CS * CS) {
                                    n++; ax += VX[j]; ay += VY[j]; px += X[j]; py += Y[j];
                                    if (d2 < 484) { sx -= dx; sy -= dy; }
                                }
                            }
                        }
                    }
                    if (n) {
                        VX[i] += ((ax / n - VX[i]) * 0.04 + (px / n - X[i]) * 0.003 + sx * 0.02) * k;
                        VY[i] += ((ay / n - VY[i]) * 0.04 + (py / n - Y[i]) * 0.003 + sy * 0.02) * k;
                    }
                    sp = Math.sqrt(VX[i] * VX[i] + VY[i] * VY[i]) || 1;
                    sp = sp < 38 ? 38 / sp : (sp > 62 ? 62 / sp : 1);
                    VX[i] *= sp; VY[i] *= sp;
                }
                for (i = 0; i < N; i++) {
                    X[i] += VX[i] * dt; Y[i] += VY[i] * dt;
                    if (X[i] < -12) { X[i] = W + 12; } else if (X[i] > W + 12) { X[i] = -12; }
                    if (Y[i] < -12) { Y[i] = H + 12; } else if (Y[i] > H + 12) { Y[i] = -12; }
                }
            }
            function draw(t, dt) {
                var i, sp, c, s, w;
                if (dt) { step(dt); }
                g.clearRect(0, 0, W, H);
                g.fillStyle = fill;
                g.beginPath();
                for (i = 0; i < N; i++) {
                    sp = Math.sqrt(VX[i] * VX[i] + VY[i] * VY[i]) || 1;
                    c = VX[i] / sp; s = VY[i] / sp;
                    w = 4 * (0.6 + 0.4 * Math.sin(t * 8 + i));
                    g.moveTo(X[i] + c * 7, Y[i] + s * 7);
                    g.lineTo(X[i] - c * 5 + s * w, Y[i] - s * 5 - c * w);
                    g.lineTo(X[i] - c * 2.5, Y[i] - s * 2.5);
                    g.lineTo(X[i] - c * 5 - s * w, Y[i] - s * 5 + c * w);
                    g.closePath();
                }
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
