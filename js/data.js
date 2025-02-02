// Función para leer el archivo CSV y devolver las coordenadas
function parseCSV(file, callback) {
    Papa.parse(file, {
        complete: function(result) {
            const coordinates = result.data.map(row => {
                const lat = parseFloat(row[0]);
                const lng = parseFloat(row[1]);
                // Verificar si las coordenadas son válidas
                if (!isNaN(lat) && !isNaN(lng)) {
                    return [lat, lng];
                } else {
                    console.warn(`Coordenadas inválidas: ${lat}, ${lng}`);
                    return null; // Retorna null si las coordenadas no son válidas
                }
            }).filter(coord => coord !== null); // Filtrar las coordenadas inválidas
            callback(coordinates);
        }
    });
}

// Función para cargar los CSVs de jurisdicciones y procesarlos
function loadJurisdictionsData() {
    const files = [
        { name: '10 de Octubre', file: '/maps/10deOctubre.csv', index: 0 },
        { name: 'Bayovar', file: '/maps/Bayovar.csv', index: 1 },
        { name: 'Caja de Agua', file: '/maps/CajaDeAgua.csv', index: 2 },
        { name: 'Canto Rey', file: '/maps/CantoRey.csv', index: 3 },
        { name: 'La Huayrona', file: '/maps/LaHuayrona.csv', index: 4 },
        { name: 'Mariscal Caceres', file: '/maps/MariscalCaceres.csv', index: 5 },
        { name: 'Santa Elizabeth', file: '/maps/SantaElizabeth.csv', index: 6 }, // Corregido aquí
        { name: 'Zarate', file: '/maps/Zarate.csv', index: 7 }
    ];

    files.forEach(jurisdiction => {
        fetch(jurisdiction.file)
            .then(response => response.text())
            .then(csvText => {
                parseCSV(csvText, function(coordinates) {
                    jurisdiction.coordinates = coordinates;
                    drawPolygon(jurisdiction);
                });
            }).catch(error => {
                console.error(`No se pudo cargar el archivo ${jurisdiction.name}: ${error}`);
            });
    });
}
