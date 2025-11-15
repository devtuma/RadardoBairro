/**
 * Comunicação com API Backend
 */

const API = {
    /**
     * Fazer requisição HTTP
     */
    async request(endpoint, options = {}) {
        try {
            const url = `${CONFIG.API_URL}/${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    },

    /**
     * Posts
     */
    posts: {
        // Listar posts com filtros
        async list(filters = {}) {
            const params = new URLSearchParams();

            if (filters.categories && filters.categories.length > 0) {
                params.append('categories', filters.categories.join(','));
            }

            if (filters.time) {
                params.append('time', filters.time);
            }

            if (filters.lat && filters.lng) {
                params.append('lat', filters.lat);
                params.append('lng', filters.lng);
            }

            if (filters.radius) {
                params.append('radius', filters.radius);
            }

            return await API.request(`posts.php?${params.toString()}`);
        },

        // Criar novo post
        async create(postData) {
            return await API.request('posts.php', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        },

        // Deletar post
        async delete(postId) {
            return await API.request(`posts.php?id=${postId}`, {
                method: 'DELETE'
            });
        }
    },

    /**
     * Votos
     */
    votes: {
        // Obter votos de um post
        async get(postId) {
            return await API.request(`votes.php?post_id=${postId}`);
        },

        // Adicionar/atualizar voto
        async vote(postId, voteType) {
            return await API.request('votes.php', {
                method: 'POST',
                body: JSON.stringify({
                    post_id: postId,
                    vote_type: voteType
                })
            });
        }
    },

    /**
     * Chat
     */
    chat: {
        // Buscar mensagens do chat
        async getMessages(lat, lng, radius = CONFIG.CHAT_RADIUS) {
            return await API.request(`chat.php?lat=${lat}&lng=${lng}&radius=${radius}`);
        },

        // Enviar mensagem
        async sendMessage(message, lat, lng) {
            return await API.request('chat.php', {
                method: 'POST',
                body: JSON.stringify({
                    message: message,
                    latitude: lat,
                    longitude: lng
                })
            });
        }
    },

    /**
     * Posts quentes
     */
    hotPosts: {
        // Buscar posts mais quentes
        async get(limit = 10, lat = null, lng = null) {
            let url = `hot-posts.php?limit=${limit}`;
            if (lat && lng) {
                url += `&lat=${lat}&lng=${lng}`;
            }
            return await API.request(url);
        },

        // Registrar visualização
        async recordView(postId) {
            return await API.request('hot-posts.php', {
                method: 'POST',
                body: JSON.stringify({ post_id: postId })
            });
        }
    },

    /**
     * Notificações
     */
    notifications: {
        // Buscar novos posts próximos
        async check(lat, lng, since = null, radius = CONFIG.NOTIFICATION_RADIUS) {
            let url = `notifications.php?lat=${lat}&lng=${lng}&radius=${radius}`;
            if (since) {
                url += `&since=${encodeURIComponent(since)}`;
            }
            return await API.request(url);
        }
    },

    /**
     * Comentários de posts
     */
    postComments: {
        // Buscar comentários de um post
        async get(postId, limit = 100) {
            return await API.request(`post-comments.php?post_id=${postId}&limit=${limit}`);
        },

        // Adicionar comentário
        async add(postId, message) {
            return await API.request('post-comments.php', {
                method: 'POST',
                body: JSON.stringify({
                    post_id: postId,
                    message: message
                })
            });
        },

        // Deletar comentário
        async delete(commentId) {
            return await API.request(`post-comments.php?id=${commentId}`, {
                method: 'DELETE'
            });
        }
    },

    /**
     * Reportar abuso
     */
    reports: {
        // Reportar um item
        async report(reportType, itemId, reason) {
            return await API.request('reports.php', {
                method: 'POST',
                body: JSON.stringify({
                    report_type: reportType,
                    item_id: itemId,
                    reason: reason
                })
            });
        },

        // Obter contagem de reports
        async getCount(reportType, itemId) {
            return await API.request(`reports.php?report_type=${reportType}&item_id=${itemId}`);
        }
    }
};
