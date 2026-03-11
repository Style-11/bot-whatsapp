const axios = require("axios");
const { getJid } = require("../utils/helpers");

async function execute(sock, msg) {
  const jid = getJid(msg);

  await sock.sendMessage(jid, { text: "😂 Buscando un meme..." });

  try {
    const { data } = await axios.get("https://meme-api.com/gimme/memes_en_espanol", {
      timeout: 10000,
    });

    if (data?.url) {
      const imageResponse = await axios.get(data.url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });

      await sock.sendMessage(jid, {
        image: Buffer.from(imageResponse.data),
        caption: `😂 *${data.title || "Meme"}*`,
      });
    } else {
      // Fallback a memes en inglés
      const { data: fallback } = await axios.get("https://meme-api.com/gimme", {
        timeout: 10000,
      });

      if (fallback?.url) {
        const imageResponse = await axios.get(fallback.url, {
          responseType: "arraybuffer",
          timeout: 15000,
        });

        await sock.sendMessage(jid, {
          image: Buffer.from(imageResponse.data),
          caption: `😂 *${fallback.title || "Meme"}*`,
        });
      } else {
        throw new Error("No se encontró meme");
      }
    }
  } catch (err) {
    console.error("Error en !meme:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo obtener un meme. Intenta de nuevo.",
    });
  }
}

module.exports = { execute };
