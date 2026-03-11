const { getJid } = require("../utils/helpers");

const JUEGOS = {
  ppt: {
    opciones: ["piedra", "papel", "tijera"],
    reglas: { piedra: "tijera", papel: "piedra", tijera: "papel" },
  },
};

// Estado de juegos activos por usuario
const jugadores = new Map();

async function execute(sock, msg, args) {
  const jid = getJid(msg);
  const argLower = (args || "").toLowerCase().trim();

  // Si el usuario responde con piedra/papel/tijera
  if (["piedra", "papel", "tijera"].includes(argLower)) {
    const botEleccion =
      JUEGOS.ppt.opciones[Math.floor(Math.random() * 3)];
    const userEleccion = argLower;

    let resultado;
    if (botEleccion === userEleccion) {
      resultado = "🤝 *¡Empate!*";
    } else if (JUEGOS.ppt.reglas[userEleccion] === botEleccion) {
      resultado = "🎉 *¡Ganaste!*";
    } else {
      resultado = "😢 *¡Perdiste!*";
    }

    await sock.sendMessage(jid, {
      text: `🎮 Tú: *${userEleccion}* vs Bot: *${botEleccion}*\n${resultado}`,
    });
    return;
  }

  // Si el usuario escribe un número para trivia
  if (jugadores.has(jid) && /^[1-4]$/.test(argLower)) {
    const trivia = jugadores.get(jid);
    const respuesta = parseInt(argLower);
    jugadores.delete(jid);

    if (respuesta === trivia.correcta) {
      await sock.sendMessage(jid, { text: "✅ *¡Correcto!* 🎉 Eres un crack." });
    } else {
      await sock.sendMessage(jid, {
        text: `❌ *Incorrecto.* La respuesta era: *${trivia.correcta}. ${trivia.opciones[trivia.correcta - 1]}*`,
      });
    }
    return;
  }

  // Menú de juegos
  const trivias = [
    {
      pregunta: "¿Cuál es el planeta más grande del sistema solar?",
      opciones: ["Marte", "Júpiter", "Saturno", "Tierra"],
      correcta: 2,
    },
    {
      pregunta: "¿En qué año llegó el hombre a la Luna?",
      opciones: ["1965", "1969", "1972", "1980"],
      correcta: 2,
    },
    {
      pregunta: "¿Cuál es el océano más grande?",
      opciones: ["Atlántico", "Índico", "Ártico", "Pacífico"],
      correcta: 4,
    },
    {
      pregunta: "¿Cuántos huesos tiene el cuerpo humano adulto?",
      opciones: ["196", "206", "216", "256"],
      correcta: 2,
    },
    {
      pregunta: "¿Quién pintó la Mona Lisa?",
      opciones: ["Picasso", "Da Vinci", "Miguel Ángel", "Van Gogh"],
      correcta: 2,
    },
  ];

  const trivia = trivias[Math.floor(Math.random() * trivias.length)];
  jugadores.set(jid, trivia);

  const opcionesTexto = trivia.opciones
    .map((op, i) => `  ${i + 1}. ${op}`)
    .join("\n");

  await sock.sendMessage(jid, {
    text: `🎮 *¡Juegos!*\n\n📝 *Trivia:*\n${trivia.pregunta}\n${opcionesTexto}\n\nResponde con *!juego 1*, *!juego 2*, etc.\n\n✊ *Piedra, Papel o Tijera:*\nEscribe *!juego piedra*, *!juego papel* o *!juego tijera*`,
  });
}

module.exports = { execute };
