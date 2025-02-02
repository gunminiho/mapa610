// Función para cargar las opciones del select de cámaras
function loadCameraSelectOptions() {
    const cameraSelect = document.getElementById('cameraSelect');

    geojsonData.features.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.properties.name;  // Número de cámara
        option.textContent = camera.properties.name;  // Mostrar el nombre de la cámara
        cameraSelect.appendChild(option);
    });
}

// Función para mover el mapa a la cámara seleccionada
function moveToCamera(cameraName) {
    // Encontrar la cámara seleccionada en el GeoJSON
    const camera = geojsonData.features.find(camera => camera.properties.name === cameraName);

    if (camera) {
        const cameraLatLng = [camera.geometry.coordinates[1], camera.geometry.coordinates[0]]; // [lat, lng]

        // Encontrar el marcador existente para la cámara seleccionada
        const marker = cameraMarkers.find(m => {
            const markerLatLng = m.getLatLng();
            return markerLatLng.lat === cameraLatLng[0] && markerLatLng.lng === cameraLatLng[1];
        });

        if (marker) {
            // Centrar el mapa en la cámara seleccionada
            map.setView(cameraLatLng, 20);

            // Mostrar el popup sobre el marcador
            marker.bindPopup(`
                ${camera.properties.name || 'Desconocido'} <br>
            `).openPopup();

            // Mostrar la información de la cámara en el panel lateral
            showCameraInfo(camera);
        } else {
            console.warn('No se encontró un marcador para la cámara seleccionada.');
        }
    }
}


function filterCameras() {
    // Obtener los valores actuales de los filtros
    const searchInput = document.getElementById('cameraSearchInput').value.trim().toLowerCase();
    const selectedType = document.getElementById('cameraTypeSelect').value; // "" si se eligieron todos los tipos
    const hasBotonChecked = document.getElementById('hasBoton').checked;
    const hasMegafonoChecked = document.getElementById('hasMegafono').checked;

    // Iterar sobre todos los marcadores de cámaras
    cameraMarkers.forEach(marker => {
        // Asegurarse de que el marcador tenga la propiedad 'feature'
        if (!marker.feature || !marker.feature.properties) return;

        const props = marker.feature.properties;
        const cameraName = props.name.toString().toLowerCase();
        const cameraType = props.tipo; // Asumimos que es "TIPO I", "TIPO II", o "TIPO III"
        const cameraBoton = props.boton;      // Booleano
        const cameraMegafono = props.megafono; // Booleano

        // Verificar que el nombre coincida con la búsqueda
        const matchesName = searchInput === "" || cameraName.includes(searchInput);
        // Verificar que el tipo coincida o que no se haya seleccionado un filtro
        const matchesType = selectedType === "" || cameraType === selectedType;
        // Si se activó el filtro de botón, la cámara debe tener boton === true
        const matchesBoton = !hasBotonChecked || cameraBoton === true;
        // Si se activó el filtro de megáfono, la cámara debe tener megafono === true
        const matchesMegafono = !hasMegafonoChecked || cameraMegafono === true;

        // Si todos los criterios se cumplen, mostramos el marcador
        if (matchesName && matchesType && matchesBoton && matchesMegafono) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });
}




document.getElementById('cameraSearchInput').addEventListener('input', () => {
    filterCameras();
    updateCameraSelectOptions(); // Si estás actualizando el <select> dinámicamente
});

document.getElementById('cameraTypeSelect').addEventListener('change', () => {
    filterCameras();
    updateCameraSelectOptions();
});

document.getElementById('hasBoton').addEventListener('change', () => {
    filterCameras();
    updateCameraSelectOptions();
});

document.getElementById('hasMegafono').addEventListener('change', () => {
    filterCameras();
    updateCameraSelectOptions();
});







// Evento para cuando se selecciona una cámara
document.getElementById('cameraSelect').addEventListener('change', function () {
    const selectedCamera = this.value;
    if (selectedCamera) {
        moveToCamera(selectedCamera);
    }
});
