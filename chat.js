// Управление чатом

class ChatManager {
    constructor() {
        this.messages = [];
        this.users = [];
        this.isConnected = false;
        this.messageCount = 0;
        this.init();
    }

    init() {
        this.setupMessageHandling();
        this.setupMockData();
        this.startConnectionSimulation();
    }

    setupMessageHandling() {
        // Обработка отправки сообщений
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
    }

    setupMockData() {
        // Имитация пользователей
        this.users = [
            { id: '1', username: 'Neo', status: 'online', avatar: 'N' },
            { id: '2', username: 'Trinity', status: 'online', avatar: 'T' },
            { id: '3', username: 'Morpheus', status: 'away', avatar: 'M' },
            { id: '4', username: 'Cypher', status: 'offline', avatar: 'C' },
            { id: '5', username: 'Oracle', status: 'online', avatar: 'O' }
        ];

        // Имитация сообщений
        this.messages = [
            {
                id: '1',
                userId: '1',
                username: 'Neo',
                text: 'Добро пожаловать в Матрицу, чат.',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: '2',
                userId: '2',
                username: 'Trinity',
                text: 'Следуй за белым кроликом...',
                timestamp: new Date(Date.now() - 1800000).toISOString()
            },
            {
                id: '3',
                userId: '5',
                username: 'Oracle',
                text: 'Познай себя.',
                timestamp: new Date(Date.now() - 600000).toISOString()
            }
        ];

        this.updateUsersList();
        this.renderMessages();
        this.updateStats();
    }

    connect() {
        if (this.isConnected) return;
        
        this.isConnected = true;
        
        // Имитация подключения к WebSocket
        setTimeout(() => {
            this.addSystemMessage('Соединение установлено. Вы в сети.');
            
            // Имитация активности пользователей
            this.simulateUserActivity();
            
            // Обновляем статистику
            this.updateOnlineCount();
        }, 1000);
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const messageText = input.value.trim();
        
        if (!messageText || !window.authManager.isAuthenticated) return;
        
        const user = window.authManager.getUser();
        const message = {
            id: Date.now().toString(),
            userId: user.id,
            username: user.username,
            text: messageText,
            timestamp: new Date().toISOString()
        };
        
        // В реальном проекте: отправка через Supabase Realtime
        // await supabase.from('messages').insert([message]);
        
        // Локальная обработка
        this.messages.push(message);
        this.renderMessage(message);
        input.value = '';
        
        // Обновляем счетчик
        this.messageCount++;
        window.cyberChat.updateMessageCount(this.messageCount);
        
        // Имитация ответа
        setTimeout(() => {
            this.simulateResponse();
        }, 1000 + Math.random() * 2000);
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.messages.forEach(message => {
            this.renderMessage(message, false);
        });
        
        this.scrollToBottom();
    }

    renderMessage(message, scroll = true) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        const isCurrentUser = window.authManager.isAuthenticated && 
                            window.authManager.getUser()?.id === message.userId;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'current-user' : ''}`;
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-username">${message.username}</span>
                <span class="message-time">${this.formatTime(message.timestamp)}</span>
                ${isCurrentUser ? '<span class="user-badge">ВЫ</span>' : ''}
            </div>
            <div class="message-content">
                <p>${this.escapeHtml(message.text)}</p>
            </div>
        `;
        
        container.appendChild(messageElement);
        
        if (scroll) {
            this.scrollToBottom();
        }
    }

    addSystemMessage(text) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.innerHTML = `
            <i class="fas fa-robot"></i>
            <p>${text}</p>
        `;
        
        container.appendChild(messageElement);
        this.scrollToBottom();
    }

    updateUsersList() {
        const container = document.getElementById('usersList');
        if (!container) return;
        
        // Убираем скелетоны
        container.innerHTML = '';
        
        this.users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-card';
            userElement.innerHTML = `
                <div class="user-avatar">${user.avatar}</div>
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <div class="user-status">
                        <span class="status-${user.status}">●</span>
                        ${user.status.toUpperCase()}
                    </div>
                </div>
            `;
            
            container.appendChild(userElement);
        });
        
        this.updateOnlineCount();
    }

    updateOnlineCount() {
        const onlineUsers = this.users.filter(u => u.status === 'online').length;
        window.cyberChat.updateOnlineCount(onlineUsers);
    }

    updateStats() {
        window.cyberChat.updateOnlineCount(this.users.filter(u => u.status === 'online').length);
        window.cyberChat.updateMessageCount(this.messages.length);
        this.messageCount = this.messages.length;
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    simulateUserActivity() {
        // Имитация изменения статусов пользователей
        setInterval(() => {
            if (Math.random() > 0.7) {
                const user = this.users[Math.floor(Math.random() * this.users.length)];
                const oldStatus = user.status;
                user.status = Math.random() > 0.5 ? 'online' : 'away';
                
                if (oldStatus !== user.status) {
                    this.updateUsersList();
                    this.addSystemMessage(`${user.username} теперь ${user.status === 'online' ? 'в сети' : 'отошел'}`);
                }
            }
        }, 10000);
        
        // Имитация новых пользователей
        setInterval(() => {
            if (Math.random() > 0.8 && this.users.length < 15) {
                const names = ['Smith', 'Persephone', 'Merovingian', 'Seraph', 'Niobe'];
                const name = names[Math.floor(Math.random() * names.length)];
                const newUser = {
                    id: Date.now().toString(),
                    username: name,
                    status: 'online',
                    avatar: name[0]
                };
                
                this.users.push(newUser);
                this.updateUsersList();
                this.addSystemMessage(`${name} присоединился к чату`);
            }
        }, 15000);
    }

    simulateResponse() {
        if (Math.random() > 0.3) return;
        
        const bots = this.users.filter(u => 
            ['Neo', 'Trinity', 'Oracle'].includes(u.username) && 
            u.status === 'online'
        );
        
        if (bots.length === 0) return;
        
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const responses = [
            'Интересная мысль...',
            'Продолжай в том же духе!',
            'А что думают другие?',
            'Ты на верном пути.',
            'Давайте обсудим это подробнее.',
            'Согласен с тобой.',
            'Есть над чем подумать...'
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        const message = {
            id: Date.now().toString(),
            userId: bot.id,
            username: bot.username,
            text: response,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        
        this.messageCount++;
        window.cyberChat.updateMessageCount(this.messageCount);
    }

    startConnectionSimulation() {
        // Имитация подключения
        setTimeout(() => {
            if (!window.authManager.isAuthenticated) {
                window.cyberChat.updateConnectionStatus('ОЖИДАНИЕ ВХОДА');
            }
        }, 2000);
    }
}

// Стили для сообщений и статусов
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .user-info-display {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--cyber-primary);
    }
    
    .user-avatar-small {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(45deg, var(--cyber-primary), var(--cyber-secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: var(--cyber-dark);
    }
    
    .username {
        font-weight: bold;
        color: var(--cyber-primary);
    }
    
    .logout-btn {
        padding: 0.5rem;
        min-width: auto;
        background: rgba(255, 0, 85, 0.2);
        border-color: var(--cyber-accent);
    }
    
    .logout-btn:hover {
        background: var(--cyber-accent);
    }
    
    .message.current-user .message-content {
        background: rgba(0, 255, 157, 0.2);
        border-left-color: var(--cyber-primary);
    }
    
    .message.current-user .message-username {
        color: var(--cyber-accent);
    }
    
    .user-badge {
        background: var(--cyber-accent);
        color: var(--cyber-dark);
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-weight: bold;
    }
    
    .status-online { color: var(--cyber-primary); }
    .status-away { color: #ffaa00; }
    .status-offline { color: #666; }
    
    .panel-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .stat {
        background: rgba(255, 255, 255, 0.05);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--cyber-primary);
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat i {
        font-size: 2rem;
        color: var(--cyber-primary);
    }
    
    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--cyber-primary);
        font-family: 'Orbitron', sans-serif;
    }
    
    .stat-label {
        font-size: 0.8rem;
        color: var(--cyber-light);
        opacity: 0.8;
    }
`;

document.head.appendChild(chatStyles);

// Инициализация менеджера чата
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});