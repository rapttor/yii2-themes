/* rapttor/yii2-themes background effect: swirl. Flow field: thousands of tiny fading trails on a faded canvas. */
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
    RapttorBg.register('swirl', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var NP = 0, PX, PY, AG, LF, cs = [], pre = 0;
            function field(x, y, t) { return (Math.sin(x * 0.0035 + t * 0.08) + Math.cos(y * 0.004 - t * 0.06) + Math.sin((x + y) * 0.0022 + t * 0.04)) * 1.7; }
            function spawn(i) { PX[i] = R() * W; PY[i] = R() * H; AG[i] = 0; LF[i] = 2 + R() * 4; }
            function init() {
                var i;
                NP = cnt(700, 500, 1800);
                PX = new Float32Array(NP); PY = new Float32Array(NP); AG = new Float32Array(NP); LF = new Float32Array(NP);
                for (i = 0; i < NP; i++) { spawn(i); AG[i] = R() * LF[i]; }
            }
            function skin() { pre = 0; cs = [a(K.link, D ? 0.5 : 0.4), a(K.brand, D ? 0.5 : 0.4), a(K.accent, D ? 0.45 : 0.35)]; }
            function sim(t, dt) {
                var i, k, x, y, an;
                g.globalCompositeOperation = 'destination-out';
                g.fillStyle = 'rgba(0,0,0,0.06)';
                g.fillRect(0, 0, W, H);
                g.globalCompositeOperation = 'source-over';
                g.lineWidth = 1;
                for (k = 0; k < 3; k++) {
                    g.strokeStyle = cs[k];
                    g.beginPath();
                    for (i = k; i < NP; i += 3) {
                        x = PX[i]; y = PY[i];
                        an = field(x, y, t);
                        PX[i] = x + Math.cos(an) * 90 * dt; PY[i] = y + Math.sin(an) * 90 * dt;
                        AG[i] += dt;
                        if (AG[i] > LF[i] || PX[i] < 0 || PX[i] > W || PY[i] < 0 || PY[i] > H) { spawn(i); } else { g.moveTo(x, y); g.lineTo(PX[i], PY[i]); }
                    }
                    g.stroke();
                }
            }
            function draw(t, dt) {
                var k;
                if (!pre) {
                    pre = 1;
                    g.clearRect(0, 0, W, H);
                    for (k = 0; k < 140; k++) { sim(t + k / 60, 1 / 60); }
                }
                if (dt) { sim(t, dt); }
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
