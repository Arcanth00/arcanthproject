/* ArcanthProject Content Loader - Professional Elite Version */

function loadAnnouncements() {
    const anns = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
    const grid = g('announcements-grid');
    if (!grid) return;
    if (anns.length === 0) {
        grid.innerHTML = '<div class="glass-card p-10 text-center col-span-full rounded-[2rem]"><p class="text-gray-500 text-lg">Henüz duyuru yok</p></div>';
        return;
    }
    grid.innerHTML = anns.map(a => {
        const catColor = a.category === 'onemli' ? 'red' : a.category === 'guncelleme' ? 'blue' : a.category === 'etkinlik' ? 'purple' : 'emerald';
        return `
            <div class="glass-card p-8 md:p-10 rounded-[2.5rem] space-y-5 group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-${catColor}-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div class="relative z-10 space-y-5">
                    <div class="flex items-center gap-3">
                        <span class="px-4 py-2 bg-${catColor}-500/15 text-${catColor}-500 text-[10px] font-black rounded-full uppercase tracking-wider">${a.category || 'bilgi'}</span>
                        <span class="text-xs text-gray-500 font-semibold">${a.date || ''}</span>
                    </div>
                    <h3 class="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">${a.title}</h3>
                    <p class="text-gray-400 leading-relaxed">${a.content}</p>
                </div>
            </div>
        `;
    }).join('');
}

function projectCard(p, large) {
    const sc = p.status === 'release' ? 'status-release' : p.status === 'beta' ? 'status-beta' : p.status === 'alpha' ? 'status-alpha' : 'status-development';
    const sl = p.status === 'release' ? 'Live' : p.status === 'beta' ? 'Beta' : p.status === 'alpha' ? 'Alpha' : 'Dev';
    let iconHTML;
    if (p.icon && p.icon.startsWith('http')) {
        iconHTML = `<img src="${p.icon}" class="w-full h-full object-cover rounded-2xl">`;
    } else {
        iconHTML = `<span class="text-3xl">${p.icon || '📦'}</span>`;
    }
    const pad = large ? 'p-10' : 'p-8';
    const titleSize = large ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl';

    return `
        <div class="glass-card ${pad} rounded-[2.5rem] group relative overflow-hidden flex flex-col" data-type="${p.type || 'other'}">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div class="relative z-10 space-y-5 flex-1 flex flex-col">
                <div class="flex items-center justify-between">
                    <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center overflow-hidden border border-blue-500/20">${iconHTML}</div>
                    <div class="flex gap-2 items-center">
                        ${p.version ? `<span class="text-xs text-gray-500 font-bold">${p.version}</span>` : ''}
                        <span class="px-4 py-1.5 text-[10px] font-black rounded-full ${sc}">${sl}</span>
                    </div>
                </div>
                <h3 class="${titleSize} font-black uppercase italic tracking-tighter">${p.name}</h3>
                <p class="text-gray-400 leading-relaxed flex-1">${p.description || ''}</p>
                <div class="flex flex-wrap gap-2">
                    ${p.category ? `<span class="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-black text-xs">${p.category}</span>` : ''}
                    ${p.type ? `<span class="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 font-black text-xs uppercase">${p.type}</span>` : ''}
                </div>
                ${p.link ? `<a href="${p.link}" target="_blank" class="btn-shine w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-2xl transition-all mt-auto">İNCELE &rarr;</a>` : ''}
            </div>
        </div>
    `;
}

function loadProjects() {
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    const grid = g('projects-grid');
    if (!grid) return;
    if (projects.length === 0) {
        grid.innerHTML = '<div class="glass-card p-10 text-center col-span-full"><p class="text-gray-500">Henüz proje yok</p></div>';
        return;
    }
    grid.innerHTML = projects.map((p, i) => projectCard(p, i < 2)).join('');
}

function loadDownloads() {
    const dls = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || '[]');
    const grid = g('downloads-grid');
    if (!grid) return;
    if (dls.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-center col-span-full">Henüz indirilebilir içerik yok</p>';
        return;
    }
    grid.innerHTML = dls.map(d => `
        <div class="glass-card p-8 rounded-[2rem] flex items-center justify-between group">
            <div class="flex items-center gap-6">
                <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </div>
                <div>
                    <h4 class="font-black text-xl uppercase italic tracking-tighter">${d.name}</h4>
                    <p class="text-gray-500 text-xs font-bold uppercase tracking-widest">${d.version} • ${d.type}</p>
                </div>
            </div>
            <a href="${d.link}" onclick="trackDownload('${d.name}')" target="_blank" class="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all uppercase tracking-widest">İNDİR</a>
        </div>
    `).join('');
}

function loadSponsors() {
    const sponsors = JSON.parse(localStorage.getItem(SPONSORS_KEY) || '[]');
    const container = g('sponsor-container');
    if (!container) return;
    container.innerHTML = sponsors.map(s => `
        <div class="glass-card p-10 rounded-[3rem] border-orange-500/10">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="space-y-6">
                    <div class="flex items-center gap-4">
                        <span class="px-4 py-2 bg-orange-500/10 text-orange-500 text-[10px] font-black rounded-full uppercase tracking-widest italic">RESMİ PARTNER</span>
                    </div>
                    <img src="${s.logo}" class="h-16 object-contain" alt="${s.name}" onerror="this.style.display='none'">
                    <h2 class="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">${s.name}</h2>
                    <p class="text-gray-400 text-lg leading-relaxed">${s.description || ''}</p>
                    <div class="flex flex-wrap gap-3">
                        ${(s.features || []).map(f => `<span class="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-gray-400 border border-white/5">${f}</span>`).join('')}
                    </div>
                    <div class="flex gap-4 pt-4">
                        <a href="${s.website}" target="_blank" class="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all">SİTEYE GİT</a>
                        <a href="${s.discord}" target="_blank" class="px-8 py-4 bg-white/5 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-white/10 transition-all">DISCORD</a>
                    </div>
                </div>
                <div class="relative group hidden md:block">
                    <div class="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                    <div class="relative bg-[#0a0f1a] p-8 rounded-[2.5rem] border border-white/5">
                        <div class="flex items-center justify-between mb-8">
                            <span class="text-gray-500 font-bold text-xs uppercase tracking-widest">Sunucu Bilgisi</span>
                            <div class="flex gap-1">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                <span class="text-green-500 text-[10px] font-bold uppercase">ONLINE</span>
                            </div>
                        </div>
                        <div class="py-8 border-y border-white/5">
                            <p class="text-gray-500 text-xs font-bold uppercase mb-2">Sunucu Adresi</p>
                            <div class="flex items-center justify-between">
                                <p class="text-2xl font-mono font-bold text-white">${s.ip || ''}</p>
                                <button onclick="copyToClipboard('${s.ip}')" class="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function trackDownload(name) {
    if (!db) return;
    try {
        await db.ref('download_counts/' + name.replace(/\./g, '_')).transaction(curr => (curr || 0) + 1);
        await db.ref('analytics/downloads/' + Date.now()).set({ name: name, timestamp: Date.now() });
    } catch (e) {
        console.error('Track error:', e);
    }
}

function loadCMSContent() {
    const d = JSON.parse(localStorage.getItem(CMS_KEY) || '{}');
    if (d.hero) {
        if (d.hero.badge && g('h-badge')) g('h-badge').textContent = d.hero.badge;
        if (d.hero.title && g('h-title')) g('h-title').textContent = d.hero.title;
        if (d.hero.subtitle && g('h-sub')) g('h-sub').textContent = d.hero.subtitle;
    }
}

function loadFooterSocial() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const container = g('footer-social');
    if (!container) return;
    let socials = '';
    const icons = {
        discord: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>',
        github: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        instagram: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        youtube: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        twitter: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    };

    Object.keys(icons).forEach(k => {
        if (settings[k]) socials += `<a href="${settings[k]}" target="_blank" class="text-gray-500 hover:text-white transition-colors">${icons[k]}</a>`;
    });

    container.innerHTML = socials || '<p class="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Takipte Kalın</p>';
}

function loadCookieNotice() {
    if (localStorage.getItem('cookies-accepted') === 'true') {
        const n = g('cookie-notice');
        if (n) n.remove();
    } else {
        setTimeout(() => {
            const n = g('cookie-notice');
            if (n) {
                const config = JSON.parse(localStorage.getItem(COOKIES_KEY) || '{}');
                if (config.title) n.querySelector('h4').textContent = config.title;
                if (config.description) n.querySelector('p').textContent = config.description;
                if (config.acceptText) n.querySelectorAll('button')[0].textContent = config.acceptText.toUpperCase();
                if (config.rejectText) n.querySelectorAll('button')[1].textContent = config.rejectText.toUpperCase();
                n.classList.add('show');
            }
        }, 2000);
    }
}
