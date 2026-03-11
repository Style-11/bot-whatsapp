const fs = require("fs");
const { getJid, esURL, limpiarArchivo } = require("../utils/helpers");
const { descargarVideo } = require("../utils/download");

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args || !esURL(args)) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes enviar un link válido.\n*Ejemplo:* !video https://www.youtube.com/watch?v=...",
    });
    return;
  }

  await sock.sendMessage(jid, { text: "🎬 Descargando video, espera un momento..." });

  let filePath;
  try {
    filePath = await descargarVideo(args.trim());

    await sock.sendMessage(jid, {
      video: fs.readFileSync(filePath),
      mimetype: "video/mp4",
      caption: "🎬 Aquí tienes tu video.",
    });
  } catch (err) {
    console.error("Error en !video:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo descargar el video. Verifica el link e intenta de nuevo.",
    });
  } finally {
    if (filePath) limpiarArchivo(filePath);
  }
}

module.exports = { execute };
