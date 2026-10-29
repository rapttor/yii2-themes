/* rapttor/yii2-themes background effect: kaleidoscope. A slowly rotating 6-fold mirrored kaleidoscope: one wedge of drifting soft shapes is rendered offscreen and mirrored around the centre. */
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
    RapttorBg.register('kaleidoscope', {
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
            var wc = document.createElement('canvas'), wg = wc.getContext('2d'), RR = 0, sh = [], spr = [], ln = [];
            function init() {
                var i;
                RR = Math.hypot(W, H) / 2 + 10;
                wc.width = Math.ceil(RR * 0.5); wc.height = Math.ceil(RR * 0.45);
                sh = [];
                for (i = 0; i < 9; i++) { sh.push({ x: R(), y: R() * 0.87, r: 0.1 + R() * 0.16, asp: 0.4 + R() * 0.6, vx: (R() - 0.5) * 0.03, vy: (R() - 0.5) * 0.03, c: i % 3 }); }
            }
            function skin() { var o = D ? 0.55 : 0.42; spr = [sprite(K.brand, o), sprite(K.link, o), sprite(K.accent, o)]; ln = [a(K.brand, 0.35), a(K.link, 0.35), a(K.accent, 0.35)]; }
            function draw(t, dt) {
                var i, s, k, u = wc.width, rot = t * 0.04;
                wg.clearRect(0, 0, wc.width, wc.height);
                for (i = 0; i < sh.length; i++) {
                    s = sh[i];
                    s.x += s.vx * dt; s.y += s.vy * dt;
                    if (s.x < 0 || s.x > 1) { s.vx = -s.vx; }
                    if (s.y < 0 || s.y > 0.87) { s.vy = -s.vy; }
                    wg.drawImage(spr[s.c], (s.x - s.r) * u, (s.y - s.r * s.asp) * u, s.r * 2 * u, s.r * 2 * s.asp * u);
                    wg.strokeStyle = ln[s.c]; wg.beginPath(); wg.ellipse(s.x * u, s.y * u, s.r * 0.55 * u, s.r * 0.55 * s.asp * u, s.x * 3, 0, PI2); wg.stroke();
                }
                g.clearRect(0, 0, W, H);
                for (k = 0; k < 6; k++) {
                    g.save();
                    g.translate(W / 2, H / 2);
                    g.rotate(rot + (k % 2 ? (k + 1) : k) * Math.PI / 3);
                    if (k % 2) { g.scale(1, -1); }
                    g.beginPath();
                    g.moveTo(0, 0);
                    g.arc(0, 0, RR, -0.006, Math.PI / 3 + 0.006);
                    g.closePath();
                    g.clip();
                    g.drawImage(wc, 0, 0, RR, RR * wc.height / wc.width);
                    g.restore();
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
                wc.width = wc.height = 0;
                cv.remove();
            };
        }
    });
})();
