/* rapttor/yii2-themes background effect: ripples. Concentric ripples spawning at random points. */
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
    RapttorBg.register('ripples', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var Rp = [], acc = 0, maxR = 300, cs = [];
            function spawn(age) {
                var i, r;
                for (i = 0; i < Rp.length; i++) {
                    r = Rp[i];
                    if (!r.on) { r.on = true; r.x = R() * W; r.y = R() * H; r.age = age; r.c = (R() * 3) | 0; return; }
                }
            }
            function init() {
                var i;
                maxR = Math.min(W, H) * 0.4 + 60;
                Rp = []; acc = 0;
                for (i = 0; i < 8; i++) { Rp.push({ on: false, x: 0, y: 0, age: 0, c: 0 }); }
                for (i = 0; i < 4; i++) { spawn(R() * 5); }
            }
            function skin() { cs = [a(K.brand, 1), a(K.link, 1), a(K.accent, 1)]; }
            function draw(t, dt) {
                var i, j, r, k, e, rad;
                g.clearRect(0, 0, W, H);
                if (dt) { acc += dt; if (acc > 1.4) { acc = 0; spawn(0); } }
                for (i = 0; i < Rp.length; i++) {
                    r = Rp[i];
                    if (!r.on) { continue; }
                    if (dt) { r.age += dt; }
                    k = r.age / 6;
                    if (k >= 1) { r.on = false; continue; }
                    e = 1 - (1 - k) * (1 - k);
                    g.strokeStyle = cs[r.c];
                    for (j = 0; j < 3; j++) {
                        rad = maxR * e - j * 14;
                        if (rad <= 0) { continue; }
                        g.globalAlpha = (1 - k) * (D ? 0.4 : 0.45) * (1 - j * 0.3);
                        g.lineWidth = 1.5 - j * 0.4;
                        g.beginPath();
                        g.arc(r.x, r.y, rad, 0, PI2);
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
