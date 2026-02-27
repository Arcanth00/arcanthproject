/* ============================================
   ARCANTH PROJECT — themes.js
   Sezon Tema Sistemi: Normal / Ramazan / Yılbaşı
   ============================================ */

var ThemeSystem = (function () {
    'use strict';

    var currentTheme  = 'normal';
    var snowAnimFrame = null;
    var bgAnimFrame   = null;
    var BANNER_H      = 56;

    function init() {
        db.ref('site_data/settings/active_theme').on('value', function (snap) {
            applyTheme(snap.val() || 'normal');
        });
    }

    function applyTheme(theme) {
        currentTheme = theme;
        removePreviousTheme();
        var t = theme;
        if      (t==='ramadan')   applyRamadan();
        else if (t==='eid')       applyFestival({emoji:'🌟',emoji2:'🌙',animPfx:'eid',
            bg:'#0a1a18',accent:'#6ee7b7',
            title:'Ramazan Bayramınız Mübarek Olsun',sub:'— Şeker Bayramı — Sağlık ve Huzur —',bodyClass:'theme-eid'});
        else if (t==='kurban')    applyFestival({emoji:'🐑',emoji2:'🌿',animPfx:'kurban',
            bg:'#071a0a',accent:'#34d399',
            title:'Kurban Bayramınız Mübarek Olsun',sub:'— Hayırlı Kurbanlar, Bereketli Günler —',bodyClass:'theme-kurban'});
        else if (t==='april23')   applyFestival({emoji:'🎈',emoji2:'🇹🇷',animPfx:'apr23',
            bg:'#1a0505',accent:'#f87171',
            title:'23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',sub:'— Geleceğimizin Güvencesi Çocuklarımıza —',bodyClass:'theme-april23',
            particles:['#ef4444','#f87171','#3b82f6','#ffffff','#fbbf24'],shapes:['circle','rect','heart']});
        else if (t==='may19')     applyFestival({emoji:'⭐',emoji2:'🏃',animPfx:'may19',
            bg:'#1a0505',accent:'#dc2626',
            title:'19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı',sub:'— Ne Mutlu Türküm Diyene —',bodyClass:'theme-may19',
            particles:['#ef4444','#dc2626','#fca5a5','#ffffff']});
        else if (t==='oct29')     applyFestival({emoji:'🎆',emoji2:'🇹🇷',animPfx:'oct29',
            bg:'#1a0500',accent:'#fb923c',
            shimmer:'#ef4444 0%,#fb923c 30%,#fde68a 50%,#fb923c 70%,#ef4444 100%',
            title:'Cumhuriyet Bayramımız Kutlu Olsun',sub:'— 29 Ekim 1923 — Türkiye Cumhuriyeti —',bodyClass:'theme-oct29',
            particles:['#ef4444','#fb923c','#fde68a','#ffffff']});
        else if (t==='hidrellez') applyFestival({emoji:'🌿',emoji2:'🌸',animPfx:'hidr',
            bg:'#061206',accent:'#86efac',
            title:'Hıdrellez Kutlu Olsun',sub:'— Bereket, Sağlık ve Yeni Başlangıçlar —',bodyClass:'theme-hidrellez',
            particles:['#86efac','#4ade80','#fbbf24','#fb7185'],shapes:['circle','heart']});
        else if (t==='anneler')   applyFestival({emoji:'💐',emoji2:'❤️',animPfx:'anne',
            bg:'#1a0510',accent:'#f472b6',
            title:'Anneler Günün Kutlu Olsun',sub:'— Dünyanın En Güzel Varlıklarına —',bodyClass:'theme-anneler',
            particles:['#f472b6','#fb7185','#fda4af','#ffffff'],shapes:['circle','heart','rect']});
        else if (t==='halloween') applyFestival({emoji:'🎃',emoji2:'🦇',animPfx:'hall',
            bg:'#0a0500',accent:'#f97316',
            title:'Happy Halloween',sub:'— Trick or Treat? —',bodyClass:'theme-halloween',
            particles:['#f97316','#fb923c','#7c3aed','#fde68a']});
        else if (t==='newyear')   applyNewyear();
    }

    function removePreviousTheme() {
        ['season-banner','snow-canvas','ramadan-bg','season-styles','season-particles'].forEach(function(id) {
            var el = document.getElementById(id); if (el) el.remove();
        });
        if (snowAnimFrame) { cancelAnimationFrame(snowAnimFrame); snowAnimFrame = null; }
        if (bgAnimFrame)   { cancelAnimationFrame(bgAnimFrame);   bgAnimFrame   = null; }
        /* Tüm tema class'larını temizle */
        document.body.className = document.body.className
            .replace(/\bseason-active\b|\btheme-\S+/g,'').trim();
        var nav = document.querySelector('nav'); if (nav) nav.style.top = '';
    }

    /* ================================================
       RAMAZAN — Tam atmosfer
    ================================================ */
    function applyRamadan() {
        document.body.classList.add('season-active', 'theme-ramadan');
        injectRamadanStyles();
        buildRamadanBanner();
        buildRamadanCanvas();
    }

    function injectRamadanStyles() {
        var s = document.createElement('style');
        s.id  = 'season-styles';
        s.textContent =
            '@keyframes rmShimmer{0%{background-position:250% center}100%{background-position:-250% center}}' +
            '@keyframes rmMoonGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(52,211,153,.55)) drop-shadow(0 0 22px rgba(52,211,153,.2))}50%{filter:drop-shadow(0 0 16px rgba(52,211,153,1)) drop-shadow(0 0 40px rgba(52,211,153,.45))}}' +
            '@keyframes rmStarPulse{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.85;transform:scale(1.4)}}' +
            '@keyframes rmLineGlow{0%,100%{opacity:.25}50%{opacity:.75}}' +
            '@keyframes rmOrb{0%,100%{opacity:.07;transform:scale(1)}50%{opacity:.14;transform:scale(1.12)}}' +
            '@keyframes rmSlideIn{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
        document.head.appendChild(s);
    }

    function buildRamadanBanner() {
        var b = document.createElement('div');
        b.id  = 'season-banner';
        b.style.cssText =
            'position:fixed;top:0;left:0;right:0;z-index:9998;height:' + BANNER_H + 'px;' +
            'display:flex;align-items:center;justify-content:center;overflow:hidden;' +
            'background:linear-gradient(90deg,rgba(1,26,14,.97) 0%,rgba(3,45,24,.97) 15%,rgba(5,74,40,.97) 35%,rgba(6,95,53,.97) 50%,rgba(5,74,40,.97) 65%,rgba(3,45,24,.97) 85%,rgba(1,26,14,.97) 100%);' +
            'border-bottom:1px solid rgba(52,211,153,.2);' +
            'transform:translateY(-100%);animation:rmSlideIn .8s cubic-bezier(.16,1,.3,1) .1s forwards;';

        b.innerHTML =
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:130px;background:radial-gradient(ellipse,rgba(52,211,153,.1),transparent 70%);pointer-events:none;animation:rmOrb 5s ease-in-out infinite"></div>' +
            '<div style="position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(52,211,153,.7),transparent);animation:rmLineGlow 3s ease-in-out infinite"></div>' +
            '<div style="position:absolute;right:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(52,211,153,.7),transparent);animation:rmLineGlow 3s ease-in-out 1.5s infinite"></div>' +
            starGroup('left:5%') + starGroup('right:5%') +
            '<div style="display:flex;align-items:center;gap:18px;position:relative;z-index:2">' +
                '<div style="animation:rmMoonGlow 3s ease-in-out infinite;flex-shrink:0">' + moonSVG(26) + '</div>' +
                divider() +
                '<div style="text-align:center">' +
                    '<p style="margin:0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:14px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;background:linear-gradient(90deg,#6ee7b7 0%,#d1fae5 28%,#fff 50%,#d1fae5 72%,#6ee7b7 100%);background-size:250% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:rmShimmer 5s linear infinite;line-height:1.15">Hoş Geldin Ya Şehri Ramazan</p>' +
                    '<p style="margin:3px 0 0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(110,231,183,.5);line-height:1">— Mübarek Ramazan Ayınız Kutlu Olsun —</p>' +
                '</div>' +
                divider() +
                '<div style="display:flex;align-items:center;gap:7px;animation:rmMoonGlow 3s ease-in-out 1s infinite;flex-shrink:0">' +
                    starSVG(9) + moonSVG(20) +
                '</div>' +
            '</div>';

        document.body.insertBefore(b, document.body.firstChild);
        var nav = document.querySelector('nav'); if (nav) nav.style.top = BANNER_H + 'px';
    }

    /* ================================================
       RAMAZAN ARKA PLAN CANVAS
       Tüm iç fonksiyonlar T değişkenini closure üzerinden görür
    ================================================ */
    function buildRamadanCanvas() {
        var canvas = document.createElement('canvas');
        canvas.id  = 'ramadan-bg';
        canvas.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'pointer-events:none;z-index:0;opacity:0;transition:opacity 1.5s ease;will-change:opacity;';
        document.body.insertBefore(canvas, document.body.firstChild);

        var ctx = canvas.getContext('2d');
        var W, H;

        /* T: saniye bazlı zaman — tüm iç fonksiyonlar buraya erişir */
        var T         = 0;
        var lastStamp = null;

        /* ---- Yıldızlar ---- */
        var stars = [];
        function buildStars() {
            stars = [];
            for (var i = 0; i < 180; i++) {
                stars.push({
                    x:     Math.random() * W,
                    y:     Math.random() * H * 0.72,
                    r:     Math.random() * 1.4 + 0.3,
                    base:  Math.random() * 0.6 + 0.2,
                    speed: Math.random() * 0.9 + 0.3,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        /* ---- Kandiller: gerçek sarkaç fiziği, deltaTime ile FPS bağımsız ---- */
        var lanternCount = 6;
        var lanterns = [];
        function buildLanterns() {
            lanterns = [];
            for (var i = 0; i < lanternCount; i++) {
                lanterns.push({
                    t:         i / (lanternCount - 1),
                    angle:     (Math.random() - 0.5) * 0.18,   /* başlangıç açısı */
                    velocity:  0,
                    gravity:   1.6 + Math.random() * 0.6,      /* rad/s² — her kandil farklı */
                    damping:   0.993,
                    glowPhase: Math.random() * Math.PI * 2
                });
            }
        }

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            buildStars();
            buildLanterns();
        }
        resize();
        window.addEventListener('resize', resize);

        /* ---- Cami silüeti ---- */
        function drawMosque() {
            var cx    = W / 2;
            var sc    = Math.min(W, H * 1.3) / 900;
            var floor = H;
            ctx.save();
            ctx.fillStyle = 'rgba(0,10,5,0.93)';

            /* Ana kubbe */
            var dR = 130 * sc;
            var dY = floor - 310 * sc;
            ctx.beginPath();
            ctx.arc(cx, dY, dR, Math.PI, 0, false);
            ctx.lineTo(cx + dR, floor); ctx.lineTo(cx - dR, floor);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx - 12*sc, dY - dR + 10*sc);
            ctx.quadraticCurveTo(cx, dY - dR - 28*sc, cx + 12*sc, dY - dR + 10*sc);
            ctx.fill();
            ctx.beginPath(); ctx.arc(cx, dY - dR - 30*sc, 4*sc, 0, Math.PI*2); ctx.fill();

            /* Yan küçük kubbeler */
            drawSmallDome(cx - 80*sc, floor, 55*sc, 80*sc);
            drawSmallDome(cx + 80*sc, floor, 55*sc, 80*sc);

            /* Minareler */
            drawMinaret(cx - 180*sc, floor, 28*sc, 260*sc);
            drawMinaret(cx + 180*sc, floor, 28*sc, 260*sc);

            /* Gövde */
            ctx.fillRect(cx - dR, floor - 160*sc, dR*2, 160*sc);

            /* Kapı */
            ctx.fillStyle = 'rgba(0,25,12,.97)';
            var dw = 28*sc, dh = 55*sc;
            ctx.beginPath();
            ctx.rect(cx - dw/2, floor - dh, dw, dh*0.6);
            ctx.arc(cx, floor - dh + dh*0.4, dw/2, Math.PI, 0, false);
            ctx.fill();

            ctx.restore();
        }

        function drawMinaret(x, floor, w, h) {
            ctx.beginPath(); ctx.rect(x - w/2, floor - h, w, h); ctx.fill();
            ctx.beginPath(); ctx.rect(x - w*0.85, floor - h*0.72 - 6, w*1.7, 10); ctx.fill();
            ctx.beginPath();
            ctx.arc(x, floor - h - 18, w*0.55, Math.PI, 0, false);
            ctx.lineTo(x + w*0.55, floor - h); ctx.lineTo(x - w*0.55, floor - h);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 5, floor - h - 18 - w*0.55 + 8);
            ctx.lineTo(x, floor - h - 18 - w*0.55 - 22);
            ctx.lineTo(x + 5, floor - h - 18 - w*0.55 + 8);
            ctx.fill();
            ctx.beginPath(); ctx.arc(x, floor - h - 18 - w*0.55 - 24, 3, 0, Math.PI*2); ctx.fill();
        }

        function drawSmallDome(x, floor, r, bodyH) {
            ctx.beginPath();
            ctx.arc(x, floor - bodyH, r, Math.PI, 0, false);
            ctx.lineTo(x + r, floor); ctx.lineTo(x - r, floor);
            ctx.closePath(); ctx.fill();
        }

        /* ---- İp ve kandiller — T closure değişkenini kullanır ---- */
        function drawRope(dt) {
            var sc      = Math.min(W, H * 1.3) / 900;
            var cx      = W / 2;
            var mL      = cx - 180*sc;
            var mR      = cx + 180*sc;
            var attachY = BANNER_H + 22;
            var ropeMidY= attachY + 90*sc;

            /* İp */
            ctx.save();
            ctx.strokeStyle = 'rgba(52,211,153,0.18)';
            ctx.lineWidth   = 1.2;
            ctx.beginPath();
            ctx.moveTo(mL, attachY);
            ctx.quadraticCurveTo(cx, ropeMidY, mR, attachY);
            ctx.stroke();
            ctx.restore();

            /* Kandiller */
            lanterns.forEach(function(l) {
                /* Sarkaç fiziği: deltaTime ile FPS bağımsız */
                l.velocity += -l.gravity * Math.sin(l.angle) * dt;
                l.velocity *= l.damping;
                l.angle    += l.velocity * dt;

                /* Bezier konum */
                var bt = l.t;
                var bx = (1-bt)*(1-bt)*mL + 2*(1-bt)*bt*cx + bt*bt*mR;
                var by = (1-bt)*(1-bt)*attachY + 2*(1-bt)*bt*ropeMidY + bt*bt*attachY;

                /* Sarkaç ofseti */
                var lx = bx + Math.sin(l.angle) * 28;
                var ly = by + 28;

                /* Glow */
                var ga = 0.25 + Math.sin(T * 1.8 + l.glowPhase) * 0.15;
                var grd = ctx.createRadialGradient(lx, ly, 0, lx, ly, 30);
                grd.addColorStop(0,   'rgba(255,210,100,' + (ga+0.35) + ')');
                grd.addColorStop(0.3, 'rgba(255,160,40,'  + ga + ')');
                grd.addColorStop(1,   'rgba(255,100,0,0)');
                ctx.save(); ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(lx, ly, 30, 0, Math.PI*2); ctx.fill(); ctx.restore();

                /* İp-kandil bağlantı çizgisi */
                ctx.save();
                ctx.strokeStyle = 'rgba(52,211,153,0.15)'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(lx, ly - 8); ctx.stroke();
                ctx.restore();

                /* Gövde */
                ctx.save(); ctx.translate(lx, ly);
                /* Üst kap */
                ctx.fillStyle = 'rgba(180,130,20,0.9)';
                ctx.beginPath(); ctx.moveTo(-5,-8); ctx.lineTo(5,-8); ctx.lineTo(3,0); ctx.lineTo(-3,0); ctx.closePath(); ctx.fill();
                /* Gövde */
                ctx.fillStyle = 'rgba(210,160,30,0.85)';
                ctx.beginPath(); ctx.moveTo(-4,0); ctx.lineTo(4,0); ctx.lineTo(5,5); ctx.lineTo(3,12); ctx.lineTo(-3,12); ctx.lineTo(-5,5); ctx.closePath(); ctx.fill();
                /* İç ışık */
                var ig = ctx.createRadialGradient(0,6,0,0,6,7);
                ig.addColorStop(0,'rgba(255,230,100,0.9)'); ig.addColorStop(1,'rgba(255,150,0,0)');
                ctx.fillStyle = ig; ctx.beginPath(); ctx.ellipse(0,6,4,6,0,0,Math.PI*2); ctx.fill();
                /* Püskül */
                ctx.strokeStyle = 'rgba(200,150,20,0.7)'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(-2,12); ctx.lineTo(-2,17); ctx.moveTo(0,12); ctx.lineTo(0,18); ctx.moveTo(2,12); ctx.lineTo(2,17); ctx.stroke();
                ctx.restore();
            });
        }

        /* ---- Ana döngü ---- */
        function draw(timestamp) {
            /* deltaTime hesapla, max 50ms ile sınırla (sekme arka plana giderse patlamasın) */
            var dt = lastStamp ? Math.min((timestamp - lastStamp) / 1000, 0.05) : 0.016;
            lastStamp = timestamp;
            T += dt;

            ctx.clearRect(0, 0, W, H);

            /* Gece gökyüzü */
            var sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
            sky.addColorStop(0,    '#000d06');
            sky.addColorStop(0.4,  '#001a0d');
            sky.addColorStop(0.75, '#002914');
            sky.addColorStop(1,    'rgba(0,20,10,0)');
            ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

            /* Yıldızlar */
            stars.forEach(function(s) {
                var alpha = s.base + Math.sin(T * s.speed + s.phase) * 0.3;
                var grd   = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
                grd.addColorStop(0, 'rgba(200,255,220,' + alpha + ')');
                grd.addColorStop(1, 'rgba(200,255,220,0)');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI*2); ctx.fill();
            });

            /* Cami */
            drawMosque();

            /* Kandil ipi + kandiller — dt geçiyoruz */
            drawRope(dt);

            bgAnimFrame = requestAnimationFrame(draw);
        }

        /* İlk frame: requestAnimationFrame ile başlat — draw() DEĞİL */
        requestAnimationFrame(draw);

        /* Fade in — setTimeout Chromium'da daha güvenilir */
        setTimeout(function() { canvas.style.opacity = '1'; }, 150);
    }

    /* ================================================
       YIL BAŞI BANNER + KAR
    ================================================ */
    function applyNewyear() {
        document.body.classList.add('season-active', 'theme-newyear');

        var style = document.createElement('style');
        style.id  = 'season-styles';
        style.textContent =
            '@keyframes nyShimmer{0%{background-position:200% center}100%{background-position:-200% center}}' +
            '@keyframes nyStarSpin{0%,100%{opacity:.2;transform:scale(1) rotate(0deg)}50%{opacity:.9;transform:scale(1.4) rotate(30deg)}}' +
            '@keyframes nyGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(252,165,165,.4)) drop-shadow(0 0 16px rgba(252,165,165,.15))}50%{filter:drop-shadow(0 0 12px rgba(252,165,165,.8)) drop-shadow(0 0 30px rgba(252,165,165,.35))}}' +
            '@keyframes nyLineGlow{0%,100%{opacity:.25}50%{opacity:.7}}' +
            '@keyframes nyOrb{0%,100%{opacity:.07}50%{opacity:.13}}' +
            '@keyframes nySlideIn{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
        document.head.appendChild(style);

        var b = document.createElement('div');
        b.id  = 'season-banner';
        b.style.cssText =
            'position:fixed;top:0;left:0;right:0;z-index:9998;height:' + BANNER_H + 'px;' +
            'display:flex;align-items:center;justify-content:center;overflow:hidden;' +
            'background:linear-gradient(90deg,#140000 0%,#2a0000 15%,#480000 35%,#5c0000 50%,#480000 65%,#2a0000 85%,#140000 100%);' +
            'border-bottom:1px solid rgba(252,165,165,.15);' +
            'transform:translateY(-100%);animation:nySlideIn .8s cubic-bezier(.16,1,.3,1) .1s forwards;';

        b.innerHTML =
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:130px;background:radial-gradient(ellipse,rgba(252,165,165,.09),transparent 70%);pointer-events:none;animation:nyOrb 5s ease-in-out infinite"></div>' +
            '<div style="position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(252,165,165,.6),transparent);animation:nyLineGlow 3s ease-in-out infinite"></div>' +
            '<div style="position:absolute;right:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(252,165,165,.6),transparent);animation:nyLineGlow 3s ease-in-out 1.5s infinite"></div>' +
            nyStarGroup('left:5%') + nyStarGroup('right:5%') +
            '<div style="display:flex;align-items:center;gap:16px;position:relative;z-index:2">' +
                '<div style="animation:nyGlow 3s ease-in-out infinite;flex-shrink:0;font-size:20px;line-height:1">🎄</div>' +
                divider('rgba(252,165,165,.4)') +
                '<div style="text-align:center">' +
                    '<p style="margin:0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:14px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;background:linear-gradient(90deg,#fca5a5 0%,#fed7aa 25%,#fff 50%,#fed7aa 75%,#fca5a5 100%);background-size:250% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:nyShimmer 5s linear infinite;line-height:1.15">Mutlu Yıllar, Yeni Bir Başlangıç</p>' +
                    '<p style="margin:3px 0 0;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(252,165,165,.5);line-height:1">— Yeni Yılınız Sağlık ve Başarı Getirsin —</p>' +
                '</div>' +
                divider('rgba(252,165,165,.4)') +
                '<div style="display:flex;align-items:center;gap:6px;animation:nyGlow 3s ease-in-out 1s infinite;flex-shrink:0">' +
                    '<svg width="9" height="9" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5"/></svg>' +
                    '<span style="font-size:18px;line-height:1">🎆</span>' +
                '</div>' +
            '</div>';

        document.body.insertBefore(b, document.body.firstChild);
        var nav = document.querySelector('nav'); if (nav) nav.style.top = BANNER_H + 'px';
        startSnow();
    }

    /* ================================================
       KAR EFEKTİ
    ================================================ */
    function startSnow() {
        var canvas = document.createElement('canvas');
        canvas.id  = 'snow-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.5';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d'), W, H, flakes = [];
        var lastSnow = null;
        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize);
        for (var i = 0; i < 120; i++) {
            flakes.push({ x: Math.random()*1400, y: Math.random()*900, r: Math.random()*3+1, vy: Math.random()*60+30, drift: Math.random()*30-15, opacity: Math.random()*.6+.3, phase: Math.random()*Math.PI*2 });
        }
        function draw(ts) {
            var dt = lastSnow ? Math.min((ts - lastSnow)/1000, 0.05) : 0.016;
            lastSnow = ts;
            ctx.clearRect(0,0,W,H);
            flakes.forEach(function(f,i) {
                f.y += f.vy * dt;
                f.x += (f.drift + Math.sin(ts/800 + f.phase) * 15) * dt;
                if (f.y > H) { f.y = -5; f.x = Math.random()*W; }
                if (f.x > W+5) f.x = -5; if (f.x < -5) f.x = W+5;
                ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(255,255,255,' + f.opacity + ')'; ctx.fill();
            });
            snowAnimFrame = requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

    /* ================================================
       YARDIMCI FONKSİYONLAR
    ================================================ */
    function moonSVG(size) {
        return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#34d399" stroke="#6ee7b7" stroke-width="0.4"/></svg>';
    }
    function starSVG(size) {
        return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399"/></svg>';
    }
    function divider(color) {
        return '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,'+(color||'rgba(52,211,153,.4)')+',transparent)"></div>';
    }
    function starGroup(pos) {
        return '<div style="position:absolute;'+pos+';top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:9px">' +
            '<svg width="10" height="10" viewBox="0 0 10 10" style="animation:rmStarPulse 2.8s ease-in-out infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.5"/></svg>' +
            '<svg width="6" height="6" viewBox="0 0 10 10" style="animation:rmStarPulse 2.1s ease-in-out .5s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.3"/></svg>' +
            '<svg width="8" height="8" viewBox="0 0 10 10" style="animation:rmStarPulse 3.2s ease-in-out 1s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#34d399" opacity="0.4"/></svg>' +
        '</div>';
    }
    function nyStarGroup(pos) {
        return '<div style="position:absolute;'+pos+';top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:9px">' +
            '<svg width="10" height="10" viewBox="0 0 10 10" style="animation:nyStarSpin 2.6s ease-in-out infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.5"/></svg>' +
            '<svg width="6" height="6" viewBox="0 0 10 10" style="animation:nyStarSpin 2s ease-in-out .4s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.3"/></svg>' +
            '<svg width="8" height="8" viewBox="0 0 10 10" style="animation:nyStarSpin 3s ease-in-out .9s infinite"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fca5a5" opacity="0.4"/></svg>' +
        '</div>';
    }


    /* ════════════════════════════════════════════════════
       GENEL FESTIVAL BANNER (tüm yeni temalar için)
    ════════════════════════════════════════════════════ */
    function applyFestival(opts) {
        var pfx = opts.animPfx || 'gn';
        var acc = opts.accent || '#60a5fa';
        var shimmerColors = opts.shimmer || (acc+' 0%,#fff 50%,'+acc+' 100%');
        /* Styles */
        var s = document.createElement('style');
        s.id = 'season-styles';
        s.textContent =
            '@keyframes '+pfx+'Sh{0%{background-position:250% center}100%{background-position:-250% center}}'+
            '@keyframes '+pfx+'Gl{0%,100%{filter:drop-shadow(0 0 6px '+acc+'55)}50%{filter:drop-shadow(0 0 14px '+acc+')}}'+
            '@keyframes '+pfx+'In{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
        document.head.appendChild(s);
        /* Banner */
        var b = document.createElement('div');
        b.id = 'season-banner';
        b.style.cssText =
            'position:fixed;top:0;left:0;right:0;z-index:9998;height:'+BANNER_H+'px;'+
            'display:flex;align-items:center;justify-content:center;overflow:hidden;'+
            'background:linear-gradient(90deg,#000 0%,'+opts.bg+' 20%,'+opts.bg+' 80%,#000 100%);'+
            'border-bottom:1px solid '+acc+'33;'+
            'transform:translateY(-100%);animation:'+pfx+'In .8s cubic-bezier(.16,1,.3,1) .1s forwards;';
        b.innerHTML =
            '<div style="display:flex;align-items:center;gap:16px;position:relative;z-index:2">'+
            '<span style="font-size:22px;animation:'+pfx+'Gl 3s ease-in-out infinite">'+opts.emoji+'</span>'+
            '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,'+acc+'88,transparent)"></div>'+
            '<div style="text-align:center">'+
            '<p style="margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(90deg,'+shimmerColors+');background-size:250% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:'+pfx+'Sh 5s linear infinite">'+opts.title+'</p>'+
            '<p style="margin:3px 0 0;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:'+acc+'80">'+opts.sub+'</p>'+
            '</div>'+
            '<div style="width:1px;height:28px;background:linear-gradient(180deg,transparent,'+acc+'88,transparent)"></div>'+
            '<span style="font-size:22px;animation:'+pfx+'Gl 3s ease-in-out 1s infinite">'+opts.emoji2+'</span>'+
            '</div>';
        document.body.insertBefore(b, document.body.firstChild);
        document.body.classList.add('season-active', opts.bodyClass || '');
        var nav = document.querySelector('nav'); if (nav) nav.style.top = BANNER_H + 'px';
        /* Particles */
        var colors = opts.particles || [acc,'#ffffff'];
        var shapes = opts.shapes   || ['circle','rect'];
        startParticles(colors, shapes);
    }

    /* ════════════════════════════════════════════════════
       RENKLI PARÇACİK EFEKTİ
    ════════════════════════════════════════════════════ */
    function startParticles(colors, shapes) {
        var canvas = document.createElement('canvas');
        canvas.id  = 'season-particles';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:.55';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d'), W, H;
        function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
        resize(); window.addEventListener('resize',resize);
        var pts = [];
        for(var i=0;i<70;i++) pts.push({
            x:Math.random()*1600, y:Math.random()*900-50,
            vx:(Math.random()-.5)*.4, vy:Math.random()*.9+.3,
            r:Math.random()*5+2,
            color:colors[Math.floor(Math.random()*colors.length)],
            rot:Math.random()*Math.PI*2,
            rSpeed:(Math.random()-.5)*.04,
            shape:shapes[Math.floor(Math.random()*shapes.length)],
            opacity:Math.random()*.5+.2
        });
        var lastT=null;
        function draw(ts){
            var dt=lastT?Math.min((ts-lastT)/1000,.05):.016; lastT=ts;
            ctx.clearRect(0,0,W,H);
            pts.forEach(function(p){
                p.x+=p.vx+Math.sin(ts/2000+p.r)*.3;
                p.y+=p.vy; p.rot+=p.rSpeed;
                if(p.y>H+10){p.y=-10;p.x=Math.random()*W;}
                if(p.x>W+5) p.x=-5; else if(p.x<-5) p.x=W+5;
                ctx.save();ctx.globalAlpha=p.opacity;ctx.fillStyle=p.color;
                ctx.translate(p.x,p.y);ctx.rotate(p.rot);
                if(p.shape==='rect'){ctx.fillRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);}
                else if(p.shape==='heart'){ctx.beginPath();ctx.arc(-p.r*.5,-p.r*.3,p.r*.55,Math.PI,0);ctx.arc(p.r*.5,-p.r*.3,p.r*.55,Math.PI,0);ctx.lineTo(0,p.r*.9);ctx.fill();}
                else{ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}
                ctx.restore();
            });
            bgAnimFrame=requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

    return { init: init, apply: applyTheme };
})();
