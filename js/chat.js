/**
 * Gerenciamento do Chat Anônimo
 */

const ChatManager = {
    messages: [],

    /**
     * Inicializar
     */
    init() {
        // Carregar mensagens iniciais
        this.loadMessages();

        // Configurar atualização automática
        setInterval(() => {
            this.loadMessages();
        }, CONFIG.CHAT_UPDATE_INTERVAL);

        // Event listener para enviar mensagem
        document.getElementById('btnSendChat').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enviar com Enter
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    },

    /**
     * Carregar mensagens do chat
     */
    async loadMessages() {
        try {
            if (!MapManager.userLocation) return;

            const { lat, lng } = MapManager.userLocation;
            const response = await API.chat.getMessages(lat, lng);

            if (response.success) {
                this.messages = response.data;
                this.renderMessages();
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens do chat:', error);
        }
    },

    /**
     * Renderizar mensagens
     */
    renderMessages() {
        const container = document.getElementById('chatMessages');

        if (this.messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #9ca3af; padding: 2rem;">
                    <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Nenhuma mensagem por perto ainda.</p>
                    <p style="font-size: 0.85rem;">Seja o primeiro a conversar!</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.messages.forEach(msg => {
            html += `
                <div class="chat-message">
                    <div class="chat-message-header">
                        <span><i class="fas fa-user-secret"></i> Anônimo</span>
                        <span>${msg.time_ago} • ${msg.distance} km</span>
                    </div>
                    <div class="chat-message-text">${this.escapeHtml(msg.message)}</div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Auto-scroll para o fim
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Enviar mensagem
     */
    async sendMessage() {
        try {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();

            if (!message) {
                return;
            }

            if (message.length > 200) {
                showToast('Mensagem muito longa (máximo 200 caracteres)', 'error');
                return;
            }

            if (!MapManager.userLocation) {
                showToast('Localização não disponível', 'error');
                return;
            }

            const { lat, lng } = MapManager.userLocation;
            const response = await API.chat.sendMessage(message, lat, lng);

            if (response.success) {
                input.value = '';

                // Recarregar mensagens
                await this.loadMessages();
            }
        } catch (error) {
            showToast(error.message || 'Erro ao enviar mensagem', 'error');
        }
    },

    /**
     * Escapar HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
