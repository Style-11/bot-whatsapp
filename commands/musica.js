const fs = require("fs");
const { getJid, esURL, limpiarArchivo } = require("../utils/helpers");
const { descargarAudio } = require("../utils/download");

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args || !esURL(args)) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes enviar un link válido.\n*Ejemplo:* !musica https://www.youtube.com/watch?v=...",
    });
    return;
  }

  await sock.sendMessage(jid, { text: "🎵 Descargando música, espera un momento..." });

  let filePath;
  try {
    filePath = await descargarAudio(args.trim());

    await sock.sendMessage(jid, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg",
      ptt: false,
    });
  } catch (err) {
    console.error("Error en !musica:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo descargar la música. Verifica el link e intenta de nuevo.",
    });
  } finally {
    if (filePath) limpiarArchivo(filePath);
  }
}

module.exports = { execute };
