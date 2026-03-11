FROM node:20-slim

# Instalar dependencias del sistema (yt-dlp, ffmpeg, python3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    git \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json ./
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Crear carpeta de descargas
RUN mkdir -p downloads

CMD ["node", "index.js"]
