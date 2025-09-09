import { downloadMediaMessage } from "baileys";
import * as waUtil from "../utils/whatsapp.util.js";
import * as stickerUtil from "../utils/sticker.util.js";
import { buildText, messageErrorCommandUsage } from "../utils/general.util.js";

import sharp from "sharp";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Corta imagem no centro para quadrado 512x512
async function cropImageSquare(buffer) {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const size = Math.min(metadata.width, metadata.height);

  return await image
    .extract({
      left: Math.floor((metadata.width - size) / 2),
      top: Math.floor((metadata.height - size) / 2),
      width: size,
      height: size,
    })
    .resize(512, 512)
    .toBuffer();
}

// Corta vídeo para quadrado 512x512
async function cropVideoSquare(buffer) {
  const inputPath = path.join("temp_input.mp4");
  const outputPath = path.join("temp_output.mp4");
  fs.writeFileSync(inputPath, buffer);

  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${inputPath}" -vf "crop='min(iw,ih)':'min(iw,ih)',scale=512:512" -t 9 -y "${outputPath}"`;
    exec(cmd, (error) => {
      if (error) return reject(error);
      const outBuffer = fs.readFileSync(outputPath);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      resolve(outBuffer);
    });
  });
}

/**
 * Valida se a mensagem contém mídia apropriada
 * @param {object} message - mensagem recebida
 * @param {object} options - { allowVideo: boolean, maxSeconds: number }
 */
export function validateMessage(message, options = {}) {
  const { allowVideo = true, maxSeconds = 9 } = options;

  const type = message.isQuoted ? message.quotedMessage?.type : message.type;
  const waMessage = message.isQuoted ? message.quotedMessage?.wa_message : message.wa_message;
  const seconds = message.isQuoted ? message.quotedMessage?.media?.seconds : message.media?.seconds;

  if (!type || !waMessage) {
    throw new Error("Mensagem inválida ou sem mídia.");
  }

  if (type !== "imageMessage" && type !== "videoMessage") {
    throw new Error("Você precisa enviar uma imagem ou vídeo.");
  }

  if (!allowVideo && type === "videoMessage") {
    throw new Error("Vídeo não permitido nesse comando.");
  }

  if (type === "videoMessage" && seconds && seconds > maxSeconds) {
    throw new Error(`O vídeo deve ter no máximo ${maxSeconds} segundos.`);
  }

  return { type, waMessage, seconds };
}

/**
 * Baixa a mídia da mensagem
 * @param {object} waMessage
 */
export async function downloadMedia(waMessage) {
  return await downloadMediaMessage(waMessage, "buffer", {});
}

/**
 * Cria um sticker a partir de uma mídia
 * @param {object} waMessage
 * @param {object} options - { type, fps, authorText }
 * @param {object} botInfo
 */
export async function processSticker(waMessage, options, botInfo, pushname) {
  let mediaBuffer = await downloadMedia(waMessage);

if (waMessage.message?.imageMessage) {
  mediaBuffer = await cropImageSquare(mediaBuffer);
} else if (waMessage.message?.videoMessage) {
  mediaBuffer = await cropVideoSquare(mediaBuffer);
}

  const authorText = buildText(
    options.authorText || "",
    pushname || "Bot"
  );

  return await stickerUtil.createSticker(mediaBuffer, {
    pack: botInfo.name,
    author: authorText,
    fps: options.fps || 9,
    type: options.type || "resize",
  });
}

/**
 * Envia um sticker no chat
 */
export async function sendStickerReply(client, chatId, stickerBuffer, message, expiration) {
  await waUtil.sendSticker(client, chatId, stickerBuffer, {
    expiration,
    quoted: message?.wa_message,
  });
}

/**
 * Envia erro de uso incorreto
 */
export function usageError(botInfo, message, customMsg) {
  throw new Error(customMsg || messageErrorCommandUsage(botInfo.prefix, message));
}
