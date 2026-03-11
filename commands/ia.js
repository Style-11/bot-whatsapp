const OpenAI = require("openai");
const { getJid } = require("../utils/helpers");

// Groq es GRATIS - usa modelos Llama 3
// Consigue tu API key gratis en: https://console.groq.com/keys
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes escribir una pregunta.\n*Ejemplo:* !ia ¿Qué es la inteligencia artificial?",
    });
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    await sock.sendMessage(jid, {
      text: "⚠️ La IA no está configurada. Falta la variable GROQ_API_KEY.\nConsigue tu key gratis en: https://console.groq.com/keys",
    });
    return;
  }

  await sock.sendMessage(jid, { text: "🤖 Pensando..." });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente útil que responde en español de forma clara y concisa.",
        },
        { role: "user", content: args },
      ],
      max_tokens: 1024,
    });

    const respuesta = completion.choices[0]?.message?.content || "No obtuve respuesta.";

    await sock.sendMessage(jid, { text: `🤖 *IA:*\n${respuesta}` });
  } catch (err) {
    console.error("Error en !ia:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ Ocurrió un error con la IA. Intenta de nuevo más tarde.",
    });
  }
}

module.exports = { execute };
