// Auth functionality with complete form handling
console.log('Loading B-Mart Auth JS...');

let currentUser = null;
let users = []; // Local storage for registered users

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth JS Initialized');
    loadUsers();
    setupAuthEventListeners();
    checkAuthStatus();
});

function setupAuthEventListeners() {
    // Auth modal triggers
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
    if (registerBtn) registerBtn.addEventListener('click', () => openAuthModal('register'));
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        setupLoginValidation();
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupRegisterValidation();
    }
    
    // Password strength
    setupPasswordStrength();
}

function setupLoginValidation() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (emailInput) emailInput.addEventListener('input', validateLoginForm);
    if (passwordInput) passwordInput.addEventListener('input', validateLoginForm);
}

function setupRegisterValidation() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    const inputs = ['register-name', 'register-email', 'register-password', 'register-confirm-password', 'register-phone'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) input.addEventListener('input', validateRegisterForm);
    });
}

function validateLoginForm() {
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    
    if (!email || !password || !submitBtn) return;
    
    const isEmailValid = isValidEmail(email.value);
    const isPasswordValid = password.value.length >= 6;
    const isValid = isEmailValid && isPasswordValid && email.value.trim() !== '' && password.value.trim() !== '';
    
    submitBtn.disabled = !isValid;
    
    updateFieldValidation(email, isEmailValid);
    updateFieldValidation(password, isPasswordValid);
}

function validateRegisterForm() {
    const name = document.getElementById('register-name');
    const email = document.getElementById('register-email');
    const password = document.getElementById('register-password');
    const confirmPassword = document.getElementById('register-confirm-password');
    const phone = document.getElementById('register-phone');
    const submitBtn = document.querySelector('#register-form button[type="submit"]');
    
    if (!name || !email || !password || !confirmPassword || !submitBtn) return;
    
    const isNameValid = name.value.trim().length >= 2;
    const isEmailValid = isValidEmail(email.value);
    const isPasswordValid = password.value.length >= 6;
    const isConfirmPasswordValid = password.value === confirmPassword.value && password.value !== '';
    const isPhoneValid = !phone.value || isValidPhone(phone.value);
    
    const isValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isPhoneValid;
    submitBtn.disabled = !isValid;
    
    updateFieldValidation(name, isNameValid);
    updateFieldValidation(email, isEmailValid);
    updateFieldValidation(password, isPasswordValid);
    updateFieldValidation(confirmPassword, isConfirmPasswordValid);
    if (phone.value) updateFieldValidation(phone, isPhoneValid);
}

function updateFieldValidation(field, isValid) {
    if (!field) return;
    
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        if (field.value.trim() !== '') {
            field.classList.add('is-invalid');
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function openAuthModal(tab = 'login') {
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    const authModalTitle = document.getElementById('authModalTitle');
    
    if (tab === 'login') {
        const loginTab = document.querySelector('#login-tab');
        if (loginTab) new bootstrap.Tab(loginTab).show();
        if (authModalTitle) authModalTitle.textContent = 'Login to Your Account';
    } else {
        const registerTab = document.querySelector('#register-tab');
        if (registerTab) new bootstrap.Tab(registerTab).show();
        if (authModalTitle) authModalTitle.textContent = 'Create New Account';
    }
    
    resetAuthForms();
    authModal.show();
}

function resetAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.reset();
        loginForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
        const loginSubmit = loginForm.querySelector('button[type="submit"]');
        if (loginSubmit) loginSubmit.disabled = true;
    }
    
    if (registerForm) {
        registerForm.reset();
        registerForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
        const registerSubmit = registerForm.querySelector('button[type="submit"]');
        if (registerSubmit) registerSubmit.disabled = true;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
        showAuthLoading('login', true);
        
        // Validate inputs
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Check if user exists
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                joinDate: user.joinDate
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            
            const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
            if (authModal) authModal.hide();
            
            showNotification(`Welcome back, ${user.name}! 👋`, 'success');
            
            // Reset form
            const loginForm = document.getElementById('login-form');
            if (loginForm) loginForm.reset();
        } else {
            throw new Error('Invalid email or password');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('login', error.message);
    } finally {
        showAuthLoading('login', false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const phone = document.getElementById('register-phone').value.trim();
    
    try {
        showAuthLoading('register', true);
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            throw new Error('Please fill in all required fields');
        }
        
        if (name.length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        if (phone && !isValidPhone(phone)) {
            throw new Error('Please enter a valid phone number');
        }
        
        // Check if email already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            phone: phone || '',
            joinDate: new Date().toISOString(),
            orders: []
        };
        
        users.push(newUser);
        saveUsers();
        
        currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            joinDate: newUser.joinDate
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        
        const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (authModal) authModal.hide();
        
        showNotification(`Account created successfully! Welcome to B-Mart, ${name}! 🎉`, 'success');
        
        // Reset form and switch to login tab for next time
        const registerForm = document.getElementById('register-form');
        if (registerForm) registerForm.reset();
        
    } catch (error) {
        console.error('Registration error:', error);
        showAuthError('register', error.message);
    } finally {
        showAuthLoading('register', false);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showNotification('You have been logged out successfully', 'info');
}

function loadUsers() {
    const savedUsers = localStorage.getItem('bMartUsers');
    if (savedUsers) {
        try {
            users = JSON.parse(savedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            users = [];
        }
    }
    
    // Add demo user for testing
    if (users.length === 0) {
        users = [
            {
                id: 1,
                name: 'Demo User',
                email: 'demo@bmart.com',
                password: 'password123',
                phone: '+1234567890',
                joinDate: new Date().toISOString(),
                orders: []
            }
        ];
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem('bMartUsers', JSON.stringify(users));
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
        }
    }
    updateAuthUI();
}

function updateAuthUI() {
    const authStatus = document.getElementById('auth-status');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (currentUser) {
        if (authStatus) authStatus.textContent = currentUser.name.split(' ')[0];
        if (logoutBtn) logoutBtn.classList.remove('d-none');
        if (loginBtn) loginBtn.classList.add('d-none');
        if (registerBtn) registerBtn.classList.add('d-none');
    } else {
        if (authStatus) authStatus.textContent = 'Login';
        if (logoutBtn) logoutBtn.classList.add('d-none');
        if (loginBtn) loginBtn.classList.remove('d-none');
        if (registerBtn) registerBtn.classList.remove('d-none');
    }
}

function showAuthLoading(formType, show) {
    const form = document.getElementById(`${formType}-form`);
    if (!form) return;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    
    if (show) {
        submitBtn.innerHTML = `
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            ${formType === 'login' ? 'Signing in...' : 'Creating account...'}
        `;
        submitBtn.disabled = true;
    } else {
        submitBtn.innerHTML = originalText;
        validateLoginForm();
        validateRegisterForm();
    }
}

function showAuthError(formType, message) {
    const form = document.getElementById(`${formType}-form`);
    if (!form) return;
    
    // Remove existing error alerts
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create error alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    form.insertBefore(alert, form.firstChild);
}

// Password strength indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        const progressBar = document.querySelector('.password-strength .progress-bar');
        const strengthText = document.querySelector('.password-strength .strength-text');
        
        if (progressBar && strengthText) {
            progressBar.style.width = strength.percentage + '%';
            progressBar.className = 'progress-bar ' + strength.class;
            strengthText.textContent = strength.text;
            strengthText.className = 'strength-text ' + strength.textClass;
        }
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    if (password.length < 6) {
        return {
            percentage: 25,
            class: 'bg-danger',
            text: 'Too short',
            textClass: 'text-danger'
        };
    }
    
    if (strength <= 25) {
        return {
            percentage: 25,
            class: 'bg-danger',
            text: 'Weak',
            textClass: 'text-danger'
        };
    } else if (strength <= 50) {
        return {
            percentage: 50,
            class: 'bg-warning',
            text: 'Fair',
            textClass: 'text-warning'
        };
    } else if (strength <= 75) {
        return {
            percentage: 75,
            class: 'bg-info',
            text: 'Good',
            textClass: 'text-info'
        };
    } else {
        return {
            percentage: 100,
            class: 'bg-success',
            text: 'Strong',
            textClass: 'text-success'
        };
    }
}

// Password visibility toggle
window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Demo login for testing
window.demoLogin = function() {
    document.getElementById('login-email').value = 'demo@bmart.com';
    document.getElementById('login-password').value = 'password123';
    document.getElementById('login-form').dispatchEvent(new Event('input'));
};

// Export for use in other files
window.auth = {
    getCurrentUser: () => currentUser,
    isLoggedIn: () => currentUser !== null,
    openAuthModal: openAuthModal,
    logout: handleLogout
};

console.log('B-Mart Auth JS loaded successfully');