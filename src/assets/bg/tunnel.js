/* rapttor/yii2-themes background effect: tunnel. A slow flight through rounded-rectangle frames receding to a vanishing point, theme-coloured outlines with fog fade. */
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
    RapttorBg.register('tunnel', {
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
            var N = 16, cs = [], glow;
            function init() {}
            function skin() { var o = D ? 0.36 : 0.3; cs = [a(K.brand, o), a(K.link, o), a(K.accent, o)]; glow = sprite(K.accent, D ? 0.4 : 0.3); }
            function draw(t, dt) {
                var sp = t * 0.35, base = Math.floor(sp), off = sp - base, vx = W / 2 + Math.sin(t * 0.17) * W * 0.04, vy = H / 2 + Math.cos(t * 0.13) * H * 0.04;
                var i, q, hw, hh, cx, r, x0, y0, x1, y1, id, al, m = Math.max(W, H);
                g.clearRect(0, 0, W, H);
                g.drawImage(glow, vx - m * 0.25, vy - m * 0.25, m * 0.5, m * 0.5);
                g.save();
                g.translate(vx, vy); g.rotate(Math.sin(t * 0.07) * 0.06); g.translate(-vx, -vy);
                g.lineWidth = 1.5;
                for (i = N - 1; i >= 0; i--) {
                    q = i + 1 - off;
                    hw = W * 0.55 / (q * 0.9 + 0.15); hh = hw * H / W;
                    id = i + base;
                    cx = vx + Math.sin(t * 0.2 + q * 0.3) * 0.08 * hw;
                    al = Math.pow(Math.max(0, 1 - q / N), 1.5) * Math.min(1, q * 1.5) * 2.4;
                    r = Math.min(hw, hh) * (0.1 + 0.9 * (0.5 + 0.5 * Math.sin(t * 0.12 + id * 0.5)));
                    x0 = cx - hw; x1 = cx + hw; y0 = vy - hh; y1 = vy + hh;
                    g.globalAlpha = Math.min(1, al);
                    g.strokeStyle = cs[id % 3];
                    g.beginPath();
                    g.moveTo(x0 + r, y0);
                    g.arcTo(x1, y0, x1, y1, r); g.arcTo(x1, y1, x0, y1, r); g.arcTo(x0, y1, x0, y0, r); g.arcTo(x0, y0, x1, y0, r);
                    g.closePath();
                    g.stroke();
                }
                g.restore();
                g.globalAlpha = 1;
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
