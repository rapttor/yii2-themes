/* rapttor/yii2-themes background effect: blobs. Slow liquid colour blobs, lava-lamp feel (CSS transforms only). */
(function () {
    'use strict';
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
    RapttorBg.register('blobs', {
        start: function (layer, ctx) {
            var st = document.createElement('style'), els = [], i, e, n = window.innerWidth < 600 ? 4 : 5;
            function r(lo, hi) { return (lo + Math.random() * (hi - lo)).toFixed(1); }
            st.textContent = '.tbg-blobs{position:absolute;border-radius:50%;transform:translate3d(0,0,0);will-change:transform;' +
                (ctx.reduced ? '' : 'animation:tbg-blobs-move var(--d) ease-in-out infinite alternate;') + '}' +
                '@keyframes tbg-blobs-move{0%{transform:translate3d(0,0,0) scale(1)}' +
                '33%{transform:translate3d(var(--x1),var(--y1),0) scale(1.18,.88)}' +
                '66%{transform:translate3d(var(--x2),var(--y2),0) scale(.9,1.12)}' +
                '100%{transform:translate3d(var(--x3),var(--y3),0) scale(1.1)}}';
            layer.appendChild(st);
            for (i = 0; i < n; i++) {
                e = document.createElement('div');
                e.className = 'tbg-blobs';
                e.style.cssText = 'left:' + r(-5, 70) + '%;top:' + r(-10, 65) + '%;width:' + r(38, 62) + 'vmax;height:' + r(34, 56) + 'vmax;' +
                    '--d:' + r(28, 52) + 's;--x1:' + r(-18, 18) + 'vw;--y1:' + r(-18, 18) + 'vh;--x2:' + r(-18, 18) + 'vw;--y2:' + r(-18, 18) + 'vh;--x3:' + r(-18, 18) + 'vw;--y3:' + r(-18, 18) + 'vh;' +
                    'animation-delay:-' + r(0, 30) + 's';
                layer.appendChild(e);
                els.push(e);
            }
            function paint() {
                var C = ctx.colors(), cols = [rgb(C.brand), rgb(C.link), rgb(C.accent), rgb(C.brand), rgb(C.link)], al = C.dark ? 0.42 : 0.3, k;
                layer.style.background = C.bg;
                for (k = 0; k < els.length; k++) {
                    els[k].style.background = 'radial-gradient(closest-side,' + a(cols[k], al) + ',' + a(cols[k], al * 0.6) + ' 45%,' + a(cols[k], 0) + ' 100%)';
                }
            }
            paint();
            ctx.onTheme(paint);
            return function () { st.remove(); els.forEach(function (x) { x.remove(); }); };
        }
    });
})();
