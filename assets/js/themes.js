/* ArcanthProject Theme Manager - Ramadan & New Year */

function initEventThemes(db) {
    console.log('✨ Özel gün temaları sistemi başlatıldı.');

    // Remove legacy greeting bars if any
    const existingGreetings = document.querySelectorAll('.ramadan-greeting, .newyear-greeting');
    existingGreetings.forEach(el => el.remove());

    // Create greeting containers
    const ramadanBar = document.createElement('div');
    ramadanBar.className = 'ramadan-greeting';
    ramadanBar.innerHTML = '🌙 HOŞ GELDİN ON BİR AYIN SULTANI - HAYIRLI RAMAZANLAR!';
    document.body.prepend(ramadanBar);

    const newYearBar = document.createElement('div');
    newYearBar.className = 'newyear-greeting';
    newYearBar.innerHTML = '❄️ ARCANTH PROJECT MUTLU YILLAR DİLER! 🎉';
    document.body.prepend(newYearBar);

    // Listen for theme changes in Firebase
    db.ref('site_data/settings/active_theme').on('value', snap => {
        const theme = snap.val() || 'normal';
        document.documentElement.setAttribute('data-event-theme', theme);

        console.log('🎨 Aktif Tema Değişti:', theme);

        if (theme === 'newyear') {
            startSnowfall();
        } else {
            stopSnowfall();
        }

        if (theme === 'ramadan') {
            applyRamadanEffects();
        } else {
            removeRamadanEffects();
        }
    });
}

let snowInterval;
function startSnowfall() {
    if (snowInterval) return;
    snowInterval = setInterval(() => {
        const snow = document.createElement('div');
        snow.className = 'snow-particle';
        const size = Math.random() * 5 + 2 + 'px';
        snow.style.width = size;
        snow.style.height = size;
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.top = '-10px';
        snow.style.opacity = Math.random();
        snow.style.filter = 'blur(1px)';
        document.body.appendChild(snow);

        const duration = Math.random() * 3000 + 4000;
        const anim = snow.animate([
            { transform: 'translateY(0) rotate(0deg)', left: snow.style.left },
            { transform: `translateY(105vh) rotate(${Math.random() * 360}deg)`, left: (parseFloat(snow.style.left) + (Math.random() * 10 - 5)) + 'vw' }
        ], {
            duration: duration,
            easing: 'linear'
        });

        anim.onfinish = () => snow.remove();
    }, 200);
}

function stopSnowfall() {
    clearInterval(snowInterval);
    snowInterval = null;
    document.querySelectorAll('.snow-particle').forEach(el => el.remove());
}

function applyRamadanEffects() {
    // Add custom icons or colors
    const heroTitle = document.querySelector('h1.text-gradient');
    if (heroTitle && !heroTitle.dataset.original) {
        heroTitle.dataset.original = heroTitle.innerHTML;
        // Optionally inject something
    }
}

function removeRamadanEffects() {
    const heroTitle = document.querySelector('h1.text-gradient');
    if (heroTitle && heroTitle.dataset.original) {
        // heroTitle.innerHTML = heroTitle.dataset.original;
    }
}
