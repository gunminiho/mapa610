// Definir el ícono SVG de la cámara
const cameraIcon = L.icon({
    iconUrl: '/img/camara.svg',
    iconSize: [30, 30],   // Tamaño del ícono
    iconAnchor: [15, 30], // Punto de anclaje en el ícono
    popupAnchor: [0, -30] // Donde aparecerá el popup
});

function loadGeoJSONData() {
    // Usamos fetch para cargar el archivo GeoJSON
    fetch('/camaras/610camaras/610.geojson')
    .then(response => response.json())
    .then(geojson => {
        L.geoJSON(geojson, {
            pointToLayer: function (feature, latlng) {
                const type = feature.properties.tipo || 'Indefinido';
                const state = feature.properties.estado || 'activo';
                const svgIconHtml = createCameraSVG(type, state);
        
                const icon = L.divIcon({
                    html: svgIconHtml,
                    className: 'custom-camera-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                });
        
                return L.marker(latlng, { icon });
            }
        }).addTo(map);
        
    })
    .catch(error => {
        console.error('Error al cargar el GeoJSON:', error);
    });
}


