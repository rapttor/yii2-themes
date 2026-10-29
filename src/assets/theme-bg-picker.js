/* rapttor/yii2-themes: the Backgrounds tab of the picker. Every choice previews at once (CSS variables + <html data-bg*>, see
   theme-bg.js for the animated ones); the hidden field holds the JSON the form saves. Photos come through the server (Unsplash key stays there). */
(function () {
    'use strict';
    var root = document.documentElement;
    var box = document.querySelector('.bg-picker');
    var field = document.querySelector('[data-bg-field]');
    var modes = document.querySelector('.theme-modes');
    if (!box || !field) { return; }

    /* Palette / Patterns / Live / Photos: the first shows the colour themes, the others the sections of the background picker */
    var BG_TABS = { patterns: 1, live: 1, photos: 1 };
    function pane(name) {
        var show = BG_TABS[name] ? 'backgrounds' : 'palette';
        document.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== show; });
        box.querySelectorAll('[data-bg-section]').forEach(function (s) { s.classList.toggle('is-tab-hidden', s.getAttribute('data-bg-section') !== name); });
        document.querySelectorAll('[data-pane-tab]').forEach(function (b) {
            var on = b.getAttribute('data-pane-tab') === name;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        if (name === 'photos') { loadPhotos(); }
        try { sessionStorage.setItem('rapttor-theme-pane', name); } catch (e) {}
    }
    modes.addEventListener('click', function (e) { var b = e.target.closest('[data-pane-tab]'); if (b) { pane(b.getAttribute('data-pane-tab')); } });

    /* Live tab: category chips (Nature, Space, ...), one at a time; opens on the category of the active effect, else the first */
    function liveGroup(name) {
        box.querySelectorAll('[data-live-group]').forEach(function (b) { var on = b.getAttribute('data-live-group') === name; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        box.querySelectorAll('.bg-tile[data-bg-kind="anim"]').forEach(function (t) { t.classList.toggle('is-tab-hidden', name !== 'all' && t.getAttribute('data-bg-group') !== name); });
        try { sessionStorage.setItem('rapttor-live-group', name); } catch (e) {}
    }
    box.addEventListener('click', function (e) { var c = e.target.closest('[data-live-group]'); if (c) { liveGroup(c.getAttribute('data-live-group')); } });

    var st = null; /* {k,id,c,c2,a,u,pid,by,un,o,p,pal} or null = no background */
    try { st = field.value ? JSON.parse(field.value) : null; } catch (e) { st = null; }
    var photoSection = box.querySelector('[data-bg-photos]');
    var results = box.querySelector('[data-bg-results]');
    var more = box.querySelector('[data-bg-more]');
    var searchUrl = box.getAttribute('data-search-url');
    var previewUrl = box.getAttribute('data-preview-url');
    var query = '', page = 1, pages = 1, loaded = false, paletteTimer = null;

    function isDark() { return root.getAttribute('data-mode') === 'dark' || (!root.getAttribute('data-mode') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
    function q(sel) { return box.querySelector(sel); }
    function tile(kind, id) { return box.querySelector('.bg-tile[data-bg-kind="' + kind + '"][data-bg-id="' + id + '"]'); }

    function imageCss() {
        if (!st) { return ''; }
        if (st.k === 'static' || (st.k === 'gradient' && st.id !== 'custom')) { var t = tile(st.k, st.id); return t ? t.getAttribute('data-bg-css') : ''; }
        if (st.k === 'gradient') { return 'linear-gradient(' + st.a + 'deg,' + st.c + ',' + st.c2 + ')'; }
        if (st.k === 'solid') { return st.c; }
        if (st.k === 'img') { return 'url("https://images.unsplash.com/' + st.u + '?auto=format&fit=crop&w=1800&q=70") center/cover no-repeat,' + (st.c || '#222222'); }
        return 'var(--bg)';
    }
    function overlayCss() {
        if (!st || st.o === 'n' || !st.p) { return 'transparent'; }
        return 'rgba(' + (st.o === 'w' ? '255,255,255' : '0,0,0') + ',' + (st.p / 100) + ')';
    }
    function paletteTheme() {
        if (!st) { return null; }
        if (st.k === 'solid' || (st.k === 'gradient' && st.id === 'custom')) { return box.querySelector('.bg-solid[data-bg-theme]') ? 'custom' : null; }
        if (st.k === 'img') { return st.pc && st.pc.length > 1 && box.querySelector('.bg-solid[data-bg-theme]') ? 'custom' : null; } /* the photo's own five colours, built by the server as the user-defined theme */
        var t = tile(st.k, st.id);
        return t ? t.getAttribute('data-bg-theme') : null;
    }
    function luminance(hex) {
        var n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }

    function applyTheme() {
        var P = window.RapttorThemePreview;
        if (!P) { return; }
        clearTimeout(paletteTimer);
        var theme = st && st.pal ? paletteTheme() : null;
        if (!theme) { P.restore(); return; }
        if (theme !== 'custom') { var o = P.option(theme); if (o) { P.show(o.css, o.attrs); } else { P.restore(); } return; }
        var value = st.k === 'img' ? (st.pm || 'dark') + ':' + st.pc.join(',') : (luminance(st.c) < 0.3 ? 'dark' : 'light') + ':' + st.c;
        if (!previewUrl) { return; }
        paletteTimer = setTimeout(function () {
            fetch(previewUrl + (previewUrl.indexOf('?') > -1 ? '&' : '?') + 'theme=custom&custom=' + encodeURIComponent(value), { credentials: 'same-origin' })
                .then(function (r) { return r.json(); }).then(function (p) { P.show(p.css, p.attrs); }).catch(function () {});
        }, 120);
    }

    function applyPage() {
        var style = document.getElementById('theme-bg-vars');
        if (!style) { style = document.createElement('style'); style.id = 'theme-bg-vars'; document.head.appendChild(style); }
        ['data-bg', 'data-bg-id', 'data-bg-credit', 'data-liquid'].forEach(function (a) { root.removeAttribute(a); });
        if (!st) { style.textContent = ''; } else {
            style.textContent = ':root{--tbg-image:' + imageCss() + ';--tbg-overlay:' + overlayCss() + ';' + (st.l ? '--tbg-liquid:' + (100 - st.l) + '%;' : '') + '}';
            root.setAttribute('data-bg', st.k);
            if (st.l) { root.setAttribute('data-liquid', ''); } else { root.removeAttribute('data-liquid'); }
            if (st.k === 'img') { root.setAttribute('data-bg-credit', [st.by || '', st.un || '', st.pid || ''].join('|').replace(/["<>&]/g, '')); }
            else if (st.id) { root.setAttribute('data-bg-id', st.id); }
        }
        applyTheme();
        if (window.RapttorBg) { window.RapttorBg.sync(); }
    }

    function render() {
        field.value = st ? JSON.stringify(st) : '';
        box.querySelectorAll('.bg-tile, .bg-custom').forEach(function (t) {
            var k = t.getAttribute('data-bg-kind'), id = t.getAttribute('data-bg-id');
            var on = st ? (k === st.k && (k === 'solid' || k === 'img' || id === st.id)) : k === 'none';
            if (k === 'img') { on = false; }
            t.classList.toggle('is-on', on);
            if (t.hasAttribute('aria-pressed')) { t.setAttribute('aria-pressed', on ? 'true' : 'false'); }
        });
        box.querySelectorAll('.bg-photo').forEach(function (b) { b.classList.toggle('is-on', !!st && st.k === 'img' && st.u === b.getAttribute('data-u')); });
        var controls = q('.bg-controls');
        controls.classList.toggle('is-off', !st);
        if (st) {
            box.querySelectorAll('[data-bg-overlay]').forEach(function (r) { r.checked = r.value === st.o; });
            q('[data-bg-alpha]').value = st.p;
            q('[data-bg-alpha-out]').textContent = st.p + '%';
        }
        q('[data-bg-liquid]').checked = !!(st && st.l);
        if (st && st.l) { q('[data-bg-liquid-amount]').value = st.l; q('[data-bg-liquid-out]').textContent = st.l + '%'; }
        var pbox = q('[data-bg-palette-box]');
        var showPal = !!(st && st.k === 'img' && st.pc && st.pc.length > 1);
        pbox.hidden = !showPal;
        if (showPal) {
            var sw = q('[data-bg-swatches]');
            sw.innerHTML = '';
            st.pc.forEach(function (c) { var i = document.createElement('i'); i.className = 'bg-swatch'; i.style.background = c; i.title = c; sw.appendChild(i); });
            box.querySelectorAll('[data-bg-pmode]').forEach(function (r) { r.checked = r.value === (st.pm || 'dark'); });
        }
        var pal = q('[data-bg-palette]');
        var has = !!paletteTheme();
        pal.disabled = !has;
        pal.checked = !!(st && st.pal && has);
        pal.parentNode.classList.toggle('is-off', !has);
        applyPage();
    }

    /* "Liquid interface" starts on when the host's liquidDefault is set; users toggle it below */
    function liquidStart() { var d = parseInt(box.getAttribute('data-liquid-default'), 10) || 0; return d > 0 ? Math.max(10, Math.min(70, d)) : 0; }

    /* Five dominant colours of a photo (median cut on a 48 px thumbnail), most dominant first. Done here, in the browser: Unsplash images
       allow cross-origin reads; if the read fails the photo simply has no palette. The server only ever sees five validated hex colours. */
    function medianCut(px, n) {
        var boxes = [px];
        while (boxes.length < n) {
            var bi = -1, best = 0, ch = 0;
            boxes.forEach(function (b, i) {
                if (b.length < 2) { return; }
                var lo = [255, 255, 255], hi = [0, 0, 0];
                b.forEach(function (p) { for (var c = 0; c < 3; c++) { if (p[c] < lo[c]) { lo[c] = p[c]; } if (p[c] > hi[c]) { hi[c] = p[c]; } } });
                var r = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]], m = Math.max(r[0], r[1], r[2]);
                if (m * Math.sqrt(b.length) > best) { best = m * Math.sqrt(b.length); bi = i; ch = r.indexOf(m); }
            });
            if (bi < 0 || best < 8) { break; }
            var b = boxes[bi].sort(function (x, y) { return x[ch] - y[ch]; }), mid = b.length >> 1;
            boxes.splice(bi, 1, b.slice(0, mid), b.slice(mid));
        }
        return boxes.sort(function (a, b) { return b.length - a.length; }).map(function (b) {
            var s = [0, 0, 0]; b.forEach(function (p) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; });
            return '#' + s.map(function (v) { return ('0' + Math.round(v / b.length).toString(16)).slice(-2); }).join('');
        });
    }
    function extract(u, done) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            try {
                var w = 48, h = Math.max(8, Math.round(48 * img.naturalHeight / img.naturalWidth)), cv = document.createElement('canvas');
                cv.width = w; cv.height = h;
                var cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, w, h);
                var d = cx.getImageData(0, 0, w, h).data, px = [];
                for (var i = 0; i < d.length; i += 4) { if (d[i + 3] > 200) { px.push([d[i], d[i + 1], d[i + 2]]); } }
                done(px.length > 10 ? medianCut(px, 5) : null);
            } catch (e) { done(null); }
        };
        img.onerror = function () { done(null); };
        img.src = 'https://images.unsplash.com/' + u + '?auto=format&fit=crop&w=96&q=50';
    }
    function pickPhoto(s) {
        choose(s);
        extract(s.u, function (cols) {
            if (!st || st.u !== s.u || !cols || cols.length < 2) { return; }
            st.pc = cols;
            if (!st.pm) { st.pm = luminance(cols[0]) > 0.45 ? 'light' : 'dark'; } /* a bright photo starts with the light version */
            render();
        });
    }

    function choose(next) {
        if (next && !st) { next.o = isDark() ? 'b' : 'w'; next.p = 35; next.pal = 0; next.l = liquidStart(); }
        else if (next && st) { next.o = st.o; next.p = st.p; next.pal = st.pal; next.l = st.l; }
        st = next;
        render();
    }

    box.addEventListener('click', function (e) {
        var t = e.target.closest('.bg-tile');
        if (t && !t.classList.contains('bg-solid')) {
            var kind = t.getAttribute('data-bg-kind');
            if (kind === 'none') { choose(null); return; }
            choose({ k: kind, id: t.getAttribute('data-bg-id') });
            return;
        }
        if (e.target.closest('[data-bg-remove]')) { choose(null); return; }
        var ph = e.target.closest('.bg-photo');
        if (ph) {
            pickPhoto({ k: 'img', u: ph.getAttribute('data-u'), pid: ph.getAttribute('data-pid'), c: ph.getAttribute('data-c') || undefined, by: ph.getAttribute('data-by'), un: ph.getAttribute('data-un') });
            if (searchUrl && ph.getAttribute('data-pid')) { fetch(searchUrl + (searchUrl.indexOf('?') > -1 ? '&' : '?') + 'track=' + encodeURIComponent(ph.getAttribute('data-pid')), { credentials: 'same-origin' }).catch(function () {}); }
            return;
        }
        var topic = e.target.closest('[data-bg-topic]');
        if (topic) { q('[data-bg-q]').value = topic.getAttribute('data-bg-topic'); search(topic.getAttribute('data-bg-topic')); return; }
        if (e.target.closest('[data-bg-search]')) { search(q('[data-bg-q]').value); return; }
        if (e.target.closest('[data-bg-more]')) { fetchPhotos(page + 1, true); }
    });

    box.addEventListener('input', function (e) {
        var el = e.target;
        if (el.hasAttribute('data-bg-color')) { choose({ k: 'solid', c: el.value }); return; }
        if (el.hasAttribute('data-bg-c1') || el.hasAttribute('data-bg-c2') || el.hasAttribute('data-bg-angle')) {
            choose({ k: 'gradient', id: 'custom', c: q('[data-bg-c1]').value, c2: q('[data-bg-c2]').value, a: parseInt(q('[data-bg-angle]').value, 10) });
            return;
        }
        if (el.hasAttribute('data-bg-liquid-amount') && st) { st.l = parseInt(el.value, 10); render(); return; }
        if (el.hasAttribute('data-bg-alpha') && st) { st.p = parseInt(el.value, 10); if (st.p > 0 && st.o === 'n') { st.o = isDark() ? 'b' : 'w'; } render(); }
    });
    box.addEventListener('change', function (e) {
        var el = e.target;
        if (el.hasAttribute('data-bg-overlay') && st) { st.o = el.value; if (st.o !== 'n' && !st.p) { st.p = 35; } render(); }
        if (el.hasAttribute('data-bg-liquid') && st) { st.l = el.checked ? parseInt(q('[data-bg-liquid-amount]').value, 10) : 0; render(); }
        if (el.hasAttribute('data-bg-pmode') && st) { st.pm = el.value; render(); }
        if (el.hasAttribute('data-bg-palette') && st) { st.pal = el.checked ? 1 : 0; render(); }
    });
    /* choosing another theme in the Colours tab ends a palette preview: that choice is shown again (the background keeps its own colours only while ticked) */
    document.addEventListener('change', function (e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-theme-key') && st && st.pal) { st.pal = 0; render(); }
    });

    /* Unsplash photos */
    function search(text) { query = text.trim(); page = 1; results.innerHTML = ''; fetchPhotos(1, false); }
    function loadPhotos() { if (photoSection && !loaded) { loaded = true; fetchPhotos(1, false); } }
    function fetchPhotos(n, append) {
        if (!searchUrl) { return; }
        fetch(searchUrl + (searchUrl.indexOf('?') > -1 ? '&' : '?') + 'q=' + encodeURIComponent(query) + '&page=' + n, { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d.configured === false) { photoSection.remove(); var pt = document.querySelector('[data-pane-tab="photos"]'); if (pt) { pt.remove(); } pane('patterns'); return; }
                page = n; pages = d.pages || 1;
                if (!append) { results.innerHTML = ''; }
                (d.results || []).forEach(function (p) {
                    var b = document.createElement('button');
                    b.type = 'button'; b.className = 'bg-photo';
                    b.setAttribute('data-u', p.u); b.setAttribute('data-pid', p.pid); b.setAttribute('data-c', p.c || ''); b.setAttribute('data-by', p.by); b.setAttribute('data-un', p.un);
                    b.title = (p.alt ? p.alt + ' - ' : '') + p.by;
                    b.style.backgroundImage = 'url("' + p.thumb + '")';
                    if (p.c) { b.style.backgroundColor = p.c; }
                    var span = document.createElement('span'); span.textContent = p.by; b.appendChild(span);
                    results.appendChild(b);
                });
                if (more) { more.hidden = page >= pages; }
                render();
            }).catch(function () { loaded = false; });
    }
    var qin = q('[data-bg-q]');
    if (qin) { qin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); search(qin.value); } }); }

    (function () {
        var active = st && st.k === 'anim' ? tile('anim', st.id) : null, g = active ? active.getAttribute('data-bg-group') : null;
        if (!g) { try { g = sessionStorage.getItem('rapttor-live-group'); } catch (e) {} }
        var first = box.querySelector('[data-live-group]:not([data-live-group=all])');
        liveGroup(g && box.querySelector('[data-live-group="' + g + '"]') ? g : (first ? first.getAttribute('data-live-group') : 'all'));
    })();
    var start = 'palette';
    try { start = sessionStorage.getItem('rapttor-theme-pane') || start; } catch (e) {}
    if (start === 'backgrounds') { start = 'patterns'; }
    pane(document.querySelector('[data-pane-tab="' + start + '"]') ? start : 'palette');
    render();
})();
