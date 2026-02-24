// Email format kontrolü
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Şifre gücü kontrolü
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'zayif', text: 'Zayıf', color: 'red' };
    if (strength <= 4) return { level: 'orta', text: 'Orta', color: 'yellow' };
    return { level: 'guclu', text: 'Güçlü', color: 'green' };
}

// Gerçek zamanlı validasyon
function setupValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#ef4444';
                showError(this, 'Geçersiz e-posta formatı');
            } else {
                this.style.borderColor = '';
                hideError(this);
            }
        });
    });

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (input.placeholder.includes('Yeni')) {
            input.addEventListener('input', function() {
                const strength = checkPasswordStrength(this.value);
                showPasswordStrength(this, strength);
            });
        }
    });
}

function showError(input, message) {
    let error = input.nextElementSibling;
    if (!error || !error.classList.contains('error-message')) {
        error = document.createElement('p');
        error.className = 'error-message text-red-500 text-xs mt-1';
        input.parentNode.insertBefore(error, input.nextSibling);
    }
    error.textContent = message;
}

function hideError(input) {
    const error = input.nextElementSibling;
    if (error && error.classList.contains('error-message')) {
        error.remove();
    }
}

function showPasswordStrength(input, strength) {
    let indicator = input.parentNode.querySelector('.password-strength');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'password-strength mt-2';
        input.parentNode.appendChild(indicator);
    }
    indicator.innerHTML = `
        <div class="flex gap-1 mb-1">
            <div class="h-1 flex-1 rounded ${strength.level === 'zayif' ? 'bg-red-500' : 'bg-gray-700'}"></div>
            <div class="h-1 flex-1 rounded ${strength.level === 'orta' || strength.level === 'guclu' ? 'bg-yellow-500' : 'bg-gray-700'}"></div>
            <div class="h-1 flex-1 rounded ${strength.level === 'guclu' ? 'bg-green-500' : 'bg-gray-700'}"></div>
        </div>
        <p class="text-xs text-${strength.color}-500">Şifre Gücü: ${strength.text}</p>
    `;
}

// Sayfa yüklendiğinde çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupValidation);
} else {
    setupValidation();
}
