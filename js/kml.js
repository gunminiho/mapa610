function loadKMLData() {
    // Usamos fetch para cargar el archivo KML
    fetch('/camaras/610camaras/610.kml')  // Asegúrate de que esta ruta sea correcta
        .then(response => response.text())
        .then(kmlText => {
            // Convertir el KML a GeoJSON usando togeojson
            var kml = new DOMParser().parseFromString(kmlText, 'text/xml');
            var geojson = toGeoJSON.kml(kml);  // Convertir el KML a GeoJSON

            // Añadir el GeoJSON al mapa
            L.geoJSON(geojson).addTo(map);  // Usar Leaflet para agregar los puntos/áreas al mapa
        })
        .catch(error => {
            console.error("Error al cargar el KML:", error);
        });
}
