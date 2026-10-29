/* rapttor/yii2-themes background effect: rain. Slanted rain streaks with ripples. */
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
    RapttorBg.register('rain', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var Dr = [], Rp = [], acc = 0, slant = 0.2, lineS = '', ringS = '';
            function spawn(age) {
                var i, r;
                for (i = 0; i < Rp.length; i++) {
                    r = Rp[i];
                    if (!r.on) { r.on = true; r.x = R() * W; r.y = H * (0.4 + R() * 0.58); r.age = age; r.size = 18 + R() * 26; return; }
                }
            }
            function init() {
                var n = cnt(110, 40, 200), i;
                Dr = []; Rp = [];
                for (i = 0; i < n; i++) { Dr.push({ x: R() * (W + H * slant) - H * slant, y: R() * H, len: 12 + R() * 22, v: 520 + R() * 380 }); }
                for (i = 0; i < 10; i++) { Rp.push({ on: false, x: 0, y: 0, age: 0, size: 20 }); }
                for (i = 0; i < 4; i++) { spawn(R() * 1.2); }
            }
            function skin() {
                lineS = a(D ? mix(K.link, K.text, 0.3) : K.link, D ? 0.3 : 0.4);
                ringS = a(K.link, 1);
            }
            function draw(t, dt) {
                var i, d, r, k;
                g.clearRect(0, 0, W, H);
                if (dt) { acc += dt * 3; while (acc >= 1) { acc--; spawn(0); } }
                g.strokeStyle = lineS;
                g.lineWidth = 1;
                g.beginPath();
                for (i = 0; i < Dr.length; i++) {
                    d = Dr[i];
                    if (dt) {
                        d.y += d.v * dt; d.x += d.v * slant * dt;
                        if (d.y > H) { d.y = -d.len; d.x = R() * (W + H * slant) - H * slant; }
                    }
                    g.moveTo(d.x, d.y);
                    g.lineTo(d.x + d.len * slant, d.y + d.len);
                }
                g.stroke();
                g.strokeStyle = ringS;
                for (i = 0; i < Rp.length; i++) {
                    r = Rp[i];
                    if (!r.on) { continue; }
                    if (dt) { r.age += dt; }
                    k = r.age / 1.4;
                    if (k >= 1) { r.on = false; continue; }
                    g.globalAlpha = (1 - k) * 0.5;
                    g.beginPath();
                    g.ellipse(r.x, r.y, 3 + k * r.size, (3 + k * r.size) * 0.35, 0, 0, PI2);
                    g.stroke();
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
