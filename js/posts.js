/**
 * Gerenciamento de Posts
 */

const PostsManager = {
    currentPosts: [],
    currentFilters: null,

    /**
     * Inicializar
     */
    init() {
        // Carregar filtros salvos
        this.currentFilters = Storage.getFilters();
        this.applyFiltersToUI();

        // Carregar posts iniciais
        this.loadPosts();

        // Configurar atualização automática
        setInterval(() => {
            this.loadPosts();
        }, CONFIG.POSTS_UPDATE_INTERVAL);

        // Event listeners
        this.setupEventListeners();
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botão aplicar filtros
        document.getElementById('btnApplyFilters').addEventListener('click', () => {
            this.updateFiltersFromUI();
            this.loadPosts();
        });

        // Formulário de novo post
        document.getElementById('formNewPost').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPost();
        });

        // Contador de caracteres
        document.getElementById('postDescription').addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('charCount').textContent = `${count}/500 caracteres`;
        });
    },

    /**
     * Aplicar filtros salvos na UI
     */
    applyFiltersToUI() {
        // Checkboxes de categoria
        document.querySelectorAll('.filter-category').forEach(checkbox => {
            checkbox.checked = this.currentFilters.categories.includes(checkbox.value);
        });

        // Select de tempo
        document.getElementById('filterTime').value = this.currentFilters.time;
    },

    /**
     * Atualizar filtros da UI
     */
    updateFiltersFromUI() {
        const categories = [];
        document.querySelectorAll('.filter-category:checked').forEach(checkbox => {
            categories.push(checkbox.value);
        });

        const time = document.getElementById('filterTime').value;

        this.currentFilters = { categories, time };
        Storage.saveFilters(this.currentFilters);
    },

    /**
     * Carregar posts
     */
    async loadPosts() {
        try {
            const filters = {
                ...this.currentFilters,
                lat: MapManager.userLocation?.lat,
                lng: MapManager.userLocation?.lng
            };

            const response = await API.posts.list(filters);

            if (response.success) {
                this.currentPosts = response.data;
                MapManager.addPosts(this.currentPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
    },

    /**
     * Criar novo post
     */
    async createPost() {
        try {
            const category = document.getElementById('postCategory').value;
            const title = document.getElementById('postTitle').value;
            const description = document.getElementById('postDescription').value;
            const latitude = parseFloat(document.getElementById('postLat').value);
            const longitude = parseFloat(document.getElementById('postLng').value);

            if (!latitude || !longitude) {
                showToast('Selecione uma localização no mapa', 'error');
                return;
            }

            const postData = {
                category,
                title,
                description,
                latitude,
                longitude
            };

            const response = await API.posts.create(postData);

            if (response.success) {
                showToast(response.message || 'Post criado com sucesso!', 'success');

                // Fechar modal
                closeModal('modalNewPost');

                // Limpar formulário
                document.getElementById('formNewPost').reset();
                document.getElementById('charCount').textContent = '0/500 caracteres';
                document.getElementById('postLocation').innerHTML = '<i class="fas fa-crosshairs"></i> Clique no mapa para selecionar';
                document.getElementById('postLocation').classList.remove('selected');

                // Limpar marcador temporário
                MapManager.clearTempMarker();

                // Recarregar posts
                this.loadPosts();
            }
        } catch (error) {
            showToast(error.message || 'Erro ao criar post', 'error');
        }
    },

    /**
     * Mostrar detalhes do post
     */
    async showPostDetails(postId) {
        try {
            const post = this.currentPosts.find(p => p.id === postId);
            if (!post) return;

            // Buscar votos
            const votesResponse = await API.votes.get(postId);
            const votes = votesResponse.data;

            // Criar conteúdo do modal
            const content = `
                <div class="post-details-header">
                    <div>
                        <div class="post-details-category category-badge ${post.category}">
                            <i class="fas ${getCategoryIcon(post.category)}"></i>
                            ${getCategoryLabel(post.category)}
                        </div>
                    </div>
                </div>
                <h2 class="post-details-title">${post.title}</h2>
                <div class="post-details-time">
                    <i class="fas fa-clock"></i> ${post.time_ago}
                    ${post.distance ? ` • <i class="fas fa-map-marker-alt"></i> ${post.distance.toFixed(2)} km` : ''}
                </div>
                <div class="post-details-description">${post.description}</div>

                <h3 style="margin-top: 2rem; margin-bottom: 1rem;">
                    <i class="fas fa-poll"></i> O que você acha?
                </h3>
                <div class="post-details-votes">
                    <div class="vote-option vote-true ${votes.user_vote === 'true' ? 'selected' : ''}"
                         onclick="PostsManager.vote(${postId}, 'true')">
                        <div class="vote-icon">✓</div>
                        <div class="vote-label">Verdadeiro</div>
                        <div class="vote-count">${votes.true_votes} votos</div>
                    </div>
                    <div class="vote-option vote-false ${votes.user_vote === 'false' ? 'selected' : ''}"
                         onclick="PostsManager.vote(${postId}, 'false')">
                        <div class="vote-icon">✗</div>
                        <div class="vote-label">Falso</div>
                        <div class="vote-count">${votes.false_votes} votos</div>
                    </div>
                    <div class="vote-option vote-exag ${votes.user_vote === 'exag' ? 'selected' : ''}"
                         onclick="PostsManager.vote(${postId}, 'exag')">
                        <div class="vote-icon">!</div>
                        <div class="vote-label">Exagero</div>
                        <div class="vote-count">${votes.exag_votes} votos</div>
                    </div>
                </div>

                <div class="post-details-stats">
                    <div class="stat-item">
                        <span class="stat-value">${votes.total_votes}</span>
                        <span class="stat-label">Total de Votos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${post.vote_count || 0}</span>
                        <span class="stat-label">Engajamento</span>
                    </div>
                </div>
            `;

            document.getElementById('postDetailsContent').innerHTML = content;
            openModal('modalPostDetails');

            // Centralizar mapa no post
            MapManager.focusOnPost(post.latitude, post.longitude);

        } catch (error) {
            console.error('Erro ao mostrar detalhes:', error);
            showToast('Erro ao carregar detalhes do post', 'error');
        }
    },

    /**
     * Votar em um post
     */
    async vote(postId, voteType) {
        try {
            const response = await API.votes.vote(postId, voteType);

            if (response.success) {
                showToast('Voto registrado!', 'success');

                // Recarregar detalhes
                setTimeout(() => {
                    this.showPostDetails(postId);
                }, 500);
            }
        } catch (error) {
            showToast(error.message || 'Erro ao votar', 'error');
        }
    }
};
