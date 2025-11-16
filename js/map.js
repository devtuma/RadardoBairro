/**
 * Gerenciamento do Mapa Leaflet - VERSÃO REESCRITA
 */

const MapManager = {
    map: null,
    markers: [],
    tempMarker: null,
    userLocation: null,
    selectingLocation: false,

    init() {
        console.log('=== MAP INIT START ===');
        
        this.map = L.map('map').setView([CONFIG.DEFAULT_LAT, CONFIG.DEFAULT_LNG], CONFIG.DEFAULT_ZOOM);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19
        }).addTo(this.map);
        
        setTimeout(() => this.map.invalidateSize(), 100);
        
        this.setupClickListener();
        this.getUserLocation();
        
        console.log('=== MAP INIT COMPLETE ===');
    },

    setupClickListener() {
        this.map.off('click');
        this.map.on('click', (e) => {
            console.log('>>> MAP CLICK DETECTED <<<');
            console.log('Coords:', e.latlng);
            console.log('Selecting mode:', this.selectingLocation);
            
            if (this.selectingLocation) {
                console.log('>>> PROCESSING LOCATION <<<');
                this.setTempLocation(e.latlng.lat, e.latlng.lng);
            }
        });
        console.log('Click listener registered');
    },

    enableLocationSelection() {
        console.log('>>> ENABLE LOCATION SELECTION <<<');
        this.selectingLocation = true;
        document.getElementById('map').style.cursor = 'crosshair';
        document.getElementById('map').classList.add('selecting-mode');
        document.querySelector('.map-container').classList.add('map-expanded');
        setTimeout(() => this.map.invalidateSize(), 300);
        showToast('Clique no mapa para selecionar', 'info');
        console.log('Selection mode:', this.selectingLocation);
    },

    disableLocationSelection() {
        this.selectingLocation = false;
        document.getElementById('map').style.cursor = '';
        document.getElementById('map').classList.remove('selecting-mode');
        document.querySelector('.map-container').classList.remove('map-expanded');
        setTimeout(() => this.map.invalidateSize(), 300);
    },

    setTempLocation(lat, lng) {
        console.log('>>> SET TEMP LOCATION <<<', lat, lng);
        
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }
        
        this.tempMarker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }).addTo(this.map);
        
        document.getElementById('postLat').value = lat;
        document.getElementById('postLng').value = lng;
        
        const locInfo = document.getElementById('postLocation');
        locInfo.innerHTML = '<i class="fas fa-check-circle"></i> Localização selecionada';
        locInfo.classList.add('selected');
        
        showToast('Localização selecionada!', 'success');
        console.log('>>> LOCATION SET SUCCESSFULLY <<<');
    },

    clearTempMarker() {
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
        this.disableLocationSelection();
        document.getElementById('postLat').value = '';
        document.getElementById('postLng').value = '';
        document.getElementById('postLocation').innerHTML = '<i class="fas fa-crosshairs"></i> Clique no mapa';
        document.getElementById('postLocation').classList.remove('selected');
    },

    toggleMapSize() {
        const container = document.querySelector('.map-container');
        const btn = document.getElementById('btnToggleMap');
        container.classList.toggle('map-expanded');
        btn.querySelector('i').className = container.classList.contains('map-expanded') ? 'fas fa-compress-alt' : 'fas fa-expand-alt';
        setTimeout(() => this.map.invalidateSize(), 300);
    },

    getUserLocation() {
        if (!navigator.geolocation) return;
        
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            this.userLocation = { lat, lng };
            Storage.saveUserLocation(lat, lng);
            this.map.setView([lat, lng], 15);
            
            L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }).addTo(this.map).bindPopup('Você está aqui');
        });
    },

    addPosts(posts) {
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];
        
        posts.forEach(post => {
            const colors = { fofoca: 'violet', alerta: 'red', evento: 'orange', achados: 'yellow' };
            const color = colors[post.category] || 'blue';
            
            const marker = L.marker([post.latitude, post.longitude], {
                icon: L.icon({
                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }).addTo(this.map);
            
            marker.bindPopup(`<strong>${post.title}</strong><br><small>${post.time_ago}</small><br><button onclick="PostsManager.showPostDetails(${post.id})" style="margin-top:0.5rem;padding:0.25rem 0.75rem;background:#6366f1;color:white;border:none;border-radius:4px;cursor:pointer;">Ver</button>`);
            this.markers.push(marker);
        });
    },

    focusOnPost(lat, lng) {
        this.map.setView([lat, lng], 17);
    }
};
