// ==========================================
// APP.JS - ArcanthProject Website
// ==========================================

// Konfigürasyon
const CONFIG = {
    discordGuildId: 'YOUR_GUILD_ID', // Değiştirilmeli
    curseforgeModId: 'YOUR_MOD_ID',  // Değiştirilmeli
    gaTrackingId: 'G-XXXXXXXXXX',     // Google Analytics ID
    apiTimeout: 5000
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initCookieNotice();
    initPWA();
    fetchLiveStats();
    initAnalytics();
    initSmoothScroll();
});

// ==========================================
// FAQ ACCORDION
// ==========================================

function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('.faq-icon');
            
            // Toggle active state
            const isActive = answer.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(a => {
                a.classList.remove('active');
            });
            document.querySelectorAll('.faq-icon').forEach(i => {
                i.classList.remove('active');
            });
            
            // Toggle current FAQ
            if (!isActive) {
                answer.classList.add('active');
                icon.classList.add('active');
            }
        });
    });
}

// ==========================================
// LIVE STATS - Discord + CurseForge
// ==========================================

async function fetchLiveStats() {
    try {
        // Paralel API çağrıları
        const [discordData, curseforgeData] = await Promise.allSettled([
            fetchDiscordStats(),
            fetchCurseForgeStats()
        ]);
        
        updateStatsUI(discordData, curseforgeData);
    } catch (error) {
        console.error('Stats fetch error:', error);
        showStatsError();
    }
}

async function fetchDiscordStats() {
    const response = await fetch(
        `https://discord.com/api/guilds/${CONFIG.discordGuildId}/widget.json`,
        { 
            signal: AbortSignal.timeout(CONFIG.apiTimeout),
            mode: 'cors'
        }
    );
    
    if (!response.ok) throw new Error('Discord API error');
    return response.json();
}

async function fetchCurseForgeStats() {
    // CurseForge API key gerekli - free tier: api.curseforge.com
    const response = await fetch(
        `https://api.curseforge.com/v1/mods/${CONFIG.curseforgeModId}`,
        {
            headers: {
                'x-api-key': 'YOUR_CURSEFORGE_API_KEY' // Değiştirilmeli
            },
            signal: AbortSignal.timeout(CONFIG.apiTimeout)
        }
    );
    
    if (!response.ok) throw new Error('CurseForge API error');
    return response.json();
}

function updateStatsUI(discordData, curseforgeData) {
    const discordElement = document.getElementById('discord-members');
    const downloadsElement = document.getElementById('total-downloads');
    const serversElement = document.getElementById('active-servers');
    
    // Discord Stats
    if (discordData.status === 'fulfilled') {
        const members = discordData.value.presence_count || 0;
        animateNumber(discordElement, members, '<i class="fab fa-discord"></i>');
    } else {
        discordElement.innerHTML = '<span style="font-size: 1.5rem;">N/A</span>';
    }
    
    // CurseForge Downloads
    if (curseforgeData.status === 'fulfilled') {
        const downloads = curseforgeData.value.data?.downloadCount || 0;
        animateNumber(downloadsElement, downloads, '<i class="fas fa-download"></i>');
    } else {
        downloadsElement.innerHTML = '<span style="font-size: 1.5rem;">N/A</span>';
    }
    
    // Aktif Sunucular (mock data - gerçek sunucu sayacı eklenebilir)
    animateNumber(serversElement, 247, '<i class="fas fa-server"></i>');
}

function animateNumber(element, target, icon = '') {
    let current = 0;
    const increment = Math.ceil(target / 50);
    const duration = 1500;
    const stepTime = duration / (target / increment);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.innerHTML = `${icon} ${formatNumber(current)}`;
    }, stepTime);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showStatsError() {
    console.warn('Stats could not be loaded, using fallback values');
    document.getElementById('discord-members').innerHTML = '<span style="font-size: 1.5rem;">-</span>';
    document.getElementById('total-downloads').innerHTML = '<span style="font-size: 1.5rem;">-</span>';
    document.getElementById('active-servers').innerHTML = '<span style="font-size: 1.5rem;">-</span>';
}

// ==========================================
// COOKIE NOTICE
// ==========================================

function initCookieNotice() {
    const cookieNotice = document.getElementById('cookieNotice');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');
    
    // Check if user already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        setTimeout(() => {
            cookieNotice.classList.add('show');
        }, 1000);
    } else if (cookieConsent === 'accepted') {
        enableAnalytics();
    }
    
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieNotice.classList.remove('show');
        enableAnalytics();
    });
    
    rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieNotice.classList.remove('show');
    });
}

// ==========================================
// GOOGLE ANALYTICS
// ==========================================

function initAnalytics() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted') {
        enableAnalytics();
    }
}

function enableAnalytics() {
    // Google Analytics 4 script injection
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaTrackingId}`;
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${CONFIG.gaTrackingId}', {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=None;Secure'
        });
    `;
    
    document.head.appendChild(script1);
    document.head.appendChild(script2);
    
    console.log('✓ Analytics enabled');
}

// ==========================================
// PWA - Service Worker Registration
// ==========================================

function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/pwa/service-worker.js')
                .then(registration => {
                    console.log('✓ Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
    
    // Install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button (optional)
        showInstallButton(deferredPrompt);
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('✓ PWA installed');
        deferredPrompt = null;
    });
}

function showInstallButton(prompt) {
    // Opsiyonel: "Ana Ekrana Ekle" butonu göster
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Uygulamayı Yükle';
    installBtn.className = 'btn btn-secondary';
    installBtn.style.position = 'fixed';
    installBtn.style.bottom = '2rem';
    installBtn.style.right = '2rem';
    installBtn.style.zIndex = '999';
    
    installBtn.addEventListener('click', async () => {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        console.log(`Install prompt outcome: ${outcome}`);
        installBtn.remove();
    });
    
    document.body.appendChild(installBtn);
}

// ==========================================
// SMOOTH SCROLL
// ==========================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offset = 80; // navbar height
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Loading state helper
function setLoading(element, isLoading) {
    if (isLoading) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

// Error toast (opsiyonel)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 6rem;
        right: 2rem;
        background: var(--bg-card);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==========================================
// EXPORT (for testing)
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchLiveStats,
        initFAQ,
        initCookieNotice
    };
}
