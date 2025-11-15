/**
 * Gerenciamento de localStorage
 */

const Storage = {
    /**
     * Salvar localização do usuário
     */
    saveUserLocation(lat, lng) {
        const location = { lat, lng, timestamp: Date.now() };
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
    },

    /**
     * Obter localização do usuário
     */
    getUserLocation() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_LOCATION);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Salvar último timestamp de verificação de notificações
     */
    saveLastNotificationCheck() {
        const timestamp = new Date().toISOString();
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_NOTIFICATION_CHECK, timestamp);
    },

    /**
     * Obter último timestamp de verificação de notificações
     */
    getLastNotificationCheck() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_NOTIFICATION_CHECK);
    },

    /**
     * Salvar filtros selecionados
     */
    saveFilters(filters) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FILTERS, JSON.stringify(filters));
    },

    /**
     * Obter filtros salvos
     */
    getFilters() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.FILTERS);
        return data ? JSON.parse(data) : {
            categories: ['fofoca', 'alerta', 'evento', 'achados'],
            time: '24h'
        };
    },

    /**
     * Adicionar post visualizado
     */
    addViewedPost(postId) {
        const viewed = this.getViewedPosts();
        if (!viewed.includes(postId)) {
            viewed.push(postId);
            // Manter apenas os últimos 100 posts visualizados
            if (viewed.length > 100) {
                viewed.shift();
            }
            localStorage.setItem(CONFIG.STORAGE_KEYS.VIEWED_POSTS, JSON.stringify(viewed));
        }
    },

    /**
     * Obter posts visualizados
     */
    getViewedPosts() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.VIEWED_POSTS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Verificar se post foi visualizado
     */
    hasViewedPost(postId) {
        return this.getViewedPosts().includes(postId);
    },

    /**
     * Limpar todos os dados
     */
    clearAll() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};
