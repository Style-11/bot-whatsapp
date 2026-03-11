const { execFile } = require("child_process");
const path = require("path");
const { archivoTemporal } = require("./helpers");

/**
 * Descarga audio MP3 de YouTube usando yt-dlp.
 * Retorna la ruta del archivo descargado.
 */
async function descargarAudio(url) {
  const salida = archivoTemporal("mp3");

  return new Promise((resolve, reject) => {
    const ytdlp = require("yt-dlp-exec");
    ytdlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: salida,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    })
      .then(() => resolve(salida))
      .catch((err) => reject(new Error(`Error descargando audio: ${err.message}`)));
  });
}

/**
 * Descarga video MP4 de YouTube/TikTok/Instagram usando yt-dlp.
 * Retorna la ruta del archivo descargado.
 */
async function descargarVideo(url) {
  const salida = archivoTemporal("mp4");

  return new Promise((resolve, reject) => {
    const ytdlp = require("yt-dlp-exec");
    ytdlp(url, {
      format: "best[ext=mp4]/best",
      output: salida,
      noCheckCertificates: true,
      noWarnings: true,
      maxFilesize: "50M",
    })
      .then(() => resolve(salida))
      .catch((err) => reject(new Error(`Error descargando video: ${err.message}`)));
  });
}

module.exports = { descargarAudio, descargarVideo };
