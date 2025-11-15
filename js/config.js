/**
 * Configurações da Aplicação
 */

const CONFIG = {
    // URL base da API
    API_URL: './api',

    // Coordenadas iniciais do mapa (São Paulo - altere conforme necessário)
    DEFAULT_LAT: -23.5505,
    DEFAULT_LNG: -46.6333,
    DEFAULT_ZOOM: 15,

    // Raio de proximidade para chat (km)
    CHAT_RADIUS: 3,

    // Raio de proximidade para notificações (km)
    NOTIFICATION_RADIUS: 1,

    // Intervalo de atualização do chat (ms)
    CHAT_UPDATE_INTERVAL: 10000, // 10 segundos

    // Intervalo de verificação de notificações (ms)
    NOTIFICATION_CHECK_INTERVAL: 30000, // 30 segundos

    // Intervalo de atualização dos posts (ms)
    POSTS_UPDATE_INTERVAL: 60000, // 1 minuto

    // Configurações de cores das categorias
    CATEGORY_COLORS: {
        fofoca: '#ec4899',
        alerta: '#ef4444',
        evento: '#8b5cf6',
        achados: '#3b82f6'
    },

    // Ícones das categorias
    CATEGORY_ICONS: {
        fofoca: 'fa-comments',
        alerta: 'fa-exclamation-triangle',
        evento: 'fa-calendar-alt',
        achados: 'fa-search'
    },

    // Labels das categorias
    CATEGORY_LABELS: {
        fofoca: 'Fofoca',
        alerta: 'Alerta',
        evento: 'Evento',
        achados: 'Achados/Perdidos'
    },

    // Configurações do localStorage
    STORAGE_KEYS: {
        USER_LOCATION: 'radar_user_location',
        LAST_NOTIFICATION_CHECK: 'radar_last_notification',
        FILTERS: 'radar_filters',
        VIEWED_POSTS: 'radar_viewed_posts'
    }
};

// Função auxiliar para obter cor da categoria
function getCategoryColor(category) {
    return CONFIG.CATEGORY_COLORS[category] || '#6366f1';
}

// Função auxiliar para obter ícone da categoria
function getCategoryIcon(category) {
    return CONFIG.CATEGORY_ICONS[category] || 'fa-map-marker-alt';
}

// Função auxiliar para obter label da categoria
function getCategoryLabel(category) {
    return CONFIG.CATEGORY_LABELS[category] || category;
}
