/* ============================================
   ARCANTH PROJECT — themes.js
   Sezon Tema Sistemi: Normal / Ramazan / Yılbaşı
   Firebase'den active_theme okur, DOM'a uygular
   ============================================ */

var ThemeSystem = (function () {
    'use strict';

    var currentTheme = 'normal';
    var snowAnimFrame = null;

    /* ---------- PUBLIC INIT ---------- */
    function init() {
        // Firebase hazır olunca çalışır (core.js'den db global olarak gelir)
        db.ref('site_data/settings/active_theme').on('value', function (snap) {
            var theme = snap.val() || 'normal';
            if (theme !== currentTheme) {
                applyTheme(theme);
            }
        });
    }

    /* ---------- APPLY THEME ---------- */
    function applyTheme(theme) {
        currentTheme = theme;

        // Önceki temayı temizle
        removePreviousTheme();

        switch (theme) {
            case 'ramadan': applyRamadan(); break;
            case 'newyear': applyNewyear(); break;
            default: applyNormal(); break;
        }
    }

    /* ---------- REMOVE PREVIOUS ---------- */
    function removePreviousTheme() {
        // Banner kaldır
        var banner = document.getElementById('season-banner');
        if (banner) banner.remove();

        // Kar canvas kaldır
        var snow = document.getElementById('snow-canvas');
        if (snow) snow.remove();
        if (snowAnimFrame) { cancelAnimationFrame(snowAnimFrame); snowAnimFrame = null; }

        // Body class temizle
        document.body.classList.remove('season-active', 'theme-ramadan', 'theme-newyear');
    }

    /* ---------- NORMAL ---------- */
    function applyNormal() {
        // Hiçbir şey yok, standart site
    }

    /* ---------- RAMAZAN ---------- */
    function applyRamadan() {
        document.body.classList.add('season-active', 'theme-ramadan');
        createBanner('ramadan',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.9"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>',
            '🌙 Ramazan Ayı Mübarek Olsun! Hayırlı iftar ve sahurlar dileriz. 🕌'
        );
    }

    /* ---------- YIL BAŞI ---------- */
    function applyNewyear() {
        document.body.classList.add('season-active', 'theme-newyear');
        createBanner('newyear',
            '🎄',
            '🎉 Yeni Yılınız Kutlu Olsun! Mutlu ve sağlıklı bir yıl diliyoruz. 🎆'
        );
        startSnow();
    }

    /* ---------- BANNER OLUŞTUR ---------- */
    function createBanner(type, iconHTML, text) {
        var banner = document.createElement('div');
        banner.id = 'season-banner';
        banner.className = 'season-banner ' + type;
        banner.style.cssText = [
            'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9998',
            'text-align:center', 'font-weight:800', 'font-size:0.875rem',
            'padding:10px 20px', 'letter-spacing:0.05em',
            'display:flex', 'align-items:center', 'justify-content:center', 'gap:10px',
            'color:white', 'backdrop-filter:blur(10px)',
            'border-bottom:1px solid rgba(255,255,255,0.15)',
            type === 'ramadan'
                ? 'background:linear-gradient(135deg,rgba(16,185,129,0.97),rgba(5,150,105,0.97))'
                : 'background:linear-gradient(135deg,rgba(220,38,38,0.97),rgba(159,18,57,0.97))',
            'transform:translateY(-100%)',
            'transition:transform 0.6s cubic-bezier(0.16,1,0.3,1)'
        ].join(';');

        banner.innerHTML = '<span>' + iconHTML + '</span><span>' + text + '</span>';

        document.body.insertBefore(banner, document.body.firstChild);

        // Nav'ı aşağı it
        var nav = document.querySelector('nav');
        if (nav) nav.style.top = '44px';

        // Animasyon için tiny delay
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.style.transform = 'translateY(0)';
            });
        });
    }

    /* ---------- KAR EFEKTİ ---------- */
    function startSnow() {
        var canvas = document.createElement('canvas');
        canvas.id = 'snow-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.55';
        document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var W, H, flakes = [];

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Kar tanecikleri oluştur
        for (var i = 0; i < 120; i++) {
            flakes.push({
                x: Math.random() * 1400,
                y: Math.random() * 900,
                r: Math.random() * 3 + 1,
                d: Math.random() * 1.5 + 0.5,
                drift: Math.random() * 0.8 - 0.4,
                opacity: Math.random() * 0.6 + 0.3
            });
        }

        var angle = 0;

        function draw() {
            ctx.clearRect(0, 0, W, H);
            angle += 0.005;

            flakes.forEach(function (f, i) {
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + f.opacity + ')';
                ctx.fill();

                f.y += f.d;
                f.x += f.drift + Math.sin(angle + i) * 0.3;

                if (f.y > H) {
                    f.y = -5;
                    f.x = Math.random() * W;
                }
                if (f.x > W + 5) f.x = -5;
                if (f.x < -5) f.x = W + 5;
            });

            snowAnimFrame = requestAnimationFrame(draw);
        }
        draw();
    }

    /* ---------- PUBLIC API ---------- */
    return { init: init, apply: applyTheme };
})();
