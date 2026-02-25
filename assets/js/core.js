/* ============================================
   ARCANTH PROJECT — core.js
   Firebase başlatma, Auth, UI yardımcıları
   Bağımlılık: Firebase SDK (HTML'de yüklü olmalı)
   ============================================ */

/* === FIREBASE INIT === */
var firebaseConfig = {
    apiKey: "AIzaSyCnkk6j1CGsi4sNXJ8FA9Gd2B6_VDptVDg",
    authDomain: "arcanthproject.firebaseapp.com",
    databaseURL: "https://arcanthproject-default-rtdb.firebaseio.com",
    projectId: "arcanthproject",
    storageBucket: "arcanthproject.firebasestorage.app",
    messagingSenderId: "826341954149",
    appId: "1:826341954149:web:6429d61a5b40810009ac8c"
};
firebase.initializeApp(firebaseConfig);
var db   = firebase.database();
var auth = firebase.auth();

/* === AUTH STATE === */
var currentAuthUser = null;
var loginInProgress = false;

auth.onAuthStateChanged(function (user) {
    currentAuthUser = user;
    var authBtn           = document.getElementById('authButton');
    var profileContainer  = document.getElementById('userProfileContainer');

    if (user) {
        if (authBtn)          authBtn.classList.add('hidden');
        if (profileContainer) profileContainer.classList.remove('hidden');
        var emailEl = document.getElementById('dropdownEmail');
        if (emailEl) emailEl.textContent = user.email;
    } else {
        if (authBtn) {
            authBtn.classList.remove('hidden');
            authBtn.textContent = 'Giris Yap';
            authBtn.onclick = handleAuth;
        }
        if (profileContainer) profileContainer.classList.add('hidden');
    }
});

/* === AUTH MODAL === */
function handleAuth()      { openAuthModal(); }
function openAuthModal()   { var m = document.getElementById('auth-modal'); if (m) m.classList.remove('hidden'); }
function closeAuthModal()  { var m = document.getElementById('auth-modal'); if (m) m.classList.add('hidden'); }

function handleDesktek()   { window.location.href = 'destek.html'; }

function logoutUser() {
    if (confirm('Çıkış yapmak istediğiniz emin misiniz?')) auth.signOut();
}

async function loginWithGoogle() {
    if (loginInProgress) return;
    loginInProgress = true;
    try {
        var provider = new firebase.auth.GoogleAuthProvider();
        var result   = await auth.signInWithPopup(provider);
        var user     = result.user;
        var userRef  = db.ref('users/' + user.uid);
        var snap     = await userRef.once('value');
        if (!snap.exists()) {
            await userRef.set({
                name: user.displayName || 'Google User',
                email: user.email,
                username: user.email.split('@')[0],
                created: new Date().toISOString(),
                lastUsernameChange: null,
                provider: 'google'
            });
        }
        showToast('✓ Google ile giriş başarılı!', 'success');
        closeAuthModal();
    } catch (e) {
        loginInProgress = false;
        if (e.code === 'auth/popup-cancelled-by-user' || e.code === 'auth/cancelled-popup-request') return;
        alert('Hata: ' + e.message);
    } finally { loginInProgress = false; }
}

async function loginWithGithub() {
    if (loginInProgress) return;
    loginInProgress = true;
    try {
        var provider = new firebase.auth.GithubAuthProvider();
        var result   = await auth.signInWithPopup(provider);
        var user     = result.user;
        var userRef  = db.ref('users/' + user.uid);
        var snap     = await userRef.once('value');
        if (!snap.exists()) {
            await userRef.set({
                name: user.displayName || 'GitHub User',
                email: user.email,
                username: user.email ? user.email.split('@')[0] : 'user',
                created: new Date().toISOString(),
                lastUsernameChange: null,
                provider: 'github'
            });
        }
        showToast('✓ GitHub ile giriş başarılı!', 'success');
        closeAuthModal();
    } catch (e) {
        loginInProgress = false;
        if (e.code === 'auth/popup-cancelled-by-user' || e.code === 'auth/cancelled-popup-request') return;
        alert('Hata: ' + e.message);
    } finally { loginInProgress = false; }
}

var isRegisterMode = true;
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    var form = document.getElementById('auth-form-content');
    if (isRegisterMode) {
        form.innerHTML =
            '<input type="text" id="regName" class="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all" placeholder="Ad Soyad" required>' +
            '<input type="email" id="regEmail" class="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all" placeholder="E-posta" required>' +
            '<input type="password" id="regPass" class="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all" placeholder="Şifre (min 6 karakter)" required>' +
            '<button type="submit" class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl border-2 border-blue-500/50">KAYIT OL</button>' +
            '<button type="button" onclick="toggleAuthMode()" class="w-full text-sm text-gray-400 hover:text-white transition-colors">Zaten hesabınız var mı? Giriş yapın</button>';
    } else {
        form.innerHTML =
            '<input type="email" id="loginEmail" class="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all" placeholder="E-posta" required>' +
            '<input type="password" id="loginPass" class="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all" placeholder="Şifre" required>' +
            '<button type="submit" class="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl border-2 border-green-500/50">GİRİŞ YAP</button>' +
            '<button type="button" onclick="resetPassword()" class="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">Şifremi Unuttum</button>' +
            '<button type="button" onclick="toggleAuthMode()" class="w-full text-sm text-gray-400 hover:text-white transition-colors">Hesabınız yok mu? Kayıt olun</button>';
    }
}

async function resetPassword() {
    var email = prompt('Şifre sıfırlama linkini göndermek için e-posta adresinizi girin:');
    if (!email) return;
    try {
        await auth.sendPasswordResetEmail(email);
        alert('✓ Şifre sıfırlama linki e-posta adresinize gönderildi!\n\nLütfen e-postanızı kontrol edin.');
    } catch (e) {
        if (e.code === 'auth/user-not-found') alert('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı!');
        else alert('Hata: ' + e.message);
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    var err = document.getElementById('auth-error');
    try {
        if (isRegisterMode) {
            var name  = document.getElementById('regName').value.trim();
            var email = document.getElementById('regEmail').value.trim();
            var pass  = document.getElementById('regPass').value;
            if (!name || !email || !pass) throw new Error('Tüm alanları doldurun!');
            if (pass.length < 6) throw new Error('Şifre en az 6 karakter olmalı!');
            var cred = await auth.createUserWithEmailAndPassword(email, pass);
            await db.ref('users/' + cred.user.uid).set({
                name: name, email: email,
                username: email.split('@')[0],
                created: new Date().toISOString(),
                lastUsernameChange: null
            });
            showToast('✓ Kayıt başarılı!', 'success');
            closeAuthModal();
        } else {
            var email2 = document.getElementById('loginEmail').value.trim();
            var pass2  = document.getElementById('loginPass').value;
            if (!email2 || !pass2) throw new Error('E-posta ve şifre gerekli!');
            await auth.signInWithEmailAndPassword(email2, pass2);
            showToast('✓ Giriş başarılı!', 'success');
            closeAuthModal();
        }
    } catch (e) {
        if (err) {
            err.textContent = e.message;
            err.classList.remove('hidden');
            setTimeout(function () { err.classList.add('hidden'); }, 5000);
        }
    }
}

/* === TOAST === */
function showToast(msg, type) {
    var c = document.getElementById('toast-container'); if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.innerHTML = '<span class="text-sm font-bold">' + msg + '</span>';
    c.appendChild(t);
    setTimeout(function () {
        t.style.opacity = '0'; t.style.transition = 'opacity 0.3s';
        setTimeout(function () { t.remove(); }, 300);
    }, 5000);
}

/* === THEME TOGGLE (dark/light) === */
function toggleTheme() {
    var html = document.documentElement;
    var icon = document.getElementById('theme-icon');
    if (html.classList.contains('dark')) {
        html.classList.replace('dark', 'light');
        if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
    } else {
        html.classList.replace('light', 'dark');
        if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
}

/* === MOBILE MENU === */
function toggleMobileMenu() {
    var m = document.getElementById('mobile-menu');
    var h = document.getElementById('hamburger-btn');
    if (m) m.classList.toggle('open');
    if (h) h.classList.toggle('active');
}
function mobileNav(id) { showTab(id); toggleMobileMenu(); }

/* === SEARCH === */
function openSearch() {
    var m = document.getElementById('search-modal');
    if (m) { m.classList.add('active'); setTimeout(function () { var i = document.getElementById('search-input'); if (i) i.focus(); }, 100); }
}
function closeSearch() {
    var m = document.getElementById('search-modal');
    if (m) { m.classList.remove('active'); var i = document.getElementById('search-input'); if (i) i.value = ''; }
    var r = document.getElementById('search-results'); if (r) r.innerHTML = '';
}
function performSearch(e) {
    var q = e.target.value.toLowerCase().trim();
    var r = document.getElementById('search-results'); if (!r) return;
    if (q.length < 2) { r.innerHTML = ''; return; }
    var projects = JSON.parse(localStorage.getItem('admin_projects') || '[]');
    var anns     = JSON.parse(localStorage.getItem('admin_announcements') || '[]');
    var dls      = JSON.parse(localStorage.getItem('admin_downloads') || '[]');
    var results  = [];
    projects.forEach(function (p) { if ((p.name + ' ' + p.description).toLowerCase().includes(q)) results.push({ name: p.name, type: 'Proje', page: 'projeler' }); });
    anns.forEach(function (a)     { if ((a.title  + ' ' + a.content).toLowerCase().includes(q)) results.push({ name: a.title, type: 'Duyuru', page: 'duyurular' }); });
    dls.forEach(function (d)      { if ((d.name).toLowerCase().includes(q))                     results.push({ name: d.name, type: 'Indirme', page: 'indirmeler' }); });
    if (!results.length) { r.innerHTML = '<p class="text-gray-500 text-center py-6 text-sm">Sonuc bulunamadi</p>'; return; }
    r.innerHTML = results.map(function (i) {
        return '<div class="search-result-item" onclick="showTab(\'' + i.page + '\');closeSearch();">' +
               '<p class="font-black text-base">' + i.name + '</p>' +
               '<span class="text-[10px] text-blue-400 font-bold uppercase tracking-wider">' + i.type + '</span></div>';
    }).join('');
}

/* === TABS === */
function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.remove('active-link'); });
    var tab = document.getElementById(id);        if (tab) tab.classList.add('active');
    var btn = document.getElementById('btn-' + id); if (btn) btn.classList.add('active-link');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function () {
        document.querySelectorAll('.reveal').forEach(function (el) {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
        });
    }, 100);
}

/* === COOKIE === */
function acceptCookies() {
    localStorage.setItem('cookies-accepted', 'true');
    var n = document.getElementById('cookie-notice'); if (n) n.classList.remove('show');
}
function rejectCookies() {
    localStorage.setItem('cookies-accepted', 'false');
    var n = document.getElementById('cookie-notice'); if (n) n.classList.remove('show');
}

/* === PARTICLES — Premium === */
function initParticles() {
    var canvas = document.getElementById('particles-canvas'); if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h;
    var mouse = { x: -9999, y: -9999 };
    var startTime = null;

    /* ---- Yeniden boyutlandır ---- */
    function resize() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function(e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', function()  { mouse.x = -9999; mouse.y = -9999; });

    /* ---- Aurora orb'ları (statik konum, zaman ile pulse) ---- */
    var orbs = [
        { cx: 0.20, cy: 0.25, rx: 0.45, ry: 0.30, r: 120, g: 80,  b: 255, speed: 0.28, phase: 0.0 },
        { cx: 0.75, cy: 0.18, rx: 0.50, ry: 0.28, r: 80,  g: 180, b: 255, speed: 0.22, phase: 1.8 },
        { cx: 0.50, cy: 0.55, rx: 0.40, ry: 0.35, r: 160, g: 60,  b: 255, speed: 0.18, phase: 3.5 }
    ];

    /* ---- Partiküller: 3 derinlik katmanı ---- */
    var layers = [
        { count: 35, speed: 0.15, rMin: 1.0, rMax: 2.0, alpha: 0.55, connDist: 140, lineAlpha: 0.12 }, /* arka */
        { count: 25, speed: 0.28, rMin: 1.5, rMax: 2.8, alpha: 0.75, connDist: 120, lineAlpha: 0.18 }, /* orta */
        { count: 15, speed: 0.50, rMin: 2.0, rMax: 3.8, alpha: 0.90, connDist:  90, lineAlpha: 0.25 }  /* ön  */
    ];
    var particles = [];
    layers.forEach(function(layer) {
        for (var i = 0; i < layer.count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = layer.speed * (0.6 + Math.random() * 0.8);
            particles.push({
                x:      Math.random() * (w || 1200),
                y:      Math.random() * (h || 800),
                vx:     Math.cos(angle) * speed,
                vy:     Math.sin(angle) * speed,
                r:      layer.rMin + Math.random() * (layer.rMax - layer.rMin),
                alpha:  layer.alpha * (0.7 + Math.random() * 0.3),
                pulse:  Math.random() * Math.PI * 2,
                pSpeed: 0.5 + Math.random() * 1.0,
                layer:  layer
            });
        }
    });

    /* ---- Kayan yıldızlar ---- */
    var shooters = [];
    function spawnShooter() {
        var side = Math.random() < 0.5; /* sol veya üst */
        shooters.push({
            x:      side ? -20 : Math.random() * w,
            y:      side ? Math.random() * h * 0.5 : -20,
            vx:     side ? 3.5 + Math.random() * 3 : 1.5 + Math.random() * 2,
            vy:     side ? 1.0 + Math.random() * 1.5 : 3.5 + Math.random() * 3,
            len:    80 + Math.random() * 120,
            alpha:  0.9,
            life:   1.0
        });
    }
    var nextShoot = 3 + Math.random() * 5; /* ilk kayan yıldız 3-8 sn sonra */

    /* ---- Ana döngü ---- */
    function draw(ts) {
        if (!startTime) startTime = ts;
        var t = (ts - startTime) / 1000;
        ctx.clearRect(0, 0, w, h);

        /* --- Aurora arka plan --- */
        orbs.forEach(function(o) {
            var pulse = 0.04 + Math.sin(t * o.speed + o.phase) * 0.025;
            var grd = ctx.createRadialGradient(
                o.cx * w, o.cy * h, 0,
                o.cx * w, o.cy * h, Math.min(w, h) * (o.rx + o.ry) / 2
            );
            grd.addColorStop(0,   'rgba(' + o.r + ',' + o.g + ',' + o.b + ',' + (pulse * 1.8) + ')');
            grd.addColorStop(0.4, 'rgba(' + o.r + ',' + o.g + ',' + o.b + ',' + (pulse * 0.5) + ')');
            grd.addColorStop(1,   'rgba(' + o.r + ',' + o.g + ',' + o.b + ',0)');
            ctx.save();
            ctx.scale(o.rx / o.ry, 1);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(o.cx * w / (o.rx / o.ry), o.cy * h, Math.min(w, h) * o.ry, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        /* --- Partiküller --- */
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            /* Hareket */
            /* Fare itme */
            var fdx = p.x - mouse.x, fdy = p.y - mouse.y;
            var fd2 = fdx * fdx + fdy * fdy;
            if (fd2 < 22500) { /* 150px */
                var fd = Math.sqrt(fd2);
                var force = (1 - fd / 150) * 0.6;
                p.vx += (fdx / fd) * force;
                p.vy += (fdy / fd) * force;
            }
            /* Hız sınırı */
            var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            var maxSpd = p.layer.speed * 2.5;
            if (spd > maxSpd) { p.vx = (p.vx / spd) * maxSpd; p.vy = (p.vy / spd) * maxSpd; }

            p.x += p.vx; p.y += p.vy;
            if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;

            /* Pulse */
            var pa = p.alpha * (0.7 + Math.sin(t * p.pSpeed + p.pulse) * 0.3);

            /* Çizim — glow */
            var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            grd.addColorStop(0,   'rgba(180,160,255,' + pa + ')');
            grd.addColorStop(0.4, 'rgba(120,100,255,' + (pa * 0.5) + ')');
            grd.addColorStop(1,   'rgba(80,60,255,0)');
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();
            /* Merkez nokta */
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220,210,255,' + pa + ')'; ctx.fill();

            /* Bağlantı çizgileri (aynı katmandaki partiküller) */
            for (var j = i + 1; j < particles.length; j++) {
                if (particles[j].layer !== p.layer) continue;
                var dx = p.x - particles[j].x, dy = p.y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < p.layer.connDist) {
                    var la = p.layer.lineAlpha * (1 - dist / p.layer.connDist);
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(150,120,255,' + la + ')';
                    ctx.lineWidth = 0.6; ctx.stroke();
                }
            }

            /* Fare bağlantısı */
            var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
            var md2 = mdx * mdx + mdy * mdy;
            if (md2 < 90000) { /* 300px */
                var md = Math.sqrt(md2);
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = 'rgba(200,150,255,' + (0.2 * (1 - md / 300)) + ')';
                ctx.lineWidth = 0.8; ctx.stroke();
            }
        }

        /* --- Kayan yıldızlar --- */
        if (t > nextShoot) {
            spawnShooter();
            nextShoot = t + 4 + Math.random() * 8;
        }
        for (var si = shooters.length - 1; si >= 0; si--) {
            var s = shooters[si];
            s.x += s.vx; s.y += s.vy;
            s.life -= 0.012;
            if (s.life <= 0 || s.x > w + 50 || s.y > h + 50) { shooters.splice(si, 1); continue; }
            var tailX = s.x - s.vx * (s.len / Math.sqrt(s.vx * s.vx + s.vy * s.vy));
            var tailY = s.y - s.vy * (s.len / Math.sqrt(s.vx * s.vx + s.vy * s.vy));
            var sg = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            sg.addColorStop(0,   'rgba(255,255,255,0)');
            sg.addColorStop(0.7, 'rgba(200,180,255,' + (s.life * 0.3) + ')');
            sg.addColorStop(1,   'rgba(255,255,255,' + (s.life * 0.9) + ')');
            ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = sg; ctx.lineWidth = 1.5; ctx.stroke();
            /* Başlık parıltı */
            var hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
            hg.addColorStop(0, 'rgba(255,255,255,' + (s.life * 0.9) + ')');
            hg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = hg; ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

/* === SCROLL ANIMATIONS === */
function initScrollAnimations() {
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });

    window.addEventListener('scroll', function () {
        var btt = document.getElementById('back-to-top');
        if (btt) { if (window.scrollY > 400) btt.classList.add('show'); else btt.classList.remove('show'); }
        var prog = document.getElementById('scroll-progress');
        if (prog) {
            var pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            prog.style.width = Math.min(pct, 100) + '%';
        }
    });

    var btt = document.getElementById('back-to-top');
    if (btt) btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* === KEYBOARD SHORTCUTS === */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
});

/* === CURSOR GLOW === */
(function () {
    var glow = document.getElementById('glow');
    if (glow && !window.matchMedia('(max-width:768px)').matches) {
        window.addEventListener('mousemove', function (e) {
            glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
        });
    } else if (glow) { glow.style.display = 'none'; }
})();

/* === DROPDOWN === */
document.addEventListener('DOMContentLoaded', function () {
    var profileBtn = document.getElementById('userProfileBtn');
    var dropdown   = document.getElementById('userDropdown');
    if (profileBtn) {
        profileBtn.addEventListener('click', function (e) { e.stopPropagation(); if (dropdown) dropdown.classList.toggle('hidden'); });
    }
    document.addEventListener('click', function () { if (dropdown) dropdown.classList.add('hidden'); });
});
