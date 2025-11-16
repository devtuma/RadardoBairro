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

        // Upload de imagem
        document.getElementById('postImage').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
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
     * Fazer upload de imagem
     */
    async handleImageUpload(file) {
        if (!file) return;

        // Validações
        if (!file.type.startsWith('image/')) {
            showToast('Por favor, selecione uma imagem válida', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Imagem muito grande. Tamanho máximo: 5MB', 'error');
            return;
        }

        try {
            showToast('Fazendo upload da imagem...', 'info');

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${CONFIG.API_URL}/upload.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('postImageUrl').value = data.data.url;
                document.getElementById('imagePreviewImg').src = data.data.url;
                document.getElementById('imagePreview').style.display = 'block';
                document.querySelector('.btn-upload').style.display = 'none';
                showToast('Imagem enviada com sucesso!', 'success');
            } else {
                throw new Error(data.error || 'Erro no upload');
            }
        } catch (error) {
            showToast(error.message || 'Erro ao fazer upload da imagem', 'error');
        }
    },

    /**
     * Remover imagem
     */
    removeImage() {
        document.getElementById('postImage').value = '';
        document.getElementById('postImageUrl').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        document.querySelector('.btn-upload').style.display = 'block';
    },

    /**
     * Criar novo post
     */
    async createPost() {
        try {
            const category = document.getElementById('postCategory').value;
            const title = document.getElementById('postTitle').value;
            const description = document.getElementById('postDescription').value;
            const imageUrl = document.getElementById('postImageUrl').value;
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
                image_url: imageUrl,
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
                this.removeImage();

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
            console.log('📖 Abrindo detalhes do post:', postId);
            const post = this.currentPosts.find(p => p.id === postId);
            if (!post) {
                console.error('❌ Post não encontrado:', postId);
                return;
            }

            // Buscar votos
            console.log('🗳️ Buscando votos do post:', postId);
            const votesResponse = await API.votes.get(postId);
            const votes = votesResponse.data;
            console.log('✅ Votos carregados:', votes);

            // Buscar comentários
            console.log('💬 Buscando comentários do post:', postId);
            const commentsResponse = await API.postComments.get(postId);
            console.log('📦 Resposta da API de comentários:', commentsResponse);
            const comments = commentsResponse.data.comments || [];
            const commentCount = comments.length;
            console.log(`✅ ${commentCount} comentários carregados`);

            // Criar conteúdo do modal
            const content = `
                <div class="post-details-header">
                    <div>
                        <div class="post-details-category category-badge ${post.category}">
                            <i class="fas ${getCategoryIcon(post.category)}"></i>
                            ${getCategoryLabel(post.category)}
                        </div>
                    </div>
                    <button class="btn-report" onclick="PostsManager.reportPost(${postId})" title="Reportar post">
                        <i class="fas fa-flag"></i>
                    </button>
                </div>
                <h2 class="post-details-title">${post.title}</h2>
                <div class="post-details-time">
                    <i class="fas fa-clock"></i> ${post.time_ago}
                    ${post.distance ? ` • <i class="fas fa-map-marker-alt"></i> ${post.distance.toFixed(2)} km` : ''}
                </div>
                ${post.image_url ? `<div class="post-image"><img src="${post.image_url}" alt="${post.title}"></div>` : ''}
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
                        <span class="stat-value">${commentCount}</span>
                        <span class="stat-label">Comentários</span>
                    </div>
                </div>

                <div class="share-section">
                    <h4><i class="fas fa-share-alt"></i> Compartilhar</h4>
                    <div class="share-buttons-container">
                        <button class="btn-share btn-share-whatsapp" onclick="PostsManager.sharePost(${postId}, 'whatsapp')" title="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button class="btn-share btn-share-twitter" onclick="PostsManager.sharePost(${postId}, 'twitter')" title="Twitter">
                            <i class="fab fa-twitter"></i>
                        </button>
                        <button class="btn-share btn-share-facebook" onclick="PostsManager.sharePost(${postId}, 'facebook')" title="Facebook">
                            <i class="fab fa-facebook"></i>
                        </button>
                        <button class="btn-share btn-share-telegram" onclick="PostsManager.sharePost(${postId}, 'telegram')" title="Telegram">
                            <i class="fab fa-telegram"></i>
                        </button>
                        <button class="btn-share btn-share-copy" onclick="PostsManager.sharePost(${postId}, 'copy')" title="Copiar link">
                            <i class="fas fa-link"></i>
                        </button>
                    </div>
                </div>

                <h3 style="margin-top: 2rem; margin-bottom: 1rem;">
                    <i class="fas fa-comments"></i> Comentários (${commentCount})
                </h3>
                <div class="post-comments" id="postComments">
                    ${this.renderComments(comments, postId)}
                </div>
                <div class="comment-input-container">
                    <textarea id="commentInput" placeholder="Escreva um comentário..." maxlength="500" rows="2"></textarea>
                    <button class="btn-comment" onclick="PostsManager.addComment(${postId})">
                        <i class="fas fa-paper-plane"></i> Comentar
                    </button>
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
     * Renderizar comentários
     */
    renderComments(comments, postId) {
        if (comments.length === 0) {
            return '<p style="text-align: center; color: #9ca3af; padding: 2rem;">Seja o primeiro a comentar!</p>';
        }

        let html = '';
        comments.forEach(comment => {
            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span><i class="fas fa-user-secret"></i> Anônimo</span>
                        <span class="comment-time">${comment.time_ago}</span>
                        <button class="btn-report-small" onclick="PostsManager.reportComment(${comment.id})" title="Reportar comentário">
                            <i class="fas fa-flag"></i>
                        </button>
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.message)}</div>
                </div>
            `;
        });
        return html;
    },

    /**
     * Adicionar comentário
     */
    async addComment(postId) {
        try {
            const input = document.getElementById('commentInput');
            const message = input.value.trim();

            if (!message) {
                showToast('Digite um comentário', 'error');
                return;
            }

            if (message.length > 500) {
                showToast('Comentário muito longo (máximo 500 caracteres)', 'error');
                return;
            }

            const response = await API.postComments.add(postId, message);

            if (response.success) {
                input.value = '';
                showToast('Comentário enviado!', 'success');

                // Recarregar detalhes do post
                await this.showPostDetails(postId);
            }
        } catch (error) {
            showToast(error.message || 'Erro ao enviar comentário', 'error');
        }
    },

    /**
     * Reportar post
     */
    async reportPost(postId) {
        const reason = await this.showReportDialog();
        if (!reason) return;

        try {
            const response = await API.reports.report('post', postId, reason);

            if (response.success) {
                showToast(response.message, 'success');
            }
        } catch (error) {
            showToast(error.message || 'Erro ao reportar post', 'error');
        }
    },

    /**
     * Reportar comentário
     */
    async reportComment(commentId) {
        const reason = await this.showReportDialog();
        if (!reason) return;

        try {
            const response = await API.reports.report('comment', commentId, reason);

            if (response.success) {
                showToast(response.message, 'success');
            }
        } catch (error) {
            showToast(error.message || 'Erro ao reportar comentário', 'error');
        }
    },

    /**
     * Mostrar diálogo de report
     */
    showReportDialog() {
        return new Promise((resolve) => {
            const reasons = {
                'spam': 'Spam',
                'offensive': 'Ofensivo',
                'inappropriate': 'Inapropriado',
                'fake': 'Informação falsa',
                'other': 'Outro'
            };

            let options = '';
            for (const [key, label] of Object.entries(reasons)) {
                options += `<option value="${key}">${label}</option>`;
            }

            const content = `
                <h2><i class="fas fa-flag"></i> Reportar Abuso</h2>
                <p>Selecione o motivo da denúncia:</p>
                <select id="reportReason" class="filter-select" style="margin-bottom: 1.5rem;">
                    ${options}
                </select>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn-submit" onclick="PostsManager.confirmReport()" style="flex: 1;">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                    <button class="btn-filter" onclick="PostsManager.cancelReport()" style="flex: 1; background: #6b7280;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            `;

            document.getElementById('postDetailsContent').innerHTML = content;

            this.reportResolve = resolve;
        });
    },

    confirmReport() {
        const reason = document.getElementById('reportReason').value;
        if (this.reportResolve) {
            this.reportResolve(reason);
            this.reportResolve = null;
        }
    },

    cancelReport() {
        if (this.reportResolve) {
            this.reportResolve(null);
            this.reportResolve = null;
        }
        closeModal('modalPostDetails');
    },

    /**
     * Escapar HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    },

    /**
     * Compartilhar post em redes sociais
     */
    sharePost(postId, platform) {
        const post = this.currentPosts.find(p => p.id === postId);
        if (!post) return;

        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);
        const text = encodeURIComponent(`${post.title} - ${post.description.substring(0, 100)}...`);

        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        showToast('Link copiado para a área de transferência!', 'success');
                    })
                    .catch(() => {
                        showToast('Erro ao copiar link', 'error');
                    });
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
};
