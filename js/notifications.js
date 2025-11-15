/**
 * Sistema de Notificações
 */

const NotificationsManager = {
    unreadCount: 0,
    newPosts: [],

    /**
     * Inicializar
     */
    init() {
        // Verificar notificações periodicamente
        setInterval(() => {
            this.checkNotifications();
        }, CONFIG.NOTIFICATION_CHECK_INTERVAL);

        // Verificar imediatamente após alguns segundos
        setTimeout(() => {
            this.checkNotifications();
        }, 5000);

        // Event listener para o badge de notificações
        document.getElementById('notificationsBadge').addEventListener('click', () => {
            this.showNotifications();
        });
    },

    /**
     * Verificar novas notificações
     */
    async checkNotifications() {
        try {
            if (!MapManager.userLocation) return;

            const { lat, lng } = MapManager.userLocation;
            const lastCheck = Storage.getLastNotificationCheck();

            const response = await API.notifications.check(lat, lng, lastCheck);

            if (response.success) {
                const { count, posts } = response.data;

                if (count > 0) {
                    this.unreadCount += count;
                    this.newPosts = [...posts, ...this.newPosts];
                    this.updateBadge();

                    // Mostrar toast
                    showToast(`${count} novo${count > 1 ? 's' : ''} acontecimento${count > 1 ? 's' : ''} perto de você!`, 'info');
                }

                // Atualizar timestamp da última verificação
                Storage.saveLastNotificationCheck();
            }
        } catch (error) {
            console.error('Erro ao verificar notificações:', error);
        }
    },

    /**
     * Atualizar badge de notificações
     */
    updateBadge() {
        const badge = document.getElementById('notificationsBadge');
        const countElement = document.getElementById('notificationsCount');

        if (this.unreadCount > 0) {
            badge.style.display = 'flex';
            countElement.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        } else {
            badge.style.display = 'none';
        }
    },

    /**
     * Mostrar notificações
     */
    showNotifications() {
        if (this.newPosts.length === 0) {
            showToast('Nenhuma notificação nova', 'info');
            return;
        }

        // Criar lista de notificações
        let content = '<h2><i class="fas fa-bell"></i> Novas Notificações</h2>';
        content += '<div style="max-height: 400px; overflow-y: auto;">';

        this.newPosts.slice(0, 10).forEach(post => {
            const categoryColor = getCategoryColor(post.category);
            content += `
                <div style="padding: 1rem; margin: 0.5rem 0; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${categoryColor}; cursor: pointer;"
                     onclick="NotificationsManager.openPost(${post.id})">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <span class="category-badge ${post.category}" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">
                            ${getCategoryLabel(post.category)}
                        </span>
                        <span style="font-size: 0.85rem; color: #6b7280;">
                            ${post.distance} km • ${post.time_ago}
                        </span>
                    </div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${post.title}</div>
                    <div style="font-size: 0.9rem; color: #4b5563;">
                        ${post.description.substring(0, 80)}${post.description.length > 80 ? '...' : ''}
                    </div>
                </div>
            `;
        });

        content += '</div>';

        if (this.newPosts.length > 10) {
            content += `<p style="text-align: center; color: #6b7280; margin-top: 1rem;">E mais ${this.newPosts.length - 10} notificações...</p>`;
        }

        document.getElementById('postDetailsContent').innerHTML = content;
        openModal('modalPostDetails');

        // Limpar notificações
        this.unreadCount = 0;
        this.updateBadge();
    },

    /**
     * Abrir post da notificação
     */
    openPost(postId) {
        closeModal('modalPostDetails');

        // Remover post das notificações
        this.newPosts = this.newPosts.filter(p => p.id !== postId);

        // Mostrar detalhes do post
        setTimeout(() => {
            PostsManager.showPostDetails(postId);
        }, 300);
    }
};
