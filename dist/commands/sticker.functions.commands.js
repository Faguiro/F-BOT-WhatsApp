import * as waUtil from "../utils/whatsapp.util.js";
import * as imageUtil from "../utils/image.util.js";
import * as stickerUtil from "../utils/sticker.util.js";
import stickerCommands from "./sticker.list.commands.js";
import { buildText } from "../utils/general.util.js";
import {
  validateMessage,
  processSticker,
  sendStickerReply,
  usageError,
  downloadMedia,
} from "../helpers/sticker.service.js";

/**
 * Criação de sticker a partir de imagem/vídeo
 */
export async function sCommand(client, botInfo, message, group) {
  let stickerType = "resize";
  if (message.args[0] === "1") stickerType = "circle";
  else if (message.args[0] === "2") stickerType = "contain";

  const { waMessage } = validateMessage(message, { allowVideo: true, maxSeconds: 9 });

  const stickerBuffer = await processSticker(
    waMessage,
    { type: stickerType, authorText: stickerCommands.s.msgs.author_text },
    botInfo,
    message.pushname
  );

  await sendStickerReply(client, message.chat_id, stickerBuffer, message, message.expiration);
}

/**
 * Converter sticker em imagem
 */
export async function simgCommand(client, botInfo, message, group) {
  if (!message.isQuoted || !message.quotedMessage) {
    usageError(botInfo, message);
  }
  if (message.quotedMessage.type !== "stickerMessage") {
    throw new Error(stickerCommands.simg.msgs.error_sticker);
  }

  let messageQuotedData = message.quotedMessage.wa_message;

  if (messageQuotedData.message?.stickerMessage?.url === "https://web.whatsapp.net") {
    messageQuotedData.message.stickerMessage.url = `https://mmg.whatsapp.net${messageQuotedData.message.stickerMessage.directPath}`;
  }

  const stickerBuffer = await downloadMedia(messageQuotedData);
  const imageBuffer = await stickerUtil.stickerToImage(stickerBuffer);

  await waUtil.replyFileFromBuffer(
    client,
    message.chat_id,
    "imageMessage",
    imageBuffer,
    "",
    message.wa_message,
    { expiration: message.expiration, mimetype: "image/png" }
  );
}

/**
 * Criar sticker sem fundo
 */
export async function ssfCommand(client, botInfo, message, group) {
  const { waMessage } = validateMessage(message, { allowVideo: false });

  await waUtil.replyText(client, message.chat_id, stickerCommands.ssf.msgs.wait, message.wa_message, {
    expiration: message.expiration,
  });

  const mediaBuffer = await downloadMedia(waMessage);
  const imageBuffer = await imageUtil.removeBackground(mediaBuffer);

  const stickerBuffer = await stickerUtil.createSticker(imageBuffer, {
    pack: botInfo.name,
    author: buildText(stickerCommands.ssf.msgs.author_text, message.pushname),
    fps: 9,
    type: "resize",
  });

  await sendStickerReply(client, message.chat_id, stickerBuffer, message, message.expiration);
}

/**
 * Emoji Mix → Sticker
 */
export async function emojimixCommand(client, botInfo, message, group) {
  if (!message.args.length) {
    usageError(botInfo, message);
  }

  const [emoji1, emoji2] = message.text_command.split("+");
  if (!emoji1 || !emoji2) {
    usageError(botInfo, message);
  }

  const supportEmoji = await imageUtil.checkEmojiMixSupport(emoji1.trim(), emoji2.trim());

  if (!supportEmoji.emoji1 && !supportEmoji.emoji2) {
    throw new Error(buildText(stickerCommands.emojimix.msgs.error_emojis, emoji1, emoji2));
  } else if (!supportEmoji.emoji1) {
    throw new Error(buildText(stickerCommands.emojimix.msgs.error_emoji, emoji1));
  } else if (!supportEmoji.emoji2) {
    throw new Error(buildText(stickerCommands.emojimix.msgs.error_emoji, emoji2));
  }

  const imageBuffer = await imageUtil.emojiMix(emoji1.trim(), emoji2.trim());
  if (!imageBuffer) {
    throw new Error(stickerCommands.emojimix.msgs.error_not_found);
  }

  const stickerBuffer = await stickerUtil.createSticker(imageBuffer, {
    pack: botInfo.name,
    author: buildText(stickerCommands.emojimix.msgs.author_text, message.pushname),
    fps: 9,
    type: "resize",
  });

  await sendStickerReply(client, message.chat_id, stickerBuffer, message, message.expiration);
}

/**
 * Renomear sticker
 */
export async function snomeCommand(client, botInfo, message, group) {
  if (!message.isQuoted || message.quotedMessage?.type !== "stickerMessage") {
    usageError(botInfo, message);
  }

  let [pack, author] = message.text_command.split(",");
  if (!pack || !author) {
    usageError(botInfo, message);
  }

  let messageQuotedData = message.quotedMessage.wa_message;
  if (!messageQuotedData.message?.stickerMessage) {
    throw new Error(stickerCommands.snome.msgs.error_message);
  }

  if (messageQuotedData.message.stickerMessage.url === "https://web.whatsapp.net") {
    messageQuotedData.message.stickerMessage.url = `https://mmg.whatsapp.net${messageQuotedData.message.stickerMessage.directPath}`;
  }

  const stickerBuffer = await downloadMedia(messageQuotedData);
  const stickerRenamedBuffer = await stickerUtil.renameSticker(stickerBuffer, pack, author);

  await sendStickerReply(client, message.chat_id, stickerRenamedBuffer, message, message.expiration);
}

/**
 * Auto Sticker (transforma qualquer imagem/vídeo em sticker automaticamente)
 */
export async function autoSticker(client, botInfo, message, group) {
  if (message.type !== "imageMessage" && message.type !== "videoMessage") {
    return;
  }
  if (message.type === "videoMessage" && message.media?.seconds && message.media?.seconds > 9) {
    return;
  }

  const stickerBuffer = await processSticker(
    message.wa_message,
    { type: "resize", authorText: stickerCommands.s.msgs.author_text },
    botInfo,
    message.pushname
  );

  await sendStickerReply(client, message.chat_id, stickerBuffer, message, message.expiration);
}
