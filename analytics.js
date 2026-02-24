// Analytics sistem
const Analytics = {
    // Sayfa görüntüleme
    trackPageView(page) {
        const view = {
            id: Date.now(),
            page: page,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        firebase.database().ref('analytics/pageviews/' + view.id).set(view);
    },
    
    // İndirme takibi
    trackDownload(projectName, version) {
        const download = {
            id: Date.now(),
            project: projectName,
            version: version,
            timestamp: new Date().toISOString()
        };
        
        firebase.database().ref('analytics/downloads/' + download.id).set(download);
        
        // İndirme sayacını artır
        const projectRef = firebase.database().ref('download_counts/' + projectName);
        projectRef.transaction(count => (count || 0) + 1);
    },
    
    // İstatistikleri getir
    async getStats() {
        const stats = {
            totalUsers: 0,
            totalDownloads: 0,
            totalPageviews: 0,
            topProjects: []
        };
        
        try {
            // Kullanıcı sayısı
            const usersSnap = await firebase.database().ref('users').once('value');
            stats.totalUsers = usersSnap.numChildren();
            
            // İndirme sayısı
            const dlSnap = await firebase.database().ref('analytics/downloads').once('value');
            stats.totalDownloads = dlSnap.numChildren();
            
            // Sayfa görüntüleme
            const pvSnap = await firebase.database().ref('analytics/pageviews').once('value');
            stats.totalPageviews = pvSnap.numChildren();
            
            // En çok indirilen projeler
            const countsSnap = await firebase.database().ref('download_counts').once('value');
            const counts = [];
            countsSnap.forEach(child => {
                counts.push({ name: child.key, count: child.val() });
            });
            stats.topProjects = counts.sort((a, b) => b.count - a.count).slice(0, 5);
            
            return stats;
        } catch (e) {
            console.error('Analytics error:', e);
            return stats;
        }
    },
    
    // Son 7 günün istatistikleri
    async getWeeklyStats() {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const stats = {
            dailyUsers: [],
            dailyDownloads: [],
            dailyPageviews: []
        };
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            stats.dailyUsers.unshift({ date: dateStr, count: 0 });
            stats.dailyDownloads.unshift({ date: dateStr, count: 0 });
            stats.dailyPageviews.unshift({ date: dateStr, count: 0 });
        }
        
        return stats;
    }
};

// Otomatik sayfa takibi
window.addEventListener('load', () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    Analytics.trackPageView(page);
});
