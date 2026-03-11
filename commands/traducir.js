const axios = require("axios");
const { getJid } = require("../utils/helpers");

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes escribir un texto para traducir.\n*Ejemplo:* !traducir Hola, ¿cómo estás?",
    });
    return;
  }

  try {
    // Usar la API gratuita de LibreTranslate o MyMemory
    const encoded = encodeURIComponent(args);
    const { data } = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encoded}&langpair=es|en`,
      { timeout: 10000 }
    );

    const traduccion =
      data?.responseData?.translatedText || "No se pudo traducir.";

    await sock.sendMessage(jid, {
      text: `🌐 *Traducción (ES → EN):*\n\n📝 Original: ${args}\n✅ Traducido: ${traduccion}`,
    });
  } catch (err) {
    console.error("Error en !traducir:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo traducir el texto. Intenta de nuevo.",
    });
  }
}

module.exports = { execute };
