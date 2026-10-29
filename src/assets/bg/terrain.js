/* rapttor/yii2-themes background effect: terrain. A retro wireframe terrain: a perspective mesh with hills and a valley scrolls toward a low sun on the horizon. */
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
    RapttorBg.register('terrain', {
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
            var C = 24, RW = 20, NC = C * 2 + 1, PX, PY, hy = 0, sun, bgs = '';
            function init() { hy = H * 0.5; PX = new Float32Array(RW * NC); PY = new Float32Array(RW * NC); }
            function skin() { sun = sprite(K.accent, D ? 0.55 : 0.4); bgs = a(K.bg, 1); }
            function hill(c, z, t) { return Math.sin(c * 0.45 + z * 0.35 + t * 0.12) * 0.55 + Math.sin(c * 0.21 - z * 0.6 + 1.7) * 0.45 + Math.sin(c * 0.9 + z * 0.15) * 0.15; }
            function draw(t, dt) {
                var sp = t * 1.1, base = Math.floor(sp), fr = sp - base, r, c, q, u, un, o, y, k, al, umax = 1 / 0.45, umin = 1 / (0.45 + 0.11 * RW);
                var colw = W * 0.17, sr = H * 0.13;
                g.clearRect(0, 0, W, H);
                g.drawImage(sun, W / 2 - H * 0.55, hy - H * 0.55, H * 1.1, H * 1.1);
                g.fillStyle = a(K.accent, D ? 0.4 : 0.32);
                g.beginPath(); g.arc(W / 2, hy - H * 0.01, H * 0.11, 0, PI2); g.fill();
                for (r = 0; r < RW; r++) {
                    q = r + 1 - fr;
                    u = 1 / (0.45 + 0.11 * q);
                    un = (u - umin) / (umax - umin);
                    y = hy + (H - hy) * 1.1 * un;
                    for (c = -C; c <= C; c++) {
                        o = r * NC + c + C;
                        PX[o] = W / 2 + c * colw * u / umax;
                        PY[o] = y - hill(c, r + base, t) * Math.min(1, Math.abs(c) / 4) * u / umax * sr;
                    }
                }
                g.lineWidth = 1.2;
                for (r = RW - 1; r >= 0; r--) {
                    q = r + 1 - fr;
                    al = Math.pow(Math.max(0, 1 - q / RW), 0.8) * 0.6;
                    k = r * NC;
                    g.beginPath();
                    g.moveTo(PX[k], H + 4);
                    for (c = 0; c < NC; c++) { g.lineTo(PX[k + c], PY[k + c]); }
                    g.lineTo(PX[k + NC - 1], H + 4);
                    g.closePath();
                    g.fillStyle = bgs;
                    g.fill();
                    g.strokeStyle = a(K.link, al);
                    g.beginPath();
                    for (c = 0; c < NC; c++) { if (c) { g.lineTo(PX[k + c], PY[k + c]); } else { g.moveTo(PX[k], PY[k]); } }
                    g.stroke();
                    if (r < RW - 1) {
                        g.strokeStyle = a(K.brand, al);
                        g.beginPath();
                        for (c = 0; c < NC; c++) { g.moveTo(PX[k + NC + c], PY[k + NC + c]); g.lineTo(PX[k + c], PY[k + c]); }
                        g.stroke();
                    }
                }
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
