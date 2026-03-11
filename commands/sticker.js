const sharp = require("sharp");
const { getJid } = require("../utils/helpers");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

async function execute(sock, msg) {
  const jid = getJid(msg);

  // Verificar que el mensaje contiene una imagen
  const imageMessage =
    msg.message?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!imageMessage) {
    await sock.sendMessage(jid, {
      text: "⚠️ Envía o responde a una *imagen* con el comando *!sticker* para convertirla.",
    });
    return;
  }

  await sock.sendMessage(jid, { text: "🖼️ Creando sticker..." });

  try {
    // Descargar la imagen del mensaje
    const buffer = await downloadMediaMessage(
      { message: { imageMessage }, key: msg.key },
      "buffer",
      {}
    );

    // Convertir a WebP con sharp
    const stickerBuffer = await sharp(buffer)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80 })
      .toBuffer();

    await sock.sendMessage(jid, {
      sticker: stickerBuffer,
    });
  } catch (err) {
    console.error("Error en !sticker:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo crear el sticker. Intenta con otra imagen.",
    });
  }
}

module.exports = { execute };
