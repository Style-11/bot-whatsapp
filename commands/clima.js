const axios = require("axios");
const { getJid } = require("../utils/helpers");

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes escribir una ciudad.\n*Ejemplo:* !clima Lima",
    });
    return;
  }

  try {
    // Usar wttr.in (gratuito, sin API key)
    const ciudad = encodeURIComponent(args.trim());
    const { data } = await axios.get(
      `https://wttr.in/${ciudad}?format=j1&lang=es`,
      { timeout: 10000 }
    );

    const current = data.current_condition?.[0];
    if (!current) throw new Error("Sin datos");

    const desc =
      current.lang_es?.[0]?.value ||
      current.weatherDesc?.[0]?.value ||
      "Desconocido";

    const mensaje = [
      `🌤️ *Clima en ${args.trim()}:*`,
      ``,
      `🌡️ Temperatura: *${current.temp_C}°C*`,
      `🤒 Sensación: *${current.FeelsLikeC}°C*`,
      `💧 Humedad: *${current.humidity}%*`,
      `💨 Viento: *${current.windspeedKmph} km/h*`,
      `☁️ Estado: *${desc}*`,
    ].join("\n");

    await sock.sendMessage(jid, { text: mensaje });
  } catch (err) {
    console.error("Error en !clima:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ No se pudo obtener el clima. Verifica el nombre de la ciudad.",
    });
  }
}

module.exports = { execute };
