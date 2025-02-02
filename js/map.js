// Array de colores ajustados para la distribución visual
const colors = [
    'blue',    // Jurisdicción 10 de Octubre
    'green',   // Jurisdicción Bayovar
    'purple',  // Jurisdicción Caja de Agua
    'orange',  // Jurisdicción Canto Rey
    'red',     // Jurisdicción La Huayrona
    'gray',    // Jurisdicción Mariscal Caceres
    'brown',   // Jurisdicción Santa Elizabeth
    'black'    // Jurisdicción Zarate
];

// Función para crear el ícono SVG dinámico según tipo de cámara
function createCameraSVG(type) {
    const colorsByType = {
        "TIPO I": '#FF0000',
        "TIPO II": '#00FF00',
        "TIPO III": '#0000FF'
    };

    const color = colorsByType[type] || '#808080';  // Color por defecto gris

    return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
    <!-- Soporte de la cámara -->
    <rect x="15" y="44" width="34" height="6" fill="#444" />
    
    <!-- Cuerpo de la cámara -->
    <rect x="10" y="20" width="44" height="24" rx="4" fill="${color}" stroke="#000" stroke-width="2" />

    <!-- Lente de la cámara -->
    <circle cx="32" cy="32" r="8" fill="#fff" stroke="#000" stroke-width="2" />

    <!-- Detalles de la lente interna -->
    <circle cx="32" cy="32" r="4" fill="#007BFF" />

    <!-- Flash o sensor en la esquina superior -->
    <circle cx="20" cy="24" r="2" fill="#FF0000" />
</svg>

    `;
}

const radioFiltro = 500;

// Inicializar el mapa
var map = L.map('map').setView([-12.012736, -76.996186], 13);

// Agregar capa de mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Variables globales
let cameraMarkers = [];
let geojsonData = null;
let polygons = [];
let currentCircle = null;

// Función para dibujar el polígono en el mapa
function drawPolygon(jurisdiction) {
    if (jurisdiction.coordinates.length > 0) {
        const color = colors[jurisdiction.index % colors.length];

        const polygon = L.polygon(jurisdiction.coordinates, {
            color: color,
            weight: 4,
            opacity: 0.7
        }).addTo(map);

        polygon.on('click', () => {
            resetFilter();
            filterCamerasByJurisdiction(polygon);
        });

        polygons.push(polygon);
    } else {
        console.warn(`Jurisdicción ${jurisdiction.name} tiene coordenadas inválidas.`);
    }
}

// Mostrar información de la cámara
// Función para mostrar información de la cámara en el panel lateral
function showCameraInfo(camera) {
    document.getElementById('cameraNameValue').textContent = camera.properties.name || 'Desconocido';
    document.getElementById('cameraLatValue').textContent = camera.geometry.coordinates[1] || 'No disponible';
    document.getElementById('cameraLngValue').textContent = camera.geometry.coordinates[0] || 'No disponible';
    document.getElementById('cameraDireccionValue').textContent = camera.properties.direccion || 'Desconocido';
    document.getElementById('cameraTipoValue').textContent = camera.properties.tipo || 'Desconocido';
    document.getElementById('cameraCamaraValue').textContent = camera.properties.camara || 'Desconocido';

    // Convertir valores booleanos de megáfono y botón en "Sí" o "No"
    const megafonoValue = camera.properties.megafono == true ? 'Sí' : 'No';
    const botonValue = camera.properties.boton == true ? 'Sí' : 'No';

    document.getElementById('cameraMegafonoValue').textContent = megafonoValue;
    document.getElementById('cameraBotonValue').textContent = botonValue;
    document.getElementById('cameraJurisdiccionValue').textContent = camera.properties.jurisdiccion || 'Desconocido';

    document.getElementById('cameraInfoPopup').style.display = 'block';
}


// Función para cargar los marcadores de las cámaras
function loadMarkers(geojson) {
    //console.log('Cargando marcadores:', geojson.features.length);
    // Limpiar marcadores existentes
    cameraMarkers.forEach(marker => map.removeLayer(marker));
    cameraMarkers = [];

    // Crear y agregar nuevos marcadores
    cameraMarkers = geojson.features.map(feature => {
        const type = feature.properties.tipo || 'I';
        const svgIconHtml = createCameraSVG(type);

        const icon = L.divIcon({
            html: svgIconHtml,
            className: 'custom-camera-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon });

        // ¡Aquí es donde asignamos la propiedad 'feature' al marcador!
        marker.feature = feature;

        marker.bindTooltip(feature.properties.name || 'Desconocido', {
            permanent: true,
            direction: 'bottom',
            className: 'camera-tooltip'
        });

        marker.on('click', () => {
            showCamerasInRadius(marker.getLatLng(), radioFiltro);
            showCameraInfo(feature);
        });

        marker.addTo(map);
        return marker;
    });
}


// Función para filtrar cámaras dentro de un radio
function showCamerasInRadius(latlng, radius) {
    if (currentCircle) {
        map.removeLayer(currentCircle);
    }

    currentCircle = L.circle(latlng, {
        color: 'black',
        fillColor: 'black',
        fillOpacity: 0.2,
        radius: radius
    }).addTo(map);

    const filteredGeojson = geojsonData.features.filter(feature => {
        const cameraLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        return latlng.distanceTo(cameraLatLng) <= radius;
    });

    loadMarkers({ features: filteredGeojson });
}

// Función para filtrar cámaras por jurisdicción
function filterCamerasByJurisdiction(polygon) {
    const polygonCoords = polygon.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
    const turfPolygon = turf.polygon([polygonCoords]);

    const filteredGeojson = geojsonData.features.filter(feature => {
        const latlng = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
        return turf.booleanPointInPolygon(turf.point(latlng), turfPolygon);
    });

    console.log('Cámaras en la jurisdicción:', filteredGeojson.length);
    loadMarkers({ features: filteredGeojson });
}

// Función para restablecer el filtro
function resetFilter() {
    if (currentCircle) {
        map.removeLayer(currentCircle);
        currentCircle = null;
    }

    loadMarkers(geojsonData);
    document.getElementById('cameraInfoPopup').style.display = 'none';
}

// Cargar el GeoJSON con las cámaras
function loadGeoJSONData() {
    fetch('/camaras/610camaras/610.geojson')
        .then(response => response.json())
        .then(geojson => {
            geojsonData = geojson;
            loadMarkers(geojson);
            loadCameraSelectOptions();
        })
        .catch(error => {
            console.error('Error al cargar el GeoJSON:', error);
        });
}

// Cargar jurisdicciones
function loadJurisdictionsData() {
    const files = [
        { name: '10 de Octubre', file: '/maps/10deOctubre.csv', index: 0 },
        { name: 'Bayovar', file: '/maps/Bayovar.csv', index: 1 },
        { name: 'Caja de Agua', file: '/maps/CajaDeAgua.csv', index: 2 },
        { name: 'Canto Rey', file: '/maps/CantoRey.csv', index: 3 },
        { name: 'La Huayrona', file: '/maps/LaHuayrona.csv', index: 4 },
        { name: 'Mariscal Caceres', file: '/maps/MariscalCaceres.csv', index: 5 },
        { name: 'Santa Elizabeth', file: '/maps/SantaElizabeth.csv', index: 6 },
        { name: 'Zarate', file: '/maps/Zarate.csv', index: 7 }
    ];

    files.forEach(jurisdiction => {
        fetch(jurisdiction.file)
            .then(response => response.text())
            .then(csvText => {
                parseCSV(csvText, coordinates => {
                    jurisdiction.coordinates = coordinates;
                    drawPolygon(jurisdiction);
                });
            }).catch(error => {
                console.error(`No se pudo cargar el archivo ${jurisdiction.name}: ${error}`);
            });
    });
}

// Evento para restablecer filtros al hacer clic derecho
map.on('contextmenu', resetFilter);

// Cargar los datos iniciales
loadJurisdictionsData();
loadGeoJSONData();
