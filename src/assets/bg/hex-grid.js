/* rapttor/yii2-themes background effect: hex-grid. A hexagon grid where random cells softly light up and fade. */
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
    RapttorBg.register('hex-grid', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var S = 34, hh = 0, cols = 0, rows = 0, off = null, LT = [], nxt = 0, line = '', fl = [], HX = [], HY = [], i0;
            for (i0 = 0; i0 < 6; i0++) { HX.push(Math.cos(i0 * Math.PI / 3) * S); HY.push(Math.sin(i0 * Math.PI / 3) * S); }
            function hex(q, x, y) {
                var k;
                q.moveTo(x + HX[0], y + HY[0]);
                for (k = 1; k < 6; k++) { q.lineTo(x + HX[k], y + HY[k]); }
                q.closePath();
            }
            function px(i) { return (i % cols) * S * 1.5 - S; }
            function py(i) { return ((i / cols) | 0) * hh + ((i % cols) & 1) * hh / 2 - hh; }
            function lite(c) {
                var i, o;
                for (i = 0; i < LT.length; i++) {
                    if (LT[i].i < 0) { o = LT[i]; o.i = (R() * cols * rows) | 0; o.life = 2 + 3 * R(); o.age = c ? o.life * R() * 0.8 : 0; o.c = (R() * 3) | 0; return; }
                }
            }
            function init() {
                var i;
                hh = S * Math.sqrt(3); cols = Math.ceil(W / (S * 1.5)) + 3; rows = Math.ceil(H / hh) + 3; LT = [];
                for (i = 0; i < 14; i++) { LT.push({ i: -1, age: 0, life: 1, c: 0 }); }
                for (i = 0; i < 6; i++) { lite(true); }
                nxt = 0.3;
            }
            function skin() {
                var q, i;
                line = a(D ? mix(K.text, K.link, 0.3) : K.link, D ? 0.09 : 0.12);
                fl = [a(K.brand, 1), a(K.link, 1), a(K.accent, 1)];
                off = document.createElement('canvas'); off.width = Math.round(W * dpr); off.height = Math.round(H * dpr);
                q = off.getContext('2d'); q.setTransform(dpr, 0, 0, dpr, 0, 0);
                q.strokeStyle = line; q.lineWidth = 1; q.beginPath();
                for (i = 0; i < cols * rows; i++) { hex(q, px(i), py(i)); }
                q.stroke();
            }
            function draw(t, dt) {
                var i, o;
                g.clearRect(0, 0, W, H);
                g.drawImage(off, 0, 0, W, H);
                if (dt) { nxt -= dt; if (nxt <= 0) { lite(false); nxt = 0.25 + 0.4 * R(); } }
                for (i = 0; i < LT.length; i++) {
                    o = LT[i];
                    if (o.i < 0) { continue; }
                    o.age += dt;
                    if (o.age > o.life) { o.i = -1; continue; }
                    g.globalAlpha = Math.sin(Math.PI * o.age / o.life) * (D ? 0.3 : 0.24);
                    g.fillStyle = fl[o.c];
                    g.beginPath();
                    hex(g, px(o.i), py(o.i));
                    g.fill();
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
