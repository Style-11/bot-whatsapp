const fs = require("fs");
const path = require("path");

const downloadsDir = path.join(__dirname, "..", "downloads");

/**
 * Elimina un archivo temporal de forma segura.
 */
function limpiarArchivo(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Error al eliminar archivo temporal:", err.message);
  }
}

/**
 * Genera un nombre de archivo temporal único en la carpeta downloads.
 */
function archivoTemporal(extension) {
  const nombre = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return path.join(downloadsDir, `${nombre}.${extension}`);
}

/**
 * Valida si un texto es una URL válida.
 */
function esURL(texto) {
  try {
    new URL(texto);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el JID (remitente) de un mensaje.
 */
function getJid(msg) {
  return msg.key.remoteJid;
}

module.exports = { limpiarArchivo, archivoTemporal, esURL, getJid };
