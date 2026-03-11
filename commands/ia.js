const OpenAI = require("openai");
const { getJid } = require("../utils/helpers");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

async function execute(sock, msg, args) {
  const jid = getJid(msg);

  if (!args) {
    await sock.sendMessage(jid, {
      text: "⚠️ Debes escribir una pregunta.\n*Ejemplo:* !ia ¿Qué es la inteligencia artificial?",
    });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    await sock.sendMessage(jid, {
      text: "⚠️ La IA no está configurada. Falta la variable OPENAI_API_KEY.",
    });
    return;
  }

  await sock.sendMessage(jid, { text: "🤖 Pensando..." });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
