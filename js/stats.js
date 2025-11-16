/**
 * Gerenciamento de Estatísticas do Bairro
 */

const StatsManager = {
    /**
     * Mostrar estatísticas
     */
    async showStats() {
        try {
            const lat = MapManager.userLocation?.lat;
            const lng = MapManager.userLocation?.lng;

            let url = `${CONFIG.API_URL}/stats.php`;
            if (lat && lng) {
                url += `?lat=${lat}&lng=${lng}&radius=5`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.renderStats(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            showToast('Erro ao carregar estatísticas', 'error');
        }
    },

    /**
     * Renderizar estatísticas
     */
    renderStats(stats) {
        const content = `
            <h2><i class="fas fa-chart-bar"></i> Estatísticas do Bairro</h2>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-icon" style="background: var(--primary-color);">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.total_posts}</div>
                        <div class="stat-card-label">Posts Ativos</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-icon" style="background: var(--success-color);">
                        <i class="fas fa-thumbs-up"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.total_votes}</div>
                        <div class="stat-card-label">Total de Votos</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-icon" style="background: var(--info-color);">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.total_comments}</div>
                        <div class="stat-card-label">Comentários</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-icon" style="background: var(--warning-color);">
                        <i class="fas fa-comment-dots"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.chat_messages_24h}</div>
                        <div class="stat-card-label">Mensagens 24h</div>
                    </div>
                </div>
            </div>

            ${stats.nearby_posts !== undefined ? `
                <div class="stats-section">
                    <h3><i class="fas fa-map-marker"></i> Na sua região (5km)</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-card-content">
                                <div class="stat-card-value">${stats.nearby_posts}</div>
                                <div class="stat-card-label">Posts Próximos</div>
                            </div>
                        </div>
                        ${stats.top_category_nearby ? `
                            <div class="stat-card">
                                <div class="stat-card-content">
                                    <div class="stat-card-value">${getCategoryLabel(stats.top_category_nearby)}</div>
                                    <div class="stat-card-label">Categoria Mais Comum</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <div class="stats-section">
                <h3><i class="fas fa-calendar"></i> Atividade Recente</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-content">
                            <div class="stat-card-value">${stats.posts_24h}</div>
                            <div class="stat-card-label">Últimas 24h</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-content">
                            <div class="stat-card-value">${stats.posts_7d}</div>
                            <div class="stat-card-label">Últimos 7 dias</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-content">
                            <div class="stat-card-value">${stats.posts_30d}</div>
                            <div class="stat-card-label">Últimos 30 dias</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-section">
                <h3><i class="fas fa-chart-pie"></i> Posts por Categoria</h3>
                <div class="category-stats">
                    ${stats.posts_by_category.map(cat => `
                        <div class="category-stat-item">
                            <span class="category-badge ${cat.category}">
                                <i class="fas ${getCategoryIcon(cat.category)}"></i>
                                ${getCategoryLabel(cat.category)}
                            </span>
                            <span class="category-stat-count">${cat.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="stats-section">
                <h3><i class="fas fa-trophy"></i> Top 5 Posts Mais Votados</h3>
                <div class="top-posts-list">
                    ${stats.top_posts.map((post, index) => `
                        <div class="top-post-item" onclick="closeModal('modalPostDetails'); setTimeout(() => PostsManager.showPostDetails(${post.id}), 300);">
                            <span class="top-post-rank">${index + 1}</span>
                            <span class="top-post-title">${post.title}</span>
                            <span class="top-post-votes">${post.votes} votos</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="stats-section">
                <h3><i class="fas fa-chart-line"></i> Médias</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-content">
                            <div class="stat-card-value">${stats.avg_votes_per_post}</div>
                            <div class="stat-card-label">Votos por Post</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-content">
                            <div class="stat-card-value">${stats.avg_comments_per_post}</div>
                            <div class="stat-card-label">Comentários por Post</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('postDetailsContent').innerHTML = content;
        openModal('modalPostDetails');
    }
};
