/* ============================================
   ARCANTH PROJECT — content.js
   Firebase veri senkronizasyonu ve içerik yükleme
   Projeler, Duyurular, İndirmeler, Sponsorlar, CMS
   Bağımlılık: core.js (db, showToast globals)
   ============================================ */

var ANNOUNCEMENTS_KEY = 'admin_announcements';
var PROJECTS_KEY      = 'admin_projects';
var DOWNLOADS_KEY     = 'admin_downloads';
var CMS_KEY           = 'admin_cms_content';
var COOKIES_KEY       = 'admin_cookie_settings';
var SPONSORS_KEY      = 'admin_sponsors';

var allProjects = [];

/* === FIREBASE SYNC === */
async function syncWithFirebase() {
    try {
        console.log('🔄 Firebase senkronizasyonu başlatılıyor...');
        var snapshot = await db.ref('site_data').once('value');
        var data     = snapshot.val();

        if (data) {
            if (data.announcements) { localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(data.announcements)); console.log('✅ Duyurular:', data.announcements.length); }
            if (data.projects)      { localStorage.setItem(PROJECTS_KEY,      JSON.stringify(data.projects));      console.log('✅ Projeler:', data.projects.length); }
            if (data.downloads)     { localStorage.setItem(DOWNLOADS_KEY,     JSON.stringify(data.downloads));     console.log('✅ İndirmeler:', data.downloads.length); }
            if (data.sponsors)      { localStorage.setItem(SPONSORS_KEY,      JSON.stringify(data.sponsors));      console.log('✅ Sponsorlar:', data.sponsors.length); }
            if (data.cms_content)   { localStorage.setItem(CMS_KEY,           JSON.stringify(data.cms_content));   console.log('✅ CMS yüklendi'); }
            if (data.cookie_settings) { localStorage.setItem(COOKIES_KEY,     JSON.stringify(data.cookie_settings)); }
            if (data.settings)      { localStorage.setItem('admin_settings',  JSON.stringify(data.settings)); }

            // Anında yenile
            loadAnnouncements(); loadProjects(); loadDownloads(); loadSponsors();
            console.log('✅ Firebase senkronizasyonu tamamlandı!');
            return true;
        }
        console.warn('⚠️ Firebase\'de veri yok!');
        return false;
    } catch (e) {
        console.error('Firebase sync hatası:', e.message);
        return false;
    }
}

/* === CMS İÇERİĞİ === */
function loadCMSContent() {
    var cms = JSON.parse(localStorage.getItem(CMS_KEY) || '{}');
    if (!cms.hero) return;
    var badge = document.getElementById('hero-badge-text');
    var title = document.getElementById('hero-title');
    var sub   = document.getElementById('hero-subtitle');
    if (cms.hero.badge && badge) badge.textContent = cms.hero.badge;
    if (cms.hero.title && title) {
        var words    = cms.hero.title.split(' ');
        var lastWord = words.pop();
        title.innerHTML = '<span class="dark:text-white block">' + words.join(' ') + '</span><span class="text-gradient block mt-4">' + lastWord + '.</span>';
    }
    if (cms.hero.subtitle && sub) sub.textContent = '"' + cms.hero.subtitle + '"';
}

/* === PROJE KARTI === */
function projectCard(p, large) {
    var sc        = p.status === 'release' ? 'status-release' : p.status === 'beta' ? 'status-beta' : p.status === 'alpha' ? 'status-alpha' : 'status-development';
    var sl        = p.status === 'release' ? 'Live' : p.status === 'beta' ? 'Beta' : p.status === 'alpha' ? 'Alpha' : 'Dev';
    var iconHTML  = (p.icon && p.icon.startsWith('http')) ? '<img src="' + p.icon + '" class="w-full h-full object-cover rounded-2xl">' : '<span class="text-3xl">' + (p.icon || '') + '</span>';
    var pad       = large ? 'p-10' : 'p-8';
    var titleSize = large ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl';

    return '<div class="glass-card ' + pad + ' rounded-[2.5rem] group relative overflow-hidden flex flex-col" data-type="' + (p.type || 'other') + '">' +
        '<div class="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>' +
        '<div class="relative z-10 space-y-5 flex-1 flex flex-col">' +
        '<div class="flex items-center justify-between">' +
        '<div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center overflow-hidden border border-blue-500/20">' + iconHTML + '</div>' +
        '<div class="flex gap-2 items-center">' +
        (p.version ? '<span class="text-xs text-gray-500 font-bold">' + p.version + '</span>' : '') +
        '<span class="px-4 py-1.5 text-[10px] font-black rounded-full ' + sc + '">' + sl + '</span>' +
        '</div></div>' +
        '<h3 class="' + titleSize + ' font-black uppercase italic tracking-tighter">' + p.name + '</h3>' +
        '<p class="text-gray-400 leading-relaxed flex-1">' + p.description + '</p>' +
        '<div class="flex flex-wrap gap-2">' +
        (p.category ? '<span class="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-black text-xs">' + p.category + '</span>' : '') +
        (p.type ? '<span class="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 font-black text-xs uppercase">' + p.type + '</span>' : '') +
        '</div>' +
        (p.link ? '<a href="' + p.link + '" target="_blank" class="btn-shine w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-2xl transition-all mt-auto">INCELE &rarr;</a>' : '') +
        '</div></div>';
}

/* === PROJELERİ YÜKLE === */
function loadProjects() {
    allProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    var grid  = document.getElementById('projects-grid');
    var home  = document.getElementById('homepage-projects-grid');
    var empty = '<div class="glass-card p-10 text-center col-span-full rounded-[2rem]"><p class="text-gray-500 text-lg">Henuz proje yok</p></div>';

    if (allProjects.length === 0) {
        if (grid) grid.innerHTML = empty;
        if (home) home.innerHTML = empty;
    } else {
        if (grid) grid.innerHTML = allProjects.map(function (p) { return projectCard(p, true); }).join('');
        if (home) home.innerHTML = allProjects.slice(0, 2).map(function (p) { return projectCard(p, true); }).join('');
    }
    var stat = document.getElementById('stat-projects');
    if (stat) stat.textContent = allProjects.length;
}

/* === PROJE FİLTRESİ === */
function filterProjects(type) {
    document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('bg-blue-500/20', 'border-blue-500/50', 'text-blue-400');
        b.classList.add('border-white/10');
    });
    event.target.classList.add('bg-blue-500/20', 'border-blue-500/50', 'text-blue-400');
    event.target.classList.remove('border-white/10');
    var grid     = document.getElementById('projects-grid'); if (!grid) return;
    var filtered = type === 'all' ? allProjects : allProjects.filter(function (p) { return p.type === type; });
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="glass-card p-10 text-center col-span-full rounded-[2rem]"><p class="text-gray-500">Bu kategoride proje yok</p></div>';
    } else {
        grid.innerHTML = filtered.map(function (p) { return projectCard(p, true); }).join('');
    }
}

/* === DUYURULARI YÜKLE === */
function loadAnnouncements() {
    var anns = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
    var grid = document.getElementById('announcements-grid'); if (!grid) return;
    if (anns.length === 0) {
        grid.innerHTML = '<div class="glass-card p-10 text-center col-span-full rounded-[2rem]"><p class="text-gray-500 text-lg">Henuz duyuru yok</p></div>';
        return;
    }
    grid.innerHTML = anns.map(function (a) {
        var catColor = a.category === 'onemli' ? 'red' : a.category === 'guncelleme' ? 'blue' : a.category === 'etkinlik' ? 'purple' : 'emerald';
        return '<div class="glass-card p-8 md:p-10 rounded-[2.5rem] space-y-5 group relative overflow-hidden">' +
            '<div class="absolute inset-0 bg-gradient-to-br from-' + catColor + '-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>' +
            '<div class="relative z-10 space-y-5">' +
            '<div class="flex items-center gap-3">' +
            '<span class="px-4 py-2 bg-' + catColor + '-500/15 text-' + catColor + '-500 text-[10px] font-black rounded-full uppercase tracking-wider">' + (a.category || 'bilgi') + '</span>' +
            '<span class="text-xs text-gray-500 font-semibold">' + (a.date || '') + '</span>' +
            '</div>' +
            '<h3 class="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">' + a.title + '</h3>' +
            '<p class="text-gray-400 leading-relaxed">' + a.content + '</p>' +
            '</div></div>';
    }).join('');
}

/* === İNDİRMELERİ YÜKLE === */
function loadDownloads() {
    var dls  = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || '[]');
    var grid = document.getElementById('downloads-grid'); if (!grid) return;
    if (dls.length === 0) {
        grid.innerHTML = '<div class="glass-card p-10 text-center col-span-full rounded-[2rem]"><p class="text-gray-500 text-lg">Henuz indirme yok</p></div>';
        return;
    }
    grid.innerHTML = dls.map(function (d) {
        return '<div class="glass-card p-8 md:p-10 rounded-[2.5rem] space-y-6 text-center group relative overflow-hidden">' +
            '<div class="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>' +
            '<div class="relative z-10 space-y-5">' +
            '<div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">' +
            '<svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>' +
            '</div>' +
            '<h3 class="text-2xl font-black uppercase italic tracking-tighter">' + d.name + '</h3>' +
            '<p class="text-gray-500 text-sm font-semibold">' + (d.version || '') + ' &middot; ' + (d.type || '') + '</p>' +
            (d.link ? '<a href="' + d.link + '" target="_blank" class="btn-shine block py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-2xl transition-all">INDIR</a>' : '') +
            '</div></div>';
    }).join('');
}

/* === SPONSORLARI YÜKLE === */
function loadSponsors() {
    var sponsors  = JSON.parse(localStorage.getItem(SPONSORS_KEY) || '[]');
    var container = document.getElementById('sponsors-container'); if (!container) return;
    if (!sponsors.length) {
        container.innerHTML = '<div class="glass-card p-10 text-center rounded-[2rem]"><p class="text-gray-500 text-lg">Henuz sponsor yok</p></div>';
        return;
    }
    container.innerHTML = sponsors.map(function (s) {
        var featuresHTML = (s.features || []).map(function (f) {
            return '<li class="flex items-start gap-3"><span class="text-orange-500 mt-0.5">&#9670;</span><span>' + f + '</span></li>';
        }).join('');
        return '<div class="glass-card p-6 md:p-12 lg:p-20 rounded-[3rem] border-orange-500/20 group relative overflow-hidden reveal">' +
            '<div class="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-transparent to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>' +
            '<div class="flex flex-col lg:flex-row gap-16 items-center relative z-10">' +
            '<div class="relative flex-shrink-0">' +
            '<div class="absolute inset-0 bg-orange-500 blur-3xl opacity-30"></div>' +
            '<div class="relative w-44 h-44 md:w-56 md:h-56 bg-gradient-to-br from-orange-600 to-yellow-500 rounded-[3rem] shadow-2xl animate-float border-4 border-orange-500/30 overflow-hidden" style="background-image:url(\'' + (s.logo || '') + '\');background-size:cover;background-position:center;background-repeat:no-repeat;">' +
            (s.logo ? '' : '<div class="w-full h-full flex items-center justify-center"><span class="text-7xl font-black">' + (s.name[0] || 'S') + '</span></div>') +
            '</div></div>' +
            '<div class="flex-1 space-y-10 text-center lg:text-left">' +
            '<div class="space-y-4">' +
            '<div class="flex items-center justify-center lg:justify-start gap-4 flex-wrap">' +
            '<h3 class="text-4xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-orange-500">' + s.name + '</h3>' +
            '<span class="px-5 py-2 bg-blue-500/10 text-blue-400 text-xs font-black rounded-full uppercase border border-blue-500/30">Sponsor</span>' +
            '</div>' +
            (s.tagline ? '<p class="text-2xl text-gray-400 italic font-bold">' + s.tagline + '</p>' : '') +
            '</div>' +
            (s.ip ? '<div class="glass-card p-7 rounded-[2rem] space-y-5 border border-orange-500/10 hover:border-orange-500/30 transition-all">' +
                '<div class="flex items-center gap-3">' +
                '<div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">' +
                '<svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>' +
                '</div><h4 class="font-black uppercase tracking-wider text-sm">Sunucu Bilgileri</h4></div>' +
                '<div><p class="text-xs text-orange-500 uppercase font-black tracking-wider mb-1">IP Adresi</p>' +
                '<p class="text-xl font-black tracking-tight">' + s.ip + '</p></div></div>' : '') +
            (featuresHTML ? '<div class="glass-card p-7 rounded-[2rem] space-y-5 border border-orange-500/10 hover:border-orange-500/30 transition-all">' +
                '<div class="flex items-center gap-3"><div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">' +
                '<svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' +
                '</div><h4 class="font-black uppercase tracking-wider text-sm">Ozellikler</h4></div>' +
                '<ul class="text-gray-400 space-y-3 text-base">' + featuresHTML + '</ul></div>' : '') +
            '<div class="flex flex-wrap gap-5 pt-4 justify-center lg:justify-start">' +
            (s.website ? '<a href="' + s.website + '" target="_blank" class="btn-shine px-10 py-5 bg-orange-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-orange-500 transition-all shadow-2xl">Web Sitesi</a>' : '') +
            (s.discord ? '<a href="' + s.discord + '" target="_blank" class="px-10 py-5 bg-[#5865F2] text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl">Discord</a>' : '') +
            '</div></div></div></div>';
    }).join('');
}

/* === COOKIE NOTICE === */
function loadCookieNotice() {
    var c = JSON.parse(localStorage.getItem(COOKIES_KEY) || '{}');
    if (c.title)      { var e = document.getElementById('cookie-title');       if (e) e.textContent = c.title; }
    if (c.description){ var e = document.getElementById('cookie-description'); if (e) e.textContent = c.description; }
    if (c.acceptText) { var e = document.getElementById('cookie-accept-btn');  if (e) e.textContent = c.acceptText; }
    if (c.rejectText) { var e = document.getElementById('cookie-reject-btn');  if (e) e.textContent = c.rejectText; }
    if (!localStorage.getItem('cookies-accepted')) {
        setTimeout(function () { var n = document.getElementById('cookie-notice'); if (n) n.classList.add('show'); }, 2500);
    }
}

/* === FOOTER SOCIAL === */
function loadFooterSocial() {
    var settings  = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    var container = document.getElementById('footer-social'); if (!container) return;
    var socials   = '';

    if (settings.discord)   socials += '<a href="' + settings.discord   + '" target="_blank" class="text-gray-500 hover:text-[#5865F2] transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg></a>';
    if (settings.github)    socials += '<a href="' + settings.github    + '" target="_blank" class="text-gray-500 hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>';
    if (settings.instagram) socials += '<a href="' + settings.instagram + '" target="_blank" class="text-gray-500 hover:text-pink-500 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>';
    if (settings.youtube)   socials += '<a href="' + settings.youtube   + '" target="_blank" class="text-gray-500 hover:text-red-500 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>';
    if (settings.twitter)   socials += '<a href="' + settings.twitter   + '" target="_blank" class="text-gray-500 hover:text-blue-400 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>';

    container.innerHTML = socials || '<p class="text-gray-500 text-xs">Sosyal medya linkleri admin panelden ekleyin</p>';
}

/* === DOMContentLoaded ANA BAŞLATICI === */
document.addEventListener('DOMContentLoaded', async function () {
    // Bakım modu kontrolü
    try {
        var maintSnap = await db.ref('site_data/settings/maintenance').once('value');
        var maint = maintSnap.val();
        if (maint && maint.enabled) {
            window.location.href = 'bakim.html';
            return;
        }
    } catch (e) { /* bakım kontrolü başarısız, devam et */ }

    // Firebase veri sync
    await syncWithFirebase();

    // İçerik yükle
    loadCMSContent();
    loadAnnouncements();
    loadProjects();
    loadDownloads();
    loadSponsors();
    loadCookieNotice();
    loadFooterSocial();

    // UI başlat
    initParticles();
    initScrollAnimations();

    // Tema sistemini başlat (themes.js)
    if (typeof ThemeSystem !== 'undefined') ThemeSystem.init();

    // Loading screen kaldır
    setTimeout(function () {
        var ls = document.getElementById('loading-screen');
        if (ls) { ls.classList.add('hidden'); setTimeout(function () { ls.remove(); }, 800); }
    }, 500);
});
