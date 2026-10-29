/* rapttor/yii2-themes background effect: gradient-flow. Slowly shifting multi-stop gradient from the theme colours (CSS only). */
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
    RapttorBg.register('gradient-flow', {
        start: function (layer, ctx) {
            var st = document.createElement('style'), el = document.createElement('div');
            st.textContent = '.tbg-gradient-flow{position:absolute;left:0;top:0;width:100%;height:100%;background-size:100% 100%,300% 300%;' +
                (ctx.reduced ? '' : 'animation:tbg-gradient-flow-move 70s ease-in-out infinite alternate;') + '}' +
                '@keyframes tbg-gradient-flow-move{from{background-position:0 0,0% 20%}to{background-position:0 0,100% 80%}}';
            el.className = 'tbg-gradient-flow';
            layer.appendChild(st);
            layer.appendChild(el);
            function paint() {
                var C = ctx.colors(), br = rgb(C.brand), lk = rgb(C.link), ac = rgb(C.accent), al = C.dark ? 0.3 : 0.22;
                layer.style.background = C.bg;
                el.style.backgroundImage = 'radial-gradient(ellipse at 15% 0%,' + a(br, al) + ',' + a(br, 0) + ' 60%),' +
                    'linear-gradient(120deg,' + a(br, al) + ' 0%,' + a(lk, al * 0.7) + ' 22%,' + a(lk, 0) + ' 42%,' + a(ac, al) + ' 62%,' + a(lk, al * 0.7) + ' 82%,' + a(br, al) + ' 100%)';
            }
            paint();
            ctx.onTheme(paint);
            return function () { st.remove(); el.remove(); };
        }
    });
})();
