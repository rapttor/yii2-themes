/* rapttor/yii2-themes background effect: fog. Slow drifting soft fog banks with three parallax layers. */
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
    RapttorBg.register('fog', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var B = [], SP = [];
            function sprite(c) {
                var s = document.createElement('canvas'), q = s.getContext('2d'), gr;
                s.width = s.height = 128;
                gr = q.createRadialGradient(64, 64, 0, 64, 64, 64);
                gr.addColorStop(0, a(c, 1)); gr.addColorStop(0.5, a(c, 0.45)); gr.addColorStop(1, a(c, 0));
                q.fillStyle = gr; q.fillRect(0, 0, 128, 128);
                return s;
            }
            function init() {
                var n = cnt(5, 5, 9), i, l;
                B = [];
                for (i = 0; i < n; i++) {
                    l = i % 3;
                    B.push({ x: R() * W, y: H * (0.1 + 0.8 * R()), s: Math.max(240, W * 0.3) * (0.8 + 0.5 * R()) * (0.8 + 0.3 * l), v: (4 + 7 * l) * (R() < 0.5 ? -1 : 1), k: i % 2, al: 0.16 + 0.06 * l, ph: R() * PI2 });
                }
            }
            function skin() { SP = [sprite(D ? mix(K.text, K.link, 0.35) : mix(K.muted, K.link, 0.3)), sprite(D ? K.link : K.brand)]; }
            function draw(t, dt) {
                var i, b;
                g.clearRect(0, 0, W, H);
                for (i = 0; i < B.length; i++) {
                    b = B[i];
                    if (dt) {
                        b.x += b.v * dt;
                        if (b.x > W + b.s) { b.x = -b.s; } else if (b.x < -b.s) { b.x = W + b.s; }
                    }
                    g.globalAlpha = b.al * (D ? 1 : 1.2);
                    g.drawImage(SP[b.k], b.x - b.s, b.y + Math.sin(t * 0.1 + b.ph) * 20 - b.s * 0.45, b.s * 2, b.s * 0.9);
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
