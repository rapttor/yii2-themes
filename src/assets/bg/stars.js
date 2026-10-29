/* rapttor/yii2-themes background effect: stars. Twinkling night sky with an occasional shooting star. */
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
    RapttorBg.register('stars', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var S = [], sh = null, nextS = 3, fill = '', shootC;
            function init() {
                var n = cnt(170, 60, 320), i;
                S = [];
                sh = null;
                for (i = 0; i < n; i++) { S.push({ x: R() * W, y: R() * H, r: 0.5 + R() * R() * 1.4, sp: 0.8 + R() * 2.2, ph: R() * PI2 }); }
            }
            function skin() {
                fill = a(D ? mix(K.text, K.link, 0.25) : K.brand, 1);
                shootC = D ? K.text : K.brand;
            }
            function draw(t, dt) {
                var i, s, base = D ? 0.85 : 0.5, ang, tx, ty, al, gr;
                g.clearRect(0, 0, W, H);
                g.fillStyle = fill;
                for (i = 0; i < S.length; i++) {
                    s = S[i];
                    g.globalAlpha = base * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)));
                    g.beginPath();
                    g.arc(s.x, s.y, s.r, 0, PI2);
                    g.fill();
                }
                g.globalAlpha = 1;
                if (dt && !sh && t > nextS) {
                    ang = 0.35 + R() * 0.4;
                    sh = { x: R() * W * 0.8, y: R() * H * 0.4, vx: Math.cos(ang) * W * 0.9, vy: Math.sin(ang) * W * 0.9, life: 0 };
                }
                if (sh) {
                    sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.life += dt;
                    al = Math.sin(Math.min(1, sh.life / 0.9) * Math.PI);
                    tx = sh.x - sh.vx * 0.12; ty = sh.y - sh.vy * 0.12;
                    gr = g.createLinearGradient(sh.x, sh.y, tx, ty);
                    gr.addColorStop(0, a(shootC, al * 0.9));
                    gr.addColorStop(1, a(shootC, 0));
                    g.strokeStyle = gr;
                    g.lineWidth = 1.5;
                    g.beginPath();
                    g.moveTo(sh.x, sh.y);
                    g.lineTo(tx, ty);
                    g.stroke();
                    if (sh.life > 0.9) { sh = null; nextS = t + 5 + R() * 8; }
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
