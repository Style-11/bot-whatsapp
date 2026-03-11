const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcodeTerminal = require("qrcode-terminal");
const path = require("path");
const fs = require("fs");

// Importar comandos
const menuCmd = require("./commands/menu");
const musicaCmd = require("./commands/musica");
const videoCmd = require("./commands/video");
const stickerCmd = require("./commands/sticker");
const iaCmd = require("./commands/ia");
const memeCmd = require("./commands/meme");
const juegoCmd = require("./commands/juego");
const qrCmd = require("./commands/qr");
const traducirCmd = require("./commands/traducir");
const climaCmd = require("./commands/clima");

// Crear carpeta de descargas temporales
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const PREFIX = "!";

const commands = {
  menu: menuCmd,
  musica: musicaCmd,
  video: videoCmd,
  sticker: stickerCmd,
  ia: iaCmd,
  meme: memeCmd,
  juego: juegoCmd,
  qr: qrCmd,
  traducir: traducirCmd,
  clima: climaCmd,
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["WhatsApp Bot", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Escanea el código QR con tu WhatsApp:");
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        `❌ Conexión cerrada. Código: ${statusCode}. Reconectando: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        startBot();
      } else {
        console.log("🚫 Sesión cerrada. Elimina auth_info y escanea de nuevo.");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot conectado exitosamente a WhatsApp");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      try {
        if (msg.key.fromMe) continue;
        if (!msg.message) continue;

        const jid = msg.key.remoteJid;
        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          "";

        // Auto-detectar links de TikTok, YouTube, Instagram y descargar automáticamente
        const linkPatterns = [
          /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/\S+/i,
          /https?:\/\/(www\.|m\.)?youtube\.com\/watch\S+/i,
          /https?:\/\/youtu\.be\/\S+/i,
          /https?:\/\/youtube\.com\/shorts\/\S+/i,
          /https?:\/\/(www\.)?instagram\.com\/(reel|p)\/\S+/i,
        ];

        const linkMatch = linkPatterns.some((p) => p.test(text));
        if (linkMatch && !text.startsWith(PREFIX)) {
          const urlMatch = text.match(/https?:\/\/\S+/i);
          if (urlMatch) {
            console.log(`🔗 Link detectado automáticamente: ${urlMatch[0]}`);
            await commands.video.execute(sock, msg, urlMatch[0]);
            continue;
          }
        }

        if (!text.startsWith(PREFIX)) continue;

        const parts = text.slice(PREFIX.length).trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(" ");

        if (commands[command]) {
          console.log(`📥 Comando recibido: !${command} ${args}`);
          await commands[command].execute(sock, msg, args);
        } else {
          await sock.sendMessage(jid, {
            text: `❌ Comando *!${command}* no reconocido.\nEscribe *!menu* para ver los comandos disponibles.`,
          });
        }
      } catch (err) {
        console.error("Error procesando mensaje:", err);
        const jid = msg.key.remoteJid;
        await sock
          .sendMessage(jid, {
            text: "⚠️ Ocurrió un error al procesar tu mensaje. Intenta de nuevo.",
          })
          .catch(() => {});
      }
    }
  });
}

startBot().catch((err) => {
  console.error("Error fatal al iniciar el bot:", err);
  process.exit(1);
});
