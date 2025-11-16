/**
 * Aplicação Principal - Radar do Bairro
 */

// Gerenciador de Posts Quentes
const HotPostsManager = {
    /**
     * Inicializar
     */
    init() {
        this.loadHotPosts();

        // Atualizar periodicamente
        setInterval(() => {
            this.loadHotPosts();
        }, CONFIG.POSTS_UPDATE_INTERVAL);
    },

    /**
     * Carregar posts mais quentes
     */
    async loadHotPosts() {
        try {
            const lat = MapManager.userLocation?.lat;
            const lng = MapManager.userLocation?.lng;

            const response = await API.hotPosts.get(10, lat, lng);

            if (response.success) {
                this.renderHotPosts(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar posts quentes:', error);
        }
    },

    /**
     * Renderizar posts quentes
     */
    renderHotPosts(posts) {
        const container = document.getElementById('hotPosts');

        if (posts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #9ca3af; padding: 1rem;">
                    <i class="fas fa-fire" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                    <p style="font-size: 0.9rem;">Nenhum post quente ainda</p>
                </div>
            `;
            return;
        }

        let html = '';
        posts.forEach((post, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

            html += `
                <div class="hot-post-item ${post.category}" onclick="PostsManager.showPostDetails(${post.id})">
                    <div style="display: flex; align-items: start; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">${medal}</span>
                        <div style="flex: 1;">
                            <div class="hot-post-title">${post.title}</div>
                            <div class="hot-post-stats">
                                <span><i class="fas fa-fire"></i> ${post.hotness_score}</span>
                                <span><i class="fas fa-thumbs-up"></i> ${post.vote_count}</span>
                                <span><i class="fas fa-eye"></i> ${post.view_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

// Funções auxiliares globais
/**
 * Mostrar toast de notificação
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Abrir modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';

    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    };
}

/**
 * Fechar modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';

    // Se for o modal de novo post, limpar marcador temporário
    if (modalId === 'modalNewPost') {
        MapManager.clearTempMarker();
    }
}

/**
 * Configurar event listeners de modais
 */
function setupModals() {
    // Botão novo post
    document.getElementById('btnNewPost').addEventListener('click', () => {
        openModal('modalNewPost');
        // Ativar modo de seleção de localização
        MapManager.enableLocationSelection();
    });

    // Botões de fechar (X)
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.style.display = 'none';

            // Se for o modal de novo post, limpar marcador temporário
            if (modal.id === 'modalNewPost') {
                MapManager.clearTempMarker();
            }
        });
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';

                    if (modal.id === 'modalNewPost') {
                        MapManager.clearTempMarker();
                    }
                }
            });
        }
    });
}

/**
 * Inicializar aplicação
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Radar do Bairro...');
    console.log('📍 API URL:', CONFIG.API_URL);
    console.log('🗺️ Localização padrão:', { lat: CONFIG.DEFAULT_LAT, lng: CONFIG.DEFAULT_LNG });

    // Configurar modais
    console.log('⚙️ Configurando modais...');
    setupModals();

    // Inicializar módulos
    console.log('🗺️ Inicializando mapa...');
    MapManager.init();

    console.log('📝 Inicializando posts...');
    PostsManager.init();

    console.log('💬 Inicializando chat...');
    ChatManager.init();

    console.log('🔔 Inicializando notificações...');
    NotificationsManager.init();

    console.log('🔥 Inicializando posts quentes...');
    HotPostsManager.init();

    console.log('✅ Aplicação iniciada com sucesso!');
    console.log('📊 Todos os módulos carregados e prontos para uso');

    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        showToast('Bem-vindo ao Radar do Bairro! 🎉', 'success');
    }, 1000);
});

/**
 * Tratamento de erros global
 */
window.addEventListener('error', (event) => {
    console.error('Erro global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada:', event.reason);
});
