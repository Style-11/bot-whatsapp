const QRCode = require("qrcode");
const { getJid, archivoTemporal, limpiarArchivo } = require("../utils/helpers");

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes escribir un texto o URL.\n*Ejemplo:* !qr https://google.com",
    });
    return;
  }

  try {
    const filePath = archivoTemporal("png");
    await QRCode.toFile(filePath, args, {
      width: 300,
      margin: 2,
    });

    const fs = require("fs");
    await sock.sendMessage(jid, {
      image: fs.readFileSync(filePath),
      caption: `📱 *Código QR generado para:*\n${args}`,
    });

    limpiarArchivo(filePath);
  } catch (err) {
    console.error("Error en !qr:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo generar el código QR. Intenta de nuevo.",
    });
  }
}

module.exports = { execute };
