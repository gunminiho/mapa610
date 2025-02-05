// Evento para copiar la ubicación con Ctrl + clic derecho en el mapa
map.on('contextmenu', function (e) {
    if (e.originalEvent.ctrlKey) {
        const { lat, lng } = e.latlng;

        // Generar el enlace de Google Maps
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

        // Copiar el enlace al portapapeles
        copyToClipboard(googleMapsLink);

        // Mostrar el popup con el mensaje
        showPopupMessage('Ubicación copiada al portapapeles', googleMapsLink);
    }
});

// Función para copiar texto al portapapeles
function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = text;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
}

// Función para mostrar el popup estilizado
function showPopupMessage(message, link) {
    // Crear el contenedor del popup
    const popup = document.createElement('div');
    popup.className = 'custom-popup';

    // Contenido del popup
    popup.innerHTML = `
        <p>${message}</p>
        <a href="${link}" target="_blank">Ver en Google Maps</a>
    `;

    // Agregar el popup al body
    document.body.appendChild(popup);

    // Eliminar el popup después de 3 segundos
    setTimeout(() => {
        popup.remove();
    }, 3000);
}
