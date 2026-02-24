/* ArcanthProject Core Logic - Professional Elite Version */

const firebaseConfig = { apiKey: "AIzaSyCnkk6j1CGsi4sNXJ8FA9Gd2B6_VDptVDg", authDomain: "arcanthproject.firebaseapp.com", databaseURL: "https://arcanthproject-default-rtdb.firebaseio.com", projectId: "arcanthproject", storageBucket: "arcanthproject.firebasestorage.app", messagingSenderId: "826341954149", appId: "1:826341954149:web:6429d61a5b40810009ac8c" };

// Global Variables
const ANNOUNCEMENTS_KEY = 'site_announcements';
const PROJECTS_KEY = 'site_projects';
const DOWNLOADS_KEY = 'site_downloads';
const SPONSORS_KEY = 'site_sponsors';
const CMS_KEY = 'site_cms_content';
const COOKIES_KEY = 'site_cookie_settings';
const SETTINGS_KEY = 'site_general_settings';

let db, auth;
let currentUser = null;

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    auth = firebase.auth();
}

// Global Help Functions
function g(id) { return document.getElementById(id); }

// UI Logic
function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-link'));

    const tab = g(id);
    if (tab) tab.classList.add('active');

    const btn = g('btn-' + id);
    if (btn) btn.classList.add('active-link');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger reveals
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
        });
    }, 100);
}

function toggleMobileMenu() {
    const m = g('mobile-menu');
    const h = g('hamburger-btn');
    if (m) m.classList.toggle('open');
    if (h) h.classList.toggle('active');
}

function mobileNav(id) {
    showTab(id);
    toggleMobileMenu();
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = g('theme-icon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
}

// Search Logic
function openSearch() {
    const m = g('search-modal');
    if (m) {
        m.classList.add('active');
        setTimeout(() => {
            const i = g('search-input');
            if (i) i.focus();
        }, 100);
    }
}

function closeSearch() {
    const m = g('search-modal');
    if (m) {
        m.classList.remove('active');
        const i = g('search-input');
        if (i) i.value = '';
    }
    const r = g('search-results');
    if (r) r.innerHTML = '';
}

function performSearch(e) {
    const q = e.target.value.toLowerCase().trim();
    const r = g('search-results');
    if (!r) return;
    if (q.length < 2) { r.innerHTML = ''; return; }

    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    const anns = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
    const dls = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || '[]');
    const results = [];

    projects.forEach(p => { if ((p.name + ' ' + (p.description || '')).toLowerCase().includes(q)) results.push({ name: p.name, type: 'Proje', page: 'projeler' }); });
    anns.forEach(a => { if ((a.title + ' ' + (a.content || '')).toLowerCase().includes(q)) results.push({ name: a.title, type: 'Duyuru', page: 'duyurular' }); });
    dls.forEach(d => { if ((d.name).toLowerCase().includes(q)) results.push({ name: d.name, type: 'Indirme', page: 'indirmeler' }); });

    if (!results.length) { r.innerHTML = '<p class="text-gray-500 text-center py-6 text-sm">Sonuç bulunamadı</p>'; return; }

    r.innerHTML = results.map(i => `
        <div class="search-result-item" onclick="showTab('${i.page}');closeSearch();">
            <p class="font-black text-base">${i.name}</p>
            <span class="text-[10px] text-blue-400 font-bold uppercase tracking-wider">${i.type}</span>
        </div>
    `).join('');
}

// Cookie Logic
function acceptCookies() {
    localStorage.setItem('cookies-accepted', 'true');
    const n = g('cookie-notice');
    if (n) n.classList.remove('show');
}

function rejectCookies() {
    localStorage.setItem('cookies-accepted', 'false');
    const n = g('cookie-notice');
    if (n) n.classList.remove('show');
}

// Sync Logic
async function syncWithFirebase() {
    if (!db) return false;
    try {
        console.log('🔄 Firebase senkronizasyonu...');
        const snapshot = await db.ref('site_data').once('value');
        const data = snapshot.val();
        if (data) {
            if (data.announcements) localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(data.announcements));
            if (data.projects) localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects));
            if (data.downloads) localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(data.downloads));
            if (data.sponsors) localStorage.setItem(SPONSORS_KEY, JSON.stringify(data.sponsors));
            if (data.cms_content) localStorage.setItem(CMS_KEY, JSON.stringify(data.cms_content));
            if (data.cookie_settings) localStorage.setItem(COOKIES_KEY, JSON.stringify(data.cookie_settings));
            if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
            return true;
        }
        return false;
    } catch (e) {
        console.error('Firebase sync error:', e);
        return false;
    }
}

// Particle Engine
function initParticles() {
    const canvas = g('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [], mouse = { x: null, y: null };

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 0.5
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x, dy = p.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
}
