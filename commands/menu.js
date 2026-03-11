const { getJid } = require("../utils/helpers");

const MENU_TEXT = `
🌟 *Bot de WhatsApp - Menú de Comandos* 🌟

🔗 *Descarga automática:*
  Envía un link de TikTok, YouTube o Instagram y se descarga solo. ¡Sin comandos!

🎵 *Música:*
  !musica <link> — Descargar música (MP3) desde YouTube.

🎬 *Videos:*
  !video <link> — Descargar videos de YouTube, TikTok, Instagram.

🖼️ *Stickers:*
  !sticker — Crear un sticker a partir de una imagen.

🤖 *Inteligencia Artificial:*
  !ia <pregunta> — Haz preguntas y responde con IA.

😂 *Diversión:*
  !meme — Enviar un meme aleatorio.
  !juego — Iniciar un juego divertido.

🧰 *Herramientas:*
  !qr <texto> — Generar código QR.
  !traducir <texto> — Traducir texto al inglés.
  !clima <ciudad> — Consultar el clima actual.

📌 Escribe el comando seguido de tu mensaje o link.
`.trim();

async function execute(sock, msg) {
  const jid = getJid(msg);
  await sock.sendMessage(jid, { text: MENU_TEXT });
}

module.exports = { execute };
