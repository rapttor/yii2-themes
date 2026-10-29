/* rapttor/yii2-themes background effect: prism-currents. Thousands of short fading trails following a curl-like noise field, coloured by flow direction like iridescent currents. */
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
    RapttorBg.register('prism-currents', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop, P = [];
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var NP = 0, PX, PY, AG, LF, SG = [], cn = [0, 0, 0, 0], cs = [], pre = 0;
            function spawn(i) { PX[i] = R() * W; PY[i] = R() * H; AG[i] = 0; LF[i] = 2 + R() * 4; }
            function init() {
                var i;
                NP = cnt(1100, 700, 2600);
                PX = new Float32Array(NP); PY = new Float32Array(NP); AG = new Float32Array(NP); LF = new Float32Array(NP);
                SG = [];
                for (i = 0; i < 4; i++) { SG.push(new Float32Array(NP * 4)); }
                for (i = 0; i < NP; i++) { spawn(i); AG[i] = R() * LF[i]; }
            }
            function skin() {
                var o = D ? 0.5 : 0.6;
                pre = 0;
                cs = [a(K.link, o), a(K.brand, o), a(K.accent, o), a(mix(K.link, K.accent, 0.5), o)];
            }
            function sim(t, dt) {
                var i, b, x, y, nx, ny, A, B, Cc, E, vx, vy, m, st, sp, o;
                g.globalCompositeOperation = 'destination-out';
                g.fillStyle = 'rgba(0,0,0,0.07)';
                g.fillRect(0, 0, W, H);
                g.globalCompositeOperation = 'source-over';
                cn[0] = cn[1] = cn[2] = cn[3] = 0;
                for (i = 0; i < NP; i++) {
                    x = PX[i]; y = PY[i];
                    A = 0.0045 * Math.cos(x * 0.0045 + t * 0.07); B = Math.sin(y * 0.0052 - t * 0.05);
                    Cc = Math.sin(x * 0.0031 + y * 0.0027 + t * 0.05); E = Math.cos(y * 0.0083 - t * 0.04);
                    vx = Math.sin(x * 0.0045 + t * 0.07) * 0.0052 * Math.cos(y * 0.0052 - t * 0.05) + 0.6 * (Math.cos(x * 0.0031 + y * 0.0027 + t * 0.05) * 0.0027 * E - Cc * 0.0083 * Math.sin(y * 0.0083 - t * 0.04));
                    vy = -(A * B + 0.6 * Math.cos(x * 0.0031 + y * 0.0027 + t * 0.05) * 0.0031 * E);
                    m = Math.sqrt(vx * vx + vy * vy) + 1e-6;
                    st = dt * (60 + 70 * Math.min(1, m * 220)) / m;
                    nx = x + vx * st; ny = y + vy * st;
                    b = Math.min(3, ((Math.atan2(vy, vx) + Math.PI) / PI2 * 4) | 0);
                    AG[i] += dt;
                    PX[i] = nx; PY[i] = ny;
                    if (AG[i] > LF[i] || nx < 0 || nx > W || ny < 0 || ny > H) { spawn(i); } else {
                        o = cn[b]; sp = SG[b];
                        sp[o] = x; sp[o + 1] = y; sp[o + 2] = nx; sp[o + 3] = ny;
                        cn[b] = o + 4;
                    }
                }
                g.lineWidth = 1.1;
                for (b = 0; b < 4; b++) {
                    g.strokeStyle = cs[b];
                    g.beginPath();
                    sp = SG[b];
                    for (i = 0; i < cn[b]; i += 4) { g.moveTo(sp[i], sp[i + 1]); g.lineTo(sp[i + 2], sp[i + 3]); }
                    g.stroke();
                }
            }
            function draw(t, dt) {
                var k;
                if (!pre) {
                    pre = 1;
                    g.clearRect(0, 0, W, H);
                    for (k = 0; k < 130; k++) { sim(t + k / 60, 1 / 60); }
                }
                if (dt) { sim(t, dt); }
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
