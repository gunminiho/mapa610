let searchMarkers = [];  // Array para almacenar los marcadores de búsqueda

// Función para buscar lugares usando la API de Nominatim
async function searchLocation(query) {
    try {
        // Limpiar los marcadores anteriores antes de la nueva búsqueda
        clearSearchMarkers();

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", sjl, lima, peru")}`);
        const data = await response.json();

        if (data.length > 0) {
            data.forEach(location => {
                const latLng = [parseFloat(location.lat), parseFloat(location.lon)];

                // Crear un marcador con un ícono SVG vistoso
                const searchMarker = L.marker(latLng, { icon: getCustomIcon() }).addTo(map);
                searchMarker.bindPopup(`<strong>${location.display_name}</strong>`).openPopup();

                // Almacenar el marcador en el array
                searchMarkers.push(searchMarker);
            });

            // Centrar el mapa en el primer resultado con zoom ajustado
            const firstLocation = data[0];
            map.setView([parseFloat(firstLocation.lat), parseFloat(firstLocation.lon)], 15);

        } else {
            alert('No se encontraron resultados para la búsqueda.');
        }
    } catch (error) {
        console.error('Error al buscar la ubicación:', error);
        alert('Hubo un problema al realizar la búsqueda.');
    }
}

// Función para limpiar los marcadores de búsqueda
function clearSearchMarkers() {
    searchMarkers.forEach(marker => map.removeLayer(marker));  // Eliminar cada marcador del mapa
    searchMarkers = [];  // Resetear el array
}

// Función para obtener un ícono SVG vistoso
function getCustomIcon() {
    return L.divIcon({
        className: 'custom-icon',
        html: `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                <path d="M21 10c0 4.97-6 12-9 12S3 14.97 3 10a9 9 0 1 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 50],  // Anclar el ícono desde el centro inferior
    });
}

// Evento para el botón de búsqueda
document.getElementById('searchButton').addEventListener('click', function () {
    const query = document.getElementById('searchInput').value;
    if (query) {
        searchLocation(query);
    } else {
        alert('Por favor, ingresa un lugar para buscar.');
    }
});

// Evento para buscar al presionar "Enter" en el campo de búsqueda
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('searchButton').click();
    }
});