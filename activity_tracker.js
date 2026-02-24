// Aktivite takip sistemi
const ActivityTracker = {
    // Giriş kaydı
    async logLogin(userId, email) {
        const ip = await this.getIP();
        const activity = {
            id: Date.now(),
            userId: userId,
            email: email,
            type: 'login',
            ip: ip,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        try {
            await firebase.database().ref('activity_logs/' + activity.id).set(activity);
            await firebase.database().ref('users/' + userId + '/lastLogin').set(activity.timestamp);
            await firebase.database().ref('users/' + userId + '/lastIP').set(ip);
        } catch (e) {
            console.error('Activity log error:', e);
        }
    },
    
    // IP adresi al
    async getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (e) {
            return 'Unknown';
        }
    },
    
    // İşlem kaydı
    async logAction(userId, action, details = '') {
        const activity = {
            id: Date.now(),
            userId: userId,
            type: 'action',
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        try {
            await firebase.database().ref('activity_logs/' + activity.id).set(activity);
        } catch (e) {
            console.error('Activity log error:', e);
        }
    },
    
    // Kullanıcı aktivitelerini getir
    async getUserActivities(userId, limit = 50) {
        try {
            const snapshot = await firebase.database()
                .ref('activity_logs')
                .orderByChild('userId')
                .equalTo(userId)
                .limitToLast(limit)
                .once('value');
            
            const activities = [];
            snapshot.forEach(child => {
                activities.push(child.val());
            });
            
            return activities.reverse();
        } catch (e) {
            console.error('Get activities error:', e);
            return [];
        }
    }
};

// Auth state değiştiğinde çalıştır
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        ActivityTracker.logLogin(user.uid, user.email);
    }
});
