/* ============================================
   ARCANTH PROJECT — themes.js
   Sezon Tema Sistemi: Normal / Ramazan / Yılbaşı
   ============================================ */

var ThemeSystem = (function () {
    'use strict';

    var currentTheme = 'normal';
    var snowAnimFrame = null;
    var BANNER_H = 56;

    function init() {
        db.ref('site_data/settings/active_theme').on('value', function (snap) {
            var theme = snap.val() || 'normal';
            applyTheme(theme);
        });
    }

    function applyTheme(theme) {
        currentTheme = theme;
        removePreviousTheme();
        if (theme === 'ramadan') applyRamadan();
        else if (theme === 'newyear') applyNewyear();
    }

    function removePreviousTheme() {
        var b = document.getElementById('season-banner');
        if (b) b.remove();
        var s = document.getElementById('snow-canvas');
        if (s) s.remove();
        var st = document.getElementById('season-styles');
        if (st) st.remove();
        if (snowAnimFrame) { cancelAnimationFrame(snowAnimFrame); snowAnimFrame = null; }
        document.body.classList.remove('season-active', 'theme-ramadan', 'theme-newyear');
        var nav = document.querySelector('nav');
        if (nav) nav.style.top = '';
    }

    /* ================================================
       RAMAZAN BANNER — Premium
    ================================================ */
    function applyRamadan() {
        document.body.classList.add('season-active', 'theme-ramadan');

        var style = document.createElement('style');
        style.id = 'season-styles';
        style.textContent =
            '@keyframes rmShimmer{0%{background-position:200% center}100%{background-position:-200% center}}' +
            '@keyframes rmMoonGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(52,211,153,0.5)) drop-shadow(0 0 20px rgba(52,211,153,0.2))}50%{filter:drop-shadow(0 0 14px rgba(52,211,153,0.9)) drop-shadow(0 0 35px rgba(52,211,153,0.4))}}' +
            '@keyframes rmStarPulse{0%,100%{opacity:.2;transform:scale(1) rotate(0deg)}50%{opacity:.8;transform:scale(1.3) rotate(20deg)}}' +
            '@keyframes rmLineGlow{0%,100%{opacity:.3}50%{opacity:.8}}' +
            '@keyframes rmOrb{0%,100%{opacity:.06;transform:scale(1)}50%{opacity:.12;transform:scale(1.15)}}' +
            '@keyframes rmSlideIn{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
        document.head.appendChild(style);

        var banner = document.createElement('div');
        banner.id = 'season-banner';
        banner.style.cssText =
            'position:fixed;top:0;left:0;right:0;z-index:9998;height:' + BANNER_H + 'px;' +
            'display:flex;align-items:center;justify-content:center;overflow:hidden;' +
            'background:linear-gradient(90deg,#011a0e 0%,#032d18 15%,#054a28 35%,#065f35 50%,#054a28 65%,#032d18 85%,#011a0e 100%);' +
            'border-bottom:1px solid rgba(52,211,153,0.18);' +
            'transform:translateY(-100%);animation:rmSlideIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;';

        banner.innerHTML =
            // Arkaplan orb
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:120px;background:radial-gradient(ellipse,rgba(52,211,153,0.09),transparent 70%);pointer-events:none;animation:rmOrb 5s ease-in-out infinite"></div>' +
            // Kenar çizgileri
            '<div style="position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(52,211,153,0.6),transparent);animation:rmLineGlow 3s ease-in-out infinite"></div>' +
            '<div style="position:absolute;right:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(52,211,153,0.6),transparent);animation:rmLineGlow 3s ease-in-out 1.5s infinite"></div>' +
            // Sol yıldızlar
            '<div style="position:absolute;left:5%;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px">' +
                '<svg width="10" height="10" viewBox="0 0 10 10" style="animation:rmStarPulse 2.8s ease-in-out infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.5"/></svg>' +
                '<svg width="6" height="6" viewBox="0 0 10 10" style="animation:rmStarPulse 2.1s ease-in-out .5s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.3"/></svg>' +
                '<svg width="8" height="8" viewBox="0 0 10 10" style="animation:rmStarPulse 3.3s ease-in-out 1s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.4"/></svg>' +
            '</div>' +
            // Sağ yıldızlar
            '<div style="position:absolute;right:5%;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px">' +
                '<svg width="8" height="8" viewBox="0 0 10 10" style="animation:rmStarPulse 3.1s ease-in-out .8s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.4"/></svg>' +
                '<svg width="6" height="6" viewBox="0 0 10 10" style="animation:rmStarPulse 2.4s ease-in-out .3s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.3"/></svg>' +
                '<svg width="10" height="10" viewBox="0 0 10 10" style="animation:rmStarPulse 2.7s ease-in-out 1.2s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.5"/></svg>' +
            '</div>' +
            // Ana içerik
            '<div style="display:flex;align-items:center;gap:16px;position:relative;z-index:2">' +
                // Hilal
                '<div style="animation:rmMoonGlow 3s ease-in-out infinite;flex-shrink:0">' +
                    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#34d399" stroke="#6ee7b7" stroke-width="0.5"/></svg>' +
                '</div>' +
                // Ayraç
                '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,rgba(52,211,153,0.4),transparent)"></div>' +
                // Yazılar
                '<div style="text-align:center">' +
                    '<p style="margin:0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:13.5px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;background:linear-gradient(90deg,#6ee7b7 0%,#d1fae5 30%,#ffffff 50%,#d1fae5 70%,#6ee7b7 100%);background-size:250% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:rmShimmer 5s linear infinite;line-height:1.15">Hoş Geldin Ey 11 Ayın Sultanı</p>' +
                    '<p style="margin:3px 0 0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:rgba(110,231,183,0.5);line-height:1">— Mübarek Ramazan Ayınız Kutlu Olsun —</p>' +
                '</div>' +
                // Ayraç
                '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,rgba(52,211,153,0.4),transparent)"></div>' +
                // İkon grubu
                '<div style="display:flex;align-items:center;gap:6px;animation:rmMoonGlow 3s ease-in-out 1s infinite;flex-shrink:0">' +
                    '<svg width="9" height="9" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399"/></svg>' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#34d399" opacity="0.7"/></svg>' +
                '</div>' +
            '</div>';

        document.body.insertBefore(banner, document.body.firstChild);
        var nav = document.querySelector('nav');
        if (nav) nav.style.top = BANNER_H + 'px';
    }

    /* ================================================
       YIL BAŞI BANNER — Premium
    ================================================ */
    function applyNewyear() {
        document.body.classList.add('season-active', 'theme-newyear');

        var style = document.createElement('style');
        style.id = 'season-styles';
        style.textContent =
            '@keyframes nyShimmer{0%{background-position:200% center}100%{background-position:-200% center}}' +
            '@keyframes nyStarSpin{0%,100%{opacity:.2;transform:scale(1) rotate(0deg)}50%{opacity:.9;transform:scale(1.4) rotate(30deg)}}' +
            '@keyframes nyGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(252,165,165,0.4)) drop-shadow(0 0 16px rgba(252,165,165,0.15))}50%{filter:drop-shadow(0 0 12px rgba(252,165,165,0.8)) drop-shadow(0 0 30px rgba(252,165,165,0.35))}}' +
            '@keyframes nyLineGlow{0%,100%{opacity:.25}50%{opacity:.7}}' +
            '@keyframes nyOrb{0%,100%{opacity:.07}50%{opacity:.13}}' +
            '@keyframes nySlideIn{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
        document.head.appendChild(style);

        var banner = document.createElement('div');
        banner.id = 'season-banner';
        banner.style.cssText =
            'position:fixed;top:0;left:0;right:0;z-index:9998;height:' + BANNER_H + 'px;' +
            'display:flex;align-items:center;justify-content:center;overflow:hidden;' +
            'background:linear-gradient(90deg,#140000 0%,#2a0000 15%,#480000 35%,#5c0000 50%,#480000 65%,#2a0000 85%,#140000 100%);' +
            'border-bottom:1px solid rgba(252,165,165,0.15);' +
            'transform:translateY(-100%);animation:nySlideIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;';

        banner.innerHTML =
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:120px;background:radial-gradient(ellipse,rgba(252,165,165,0.09),transparent 70%);pointer-events:none;animation:nyOrb 5s ease-in-out infinite"></div>' +
            '<div style="position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(252,165,165,0.6),transparent);animation:nyLineGlow 3s ease-in-out infinite"></div>' +
            '<div style="position:absolute;right:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(252,165,165,0.6),transparent);animation:nyLineGlow 3s ease-in-out 1.5s infinite"></div>' +
            '<div style="position:absolute;left:5%;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px">' +
                '<svg width="10" height="10" viewBox="0 0 10 10" style="animation:nyStarSpin 2.6s ease-in-out infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.5"/></svg>' +
                '<svg width="6" height="6" viewBox="0 0 10 10" style="animation:nyStarSpin 2s ease-in-out .4s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.3"/></svg>' +
                '<svg width="8" height="8" viewBox="0 0 10 10" style="animation:nyStarSpin 3.1s ease-in-out .9s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.4"/></svg>' +
            '</div>' +
            '<div style="position:absolute;right:5%;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px">' +
                '<svg width="8" height="8" viewBox="0 0 10 10" style="animation:nyStarSpin 2.9s ease-in-out .7s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.4"/></svg>' +
                '<svg width="6" height="6" viewBox="0 0 10 10" style="animation:nyStarSpin 2.2s ease-in-out .2s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.3"/></svg>' +
                '<svg width="10" height="10" viewBox="0 0 10 10" style="animation:nyStarPulse 2.5s ease-in-out 1.1s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.5"/></svg>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;position:relative;z-index:2">' +
                '<div style="animation:nyGlow 3s ease-in-out infinite;flex-shrink:0;font-size:20px;line-height:1">🎄</div>' +
                '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,rgba(252,165,165,0.4),transparent)"></div>' +
                '<div style="text-align:center">' +
                    '<p style="margin:0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:13.5px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;background:linear-gradient(90deg,#fca5a5 0%,#fed7aa 25%,#ffffff 50%,#fed7aa 75%,#fca5a5 100%);background-size:250% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:nyShimmer 5s linear infinite;line-height:1.15">Mutlu Yıllar, Yeni Bir Başlangıç</p>' +
                    '<p style="margin:3px 0 0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:rgba(252,165,165,0.5);line-height:1">— Yeni Yılınız Sağlık ve Başarı Getirsin —</p>' +
                '</div>' +
                '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,rgba(252,165,165,0.4),transparent)"></div>' +
                '<div style="display:flex;align-items:center;gap:6px;animation:nyGlow 3s ease-in-out 1s infinite;flex-shrink:0">' +
                    '<svg width="9" height="9" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5"/></svg>' +
                    '<span style="font-size:18px;line-height:1">🎆</span>' +
                '</div>' +
            '</div>';

        document.body.insertBefore(banner, document.body.firstChild);
        var nav = document.querySelector('nav');
        if (nav) nav.style.top = BANNER_H + 'px';
        startSnow();
    }

    /* ================================================
       KAR EFEKTİ
    ================================================ */
    function startSnow() {
        var canvas = document.createElement('canvas');
        canvas.id = 'snow-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.5';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        var W, H, flakes = [];
        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);
        for (var i = 0; i < 120; i++) {
            flakes.push({ x: Math.random()*1400, y: Math.random()*900, r: Math.random()*3+1, d: Math.random()*1.5+0.5, drift: Math.random()*0.8-0.4, opacity: Math.random()*0.6+0.3 });
        }
        var angle = 0;
        function draw() {
            ctx.clearRect(0, 0, W, H); angle += 0.005;
            flakes.forEach(function(f, i) {
                ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(255,255,255,' + f.opacity + ')'; ctx.fill();
                f.y += f.d; f.x += f.drift + Math.sin(angle + i) * 0.3;
                if (f.y > H) { f.y = -5; f.x = Math.random()*W; }
                if (f.x > W+5) f.x = -5;
                if (f.x < -5) f.x = W+5;
            });
            snowAnimFrame = requestAnimationFrame(draw);
        }
        draw();
    }

    return { init: init, apply: applyTheme };
})();
