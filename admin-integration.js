/**
 * Admin Panel İçin İntegrasyon Script
 * index.html'de kullan: <script src="admin-integration.js"></script>
 */

const AdminIntegration = {
    // Storage Keys
    STORAGE_KEYS: {
        announcements: 'admin_announcements',
        projects: 'admin_projects',
        downloads: 'admin_downloads'
    },

    // Admin verilerini getir
    getAnnouncements() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.announcements) || '[]');
    },

    getProjects() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.projects) || '[]');
    },

    getDownloads() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.downloads) || '[]');
    },

    // Duyuruları dinamik olarak yükle
    loadAnnouncementsToPage() {
        const announcements = this.getAnnouncements();
        if (announcements.length === 0) return;

        const announcementsContainer = document.getElementById('dynamic-announcements');
        if (!announcementsContainer) return;

        const html = announcements.map(announcement => `
            <div class="glass-card p-10 rounded-[3rem] group relative overflow-hidden hover:border-blue-500/50 transition-all">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div class="relative z-10 space-y-4">
                    <div class="flex items-start justify-between">
                        <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl">
                            📢
                        </div>
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-black rounded-full">
                            ${announcement.date}
                        </span>
                    </div>
                    
                    <div>
                        <h3 class="text-2xl font-black uppercase italic mb-2">
                            ${announcement.title}
                        </h3>
                        <span class="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded uppercase font-bold">
                            ${announcement.category}
                        </span>
                    </div>
                    
                    <p class="text-gray-400 leading-relaxed">
                        ${announcement.content.substring(0, 200)}${announcement.content.length > 200 ? '...' : ''}
                    </p>
                </div>
            </div>
        `).join('');

        announcementsContainer.innerHTML = html;
    },

    // Projeleri dinamik olarak yükle
    loadProjectsToPage() {
        const projects = this.getProjects();
        if (projects.length === 0) return;

        const projectsContainer = document.getElementById('dynamic-projects');
        if (!projectsContainer) return;

        const html = projects.map(project => `
            <div class="glass-card p-10 rounded-[3rem] group relative overflow-hidden hover:border-purple-500/50 transition-all flex flex-col">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div class="relative z-10 space-y-6 flex-1 flex flex-col">
                    <div class="flex items-center justify-between">
                        <div class="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl">
                            🚀
                        </div>
                        <div class="flex gap-2 flex-wrap">
                            <span class="px-3 py-1 bg-green-500 text-white text-xs font-black rounded-full">Live</span>
                            <span class="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-black rounded-full uppercase">
                                ${project.type}
                            </span>
                            <span class="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-black rounded-full uppercase">
                                ${project.status === 'development' ? 'Dev' : project.status === 'beta' ? 'Beta' : 'Release'}
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-3xl font-black uppercase italic tracking-tighter">
                            ${project.name}
                        </h3>
                    </div>
                    
                    <p class="text-gray-400 leading-relaxed flex-1">
                        ${project.description}
                    </p>
                    
                    <a href="${project.link}" target="_blank" class="btn-shine w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-2xl transition-all">
                        <span>İNCELE</span>
                        <span>→</span>
                    </a>
                </div>
            </div>
        `).join('');

        projectsContainer.innerHTML = html;
    },

    // İndirmeleri dinamik olarak yükle
    loadDownloadsToPage() {
        const downloads = this.getDownloads();
        if (downloads.length === 0) return;

        const downloadsContainer = document.getElementById('dynamic-downloads');
        if (!downloadsContainer) return;

        const html = downloads.map(download => `
            <div onclick="showDownloadDetail('${download.id}')" class="glass-card p-10 rounded-[3rem] cursor-pointer group hover:border-blue-500/50 transition-all space-y-6">
                <div class="flex items-start justify-between">
                    <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl">
                        📦
                    </div>
                    ${download.version ? `<span class="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-black rounded-full">${download.version}</span>` : ''}
                </div>
                
                <div>
                    <h3 class="text-2xl font-black uppercase italic mb-2">${download.name}</h3>
                    <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">${download.type}</p>
                </div>
                
                <p class="text-gray-400 leading-relaxed">
                    Admin tarafından eklenmiş indirme
                </p>
                
                <div class="pt-4 border-t border-white/5">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-500">Detayları görmek için tıkla</span>
                        <span class="text-blue-500 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                </div>
            </div>
        `).join('');

        downloadsContainer.innerHTML = html;
    },

    // Tüm verileri yükle
    loadAllData() {
        this.loadAnnouncementsToPage();
        this.loadProjectsToPage();
        this.loadDownloadsToPage();
    }
};

// Sayfa yüklendiğinde verileri çek
document.addEventListener('DOMContentLoaded', () => {
    AdminIntegration.loadAllData();
});
