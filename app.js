// Аутентификация (имитация для примера)
// В реальном проекте подключите Supabase

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.setupForms();
        this.checkExistingSession();
    }

    setupForms() {
        // Форма входа
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Форма регистрации
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Имитация аутентификации
        const loadingBtn = document.querySelector('#loginForm .auth-submit');
        const originalText = loadingBtn.innerHTML;
        
        loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ПОДКЛЮЧЕНИЕ...';
        loadingBtn.disabled = true;
        
        try {
            // Здесь будет реальный запрос к Supabase
            // const { data, error } = await supabase.auth.signInWithPassword({
            //     email,
            //     password
            // });
            
            // Имитация задержки сети
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (email && password) {
                // Успешный вход
                const user = {
                    id: Date.now().toString(),
                    email,
                    username: email.split('@')[0],
                    created_at: new Date().toISOString()
                };
                
                this.setSession(user);
                window.cyberChat.hideModal();
                this.showNotification('Успешный вход в систему!', 'success');
                
                // Имитация подключения к чату
                setTimeout(() => {
                    window.cyberChat.updateConnectionStatus('ПОДКЛЮЧЕНО');
                    window.chatManager.connect();
                }, 500);
            } else {
                throw new Error('Неверные учетные данные');
            }
        } catch (error) {
            this.showNotification(error.message || 'Ошибка входа', 'error');
        } finally {
            loadingBtn.innerHTML = originalText;
            loadingBtn.disabled = false;
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        // Валидация
        if (password !== passwordConfirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        const loadingBtn = document.querySelector('#registerForm .auth-submit');
        const originalText = loadingBtn.innerHTML;
        
        loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> РЕГИСТРАЦИЯ...';
        loadingBtn.disabled = true;
        
        try {
            // Здесь будет реальный запрос к Supabase
            // const { data, error } = await supabase.auth.signUp({
            //     email,
            //     password,
            //     options: {
            //         data: {
            //             username: username
            //         }
            //     }
            // });
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Имитация успешной регистрации
            const user = {
                id: Date.now().toString(),
                email,
                username,
                created_at: new Date().toISOString()
            };
            
            this.setSession(user);
            window.cyberChat.hideModal();
            this.showNotification('Аккаунт успешно создан!', 'success');
            
            // Переключаем на вкладку входа
            window.cyberChat.switchTab('login');
            
        } catch (error) {
            this.showNotification(error.message || 'Ошибка регистрации', 'error');
        } finally {
            loadingBtn.innerHTML = originalText;
            loadingBtn.disabled = false;
        }
    }

    setSession(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Сохраняем в localStorage
        localStorage.setItem('cyberchat_user', JSON.stringify(user));
        localStorage.setItem('cyberchat_token', 'demo_token_' + Date.now());
        
        // Обновляем UI
        window.cyberChat.updateUIForUser(user);
    }

    checkExistingSession() {
        const userData = localStorage.getItem('cyberchat_user');
        const token = localStorage.getItem('cyberchat_token');
        
        if (userData && token) {
            try {
                const user = JSON.parse(userData);
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Имитация проверки токена
                if (token.startsWith('demo_token_')) {
                    window.cyberChat.updateUIForUser(user);
                    window.cyberChat.updateConnectionStatus('ПОДКЛЮЧЕНО');
                } else {
                    this.clearSession();
                }
            } catch (error) {
                this.clearSession();
            }
        }
    }

    clearSession() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('cyberchat_user');
        localStorage.removeItem('cyberchat_token');
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `cyber-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getUser() {
        return this.currentUser;
    }
}

// Стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .cyber-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--cyber-gray);
        border: 1px solid var(--cyber-primary);
        border-radius: 8px;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        z-index: 9999;
        box-shadow: var(--neon-glow);
    }
    
    .cyber-notification.show {
        transform: translateX(0);
    }
    
    .cyber-notification.success {
        border-color: var(--cyber-primary);
    }
    
    .cyber-notification.error {
        border-color: var(--cyber-accent);
    }
    
    .cyber-notification i {
        font-size: 1.5rem;
    }
    
    .cyber-notification.success i {
        color: var(--cyber-primary);
    }
    
    .cyber-notification.error i {
        color: var(--cyber-accent);
    }
`;

document.head.appendChild(notificationStyles);

// Инициализация менеджера аутентификации
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});