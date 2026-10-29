/* rapttor/yii2-themes background effect: galaxy. A slowly rotating spiral galaxy of tiny stars with a soft core. */
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
    RapttorBg.register('galaxy', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var N = 0, SR, ST, SS, SC, cx = 0, cy = 0, RM = 0, core = null, cl = [], CA = Math.cos(0.45), SA = Math.sin(0.45);
            function init() {
                var i, r;
                cx = W * 0.5; cy = H * 0.5; RM = Math.min(W, H * 1.7) * 0.46;
                N = cnt(900, 600, 1600);
                SR = new Float32Array(N); ST = new Float32Array(N); SS = new Float32Array(N); SC = new Uint8Array(N);
                for (i = 0; i < N; i++) {
                    r = RM * Math.pow(R(), 1.6);
                    SR[i] = r;
                    ST[i] = r / RM * 5 + (i & 1) * Math.PI + (R() + R() + R() - 1.5) * 0.45 * (0.4 + r / RM * 0.6);
                    SS[i] = R() < 0.15 ? 2.2 : 1.5;
                    SC[i] = r / RM < 0.25 ? 0 : (R() < 0.5 ? 1 : 2);
                }
            }
            function skin() {
                var c = D ? mix(K.text, K.accent, 0.3) : K.accent;
                cl = [a(c, D ? 0.95 : 0.8), a(D ? mix(K.text, K.link, 0.4) : K.link, D ? 0.85 : 0.75), a(D ? mix(K.text, K.brand, 0.4) : K.brand, D ? 0.75 : 0.7)];
                core = g.createRadialGradient(cx, cy, 0, cx, cy, RM * 0.35);
                core.addColorStop(0, a(c, D ? 0.32 : 0.28)); core.addColorStop(1, a(c, 0));
            }
            function draw(t, dt) {
                var i, c, th, ex, ey, rot = t * 0.03;
                g.clearRect(0, 0, W, H);
                g.fillStyle = core;
                g.fillRect(cx - RM * 0.4, cy - RM * 0.4, RM * 0.8, RM * 0.8);
                for (c = 0; c < 3; c++) {
                    g.fillStyle = cl[c];
                    for (i = 0; i < N; i++) {
                        if (SC[i] !== c) { continue; }
                        th = ST[i] + rot * (1.6 - SR[i] / RM);
                        ex = Math.cos(th) * SR[i]; ey = Math.sin(th) * SR[i] * 0.5;
                        g.fillRect(cx + ex * CA - ey * SA, cy + ex * SA + ey * CA, SS[i], SS[i]);
                    }
                }
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
