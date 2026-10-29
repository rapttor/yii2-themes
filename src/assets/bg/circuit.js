/* rapttor/yii2-themes background effect: circuit. Circuit-board traces with small light pulses travelling along them. */
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
    RapttorBg.register('circuit', {
        start: function (layer, ctx) {
            var cv = document.createElement('canvas'), g = cv.getContext('2d');
            var W = 0, H = 0, dpr = 1, K, D, T = 0, rt = 0, stopLoop;
            cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
            layer.appendChild(cv);
            function cnt(base, min, max) { return Math.max(min, Math.min(max, Math.round(base * W * H / 1e6))); }
            var TR = [], PU = [], lineC = '', dotC = '', GS = 44, XX = 0, YY = 0, DIR = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
            function build() {
                var p = [], x = (1 + R() * (W / GS - 2) | 0) * GS, y = (1 + R() * (H / GS - 2) | 0) * GS, d = (R() * 4 | 0) * 2, n = 5 + (R() * 8 | 0), k, t, len, nx, ny, cum, i, tr;
                p.push(x, y);
                for (k = 0; k < n; k++) {
                    for (t = 0; t < 5; t++) {
                        len = 1 + (R() * 4 | 0);
                        nx = x + DIR[d][0] * len * GS; ny = y + DIR[d][1] * len * GS;
                        if (nx > GS && nx < W - GS && ny > GS && ny < H - GS) { break; }
                        d = (d + 1 + (R() * 7 | 0)) % 8; nx = x; ny = y;
                    }
                    if (nx === x && ny === y) { break; }
                    p.push(nx, ny); x = nx; y = ny;
                    d = (d + (R() < 0.5 ? 1 : 7) + (R() < 0.4 ? (R() < 0.5 ? 1 : 7) : 0)) % 8;
                }
                cum = [0];
                for (i = 2; i < p.length; i += 2) { cum.push(cum[i / 2 - 1] + Math.sqrt(Math.pow(p[i] - p[i - 2], 2) + Math.pow(p[i + 1] - p[i - 1], 2))); }
                tr = { p: p, cum: cum, len: cum[cum.length - 1] };
                return tr;
            }
            function at(tr, s) {
                var i = 1, f;
                while (i < tr.cum.length - 1 && tr.cum[i] < s) { i++; }
                f = (s - tr.cum[i - 1]) / ((tr.cum[i] - tr.cum[i - 1]) || 1);
                XX = tr.p[2 * i - 2] + (tr.p[2 * i] - tr.p[2 * i - 2]) * f; YY = tr.p[2 * i - 1] + (tr.p[2 * i + 1] - tr.p[2 * i - 1]) * f;
            }
            function init() {
                var n = cnt(12, 8, 24), i, tr;
                TR = []; PU = [];
                for (i = 0; i < n; i++) {
                    tr = build();
                    if (tr.len < GS) { continue; }
                    TR.push(tr);
                    PU.push({ tr: tr, s: R() * tr.len * 1.2 - tr.len * 0.2, v: 90 + 90 * R() });
                }
            }
            function skin() { lineC = a(D ? mix(K.text, K.link, 0.3) : K.link, D ? 0.16 : 0.2); dotC = a(D ? mix(K.text, K.accent, 0.3) : K.accent, 1); }
            function draw(t, dt) {
                var i, j, k, tr, o, e;
                g.clearRect(0, 0, W, H);
                g.strokeStyle = lineC; g.lineWidth = 1.2;
                for (i = 0; i < TR.length; i++) {
                    tr = TR[i]; e = tr.p.length;
                    g.beginPath();
                    g.moveTo(tr.p[0], tr.p[1]);
                    for (j = 2; j < e; j += 2) { g.lineTo(tr.p[j], tr.p[j + 1]); }
                    g.stroke();
                    g.beginPath();
                    g.arc(tr.p[0], tr.p[1], 3, 0, PI2);
                    g.moveTo(tr.p[e - 2] + 3, tr.p[e - 1]);
                    g.arc(tr.p[e - 2], tr.p[e - 1], 3, 0, PI2);
                    g.stroke();
                }
                g.fillStyle = dotC;
                for (i = 0; i < PU.length; i++) {
                    o = PU[i];
                    if (dt) { o.s += o.v * dt; if (o.s > o.tr.len + 30) { o.s = -R() * o.tr.len * 0.6; o.v = 90 + 90 * R(); } }
                    for (k = 0; k < 4; k++) {
                        if (o.s - k * 7 < 0 || o.s - k * 7 > o.tr.len) { continue; }
                        at(o.tr, o.s - k * 7);
                        g.globalAlpha = (D ? 0.9 : 0.75) * (1 - k * 0.25);
                        g.beginPath();
                        g.arc(XX, YY, 2.6 - k * 0.4, 0, PI2);
                        g.fill();
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
