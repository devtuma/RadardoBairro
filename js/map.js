/**
 * Gerenciamento do Mapa Leaflet
 */

const MapManager = {
    map: null,
    userMarker: null,
    postMarkers: [],
    tempMarker: null,
    userLocation: null,
    selectingLocation: false,

    /**
     * Inicializar mapa
     */
    init() {
        // Criar mapa
        this.map = L.map('map').setView([CONFIG.DEFAULT_LAT, CONFIG.DEFAULT_LNG], CONFIG.DEFAULT_ZOOM);

        // Adicionar tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);

        // Obter localização do usuário
        this.getUserLocation();

        // Event listener para clique no mapa (selecionar localização para novo post)
        this.map.on('click', (e) => {
            if (this.selectingLocation) {
                this.setTempLocation(e.latlng.lat, e.latlng.lng);
            }
        });
    },

    /**
     * Ativar modo de seleção de localização
     */
    enableLocationSelection() {
        console.log('🎯 Modo de seleção de localização ATIVADO');
        this.selectingLocation = true;
        document.getElementById('map').style.cursor = 'crosshair';

        // Expandir mapa temporariamente
        const mapContainer = document.querySelector('.map-container');
        mapContainer.classList.add('map-expanded');
        console.log('🗺️ Mapa expandido para seleção');

        showToast('👆 Clique no mapa para selecionar a localização', 'info');
    },

    /**
     * Desativar modo de seleção de localização
     */
    disableLocationSelection() {
        console.log('🎯 Modo de seleção de localização DESATIVADO');
        this.selectingLocation = false;
        document.getElementById('map').style.cursor = '';

        // Retrair mapa
        const mapContainer = document.querySelector('.map-container');
        mapContainer.classList.remove('map-expanded');
        console.log('🗺️ Mapa retraído');
    },

    /**
     * Alternar tamanho do mapa
     */
    toggleMapSize() {
        const mapContainer = document.querySelector('.map-container');
        mapContainer.classList.toggle('map-expanded');

        // Atualizar tamanho do mapa do Leaflet
        setTimeout(() => {
            this.map.invalidateSize();
        }, 300);

        console.log('🗺️ Mapa alternado:', mapContainer.classList.contains('map-expanded') ? 'EXPANDIDO' : 'NORMAL');
    },

    /**
     * Obter localização do usuário via GPS
     */
    getUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    this.userLocation = { lat, lng };
                    Storage.saveUserLocation(lat, lng);

                    // Centralizar mapa na localização do usuário
                    this.map.setView([lat, lng], CONFIG.DEFAULT_ZOOM);

                    // Adicionar marcador do usuário
                    this.addUserMarker(lat, lng);

                    // Mostrar toast
                    showToast('Localização obtida com sucesso!', 'success');
                },
                (error) => {
                    console.error('Erro ao obter localização:', error);

                    // Tentar usar localização salva
                    const saved = Storage.getUserLocation();
                    if (saved) {
                        this.userLocation = { lat: saved.lat, lng: saved.lng };
                        this.map.setView([saved.lat, saved.lng], CONFIG.DEFAULT_ZOOM);
                        this.addUserMarker(saved.lat, saved.lng);
                    }

                    showToast('Não foi possível obter sua localização. Usando localização padrão.', 'info');
                }
            );
        } else {
            showToast('Geolocalização não suportada pelo navegador', 'error');
        }
    },

    /**
     * Adicionar marcador do usuário
     */
    addUserMarker(lat, lng) {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }

        const userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="background: #6366f1; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        this.userMarker = L.marker([lat, lng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup('<b>Você está aqui</b>');
    },

    /**
     * Definir localização temporária (para novo post)
     */
    setTempLocation(lat, lng) {
        console.log('📍 Localização selecionada:', { lat, lng });

        // Remover marcador temporário anterior
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }

        // Criar novo marcador temporário
        this.tempMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'temp-marker',
                html: '<div style="background: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map);

        console.log('✅ Marcador temporário adicionado ao mapa');

        // Atualizar campos do formulário
        document.getElementById('postLat').value = lat;
        document.getElementById('postLng').value = lng;

        const locationInfo = document.getElementById('postLocation');
        locationInfo.innerHTML = `<i class="fas fa-check-circle"></i> Localização selecionada (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        locationInfo.classList.add('selected');

        console.log('✅ Formulário atualizado com coordenadas');

        // Desativar modo de seleção
        this.disableLocationSelection();

        // Mostrar confirmação
        showToast('✓ Localização selecionada com sucesso!', 'success');
    },

    /**
     * Limpar marcador temporário
     */
    clearTempMarker() {
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
        this.disableLocationSelection();
    },

    /**
     * Criar ícone de pin customizado
     */
    createPinIcon(category) {
        const color = getCategoryColor(category);

        return L.divIcon({
            className: 'custom-pin',
            html: `
                <div style="
                    background: ${color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                ">
                    <i class="fas ${getCategoryIcon(category)}" style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(45deg);
                        color: white;
                        font-size: 12px;
                    "></i>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    },

    /**
     * Adicionar posts ao mapa
     */
    addPosts(posts) {
        // Limpar marcadores anteriores
        this.clearPostMarkers();

        // Adicionar novos marcadores
        posts.forEach(post => {
            const marker = L.marker([post.latitude, post.longitude], {
                icon: this.createPinIcon(post.category)
            }).addTo(this.map);

            // Criar popup
            const popupContent = this.createPopupContent(post);
            marker.bindPopup(popupContent, {
                className: 'custom-popup',
                maxWidth: 300
            });

            // Event listener para abrir detalhes
            marker.on('click', () => {
                // Registrar visualização
                API.hotPosts.recordView(post.id).catch(console.error);
                Storage.addViewedPost(post.id);
            });

            this.postMarkers.push(marker);
        });
    },

    /**
     * Criar conteúdo do popup
     */
    createPopupContent(post) {
        const categoryColor = getCategoryColor(post.category);

        return `
            <div class="popup-content">
                <div class="popup-category" style="background: ${categoryColor}20; color: ${categoryColor};">
                    ${getCategoryLabel(post.category)}
                </div>
                <div class="popup-title">${post.title}</div>
                <div class="popup-description">${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}</div>
                <div class="popup-stats">
                    <span><i class="fas fa-clock"></i> ${post.time_ago}</span>
                    <span><i class="fas fa-thumbs-up"></i> ${post.vote_count || 0}</span>
                </div>
                <button class="popup-btn" onclick="PostsManager.showPostDetails(${post.id})">
                    Ver Detalhes
                </button>
            </div>
        `;
    },

    /**
     * Limpar marcadores de posts
     */
    clearPostMarkers() {
        this.postMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.postMarkers = [];
    },

    /**
     * Centralizar no post
     */
    focusOnPost(lat, lng, zoom = 17) {
        this.map.setView([lat, lng], zoom);
    }
};
