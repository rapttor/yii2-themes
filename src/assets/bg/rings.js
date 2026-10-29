/* rapttor/yii2-themes background effect: rings. Concentric glowing rings, some dashed or partial, rotating like a halo or radar. */
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
    RapttorBg.register('rings', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var RG = [], cs = [], cx = 0, cy = 0, NONE = [];
            function init() {
                var i, m = Math.sqrt(W * W + H * H) / 2;
                cx = W * 0.5; cy = H * 0.5; RG = [];
                for (i = 0; i < 9; i++) {
                    RG.push({ r: m * (0.1 + 0.1 * i), w: i % 3 === 0 ? 1.6 : 1, dash: i % 2 ? [2 + (R() * 5 | 0), 8 + (R() * 14 | 0)] : NONE, arc: i % 3 === 1 ? PI2 * (0.4 + 0.4 * R()) : PI2, sp: (0.04 + 0.08 * R()) * (i % 2 ? -1 : 1), ph: R() * PI2, c: i % 3 });
                }
            }
            function skin() { cs = [a(K.link, D ? 0.38 : 0.32), a(K.brand, D ? 0.38 : 0.32), a(K.accent, D ? 0.34 : 0.3)]; }
            function draw(t, dt) {
                var i, b, r, rot;
                g.clearRect(0, 0, W, H);
                for (i = 0; i < RG.length; i++) {
                    b = RG[i];
                    r = b.r * (1 + 0.025 * Math.sin(t * 0.5 + i));
                    rot = b.ph + t * b.sp;
                    g.setLineDash(b.dash);
                    g.lineDashOffset = t * 8 * (b.sp < 0 ? -1 : 1);
                    g.strokeStyle = cs[b.c]; g.fillStyle = cs[b.c]; g.lineWidth = b.w;
                    g.beginPath();
                    g.arc(cx, cy, r, rot, rot + b.arc);
                    g.stroke();
                    if (b.arc < PI2) {
                        g.setLineDash(NONE);
                        g.beginPath();
                        g.arc(cx + Math.cos(rot + b.arc) * r, cy + Math.sin(rot + b.arc) * r, 3, 0, PI2);
                        g.fill();
                    }
                }
                g.setLineDash(NONE);
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
