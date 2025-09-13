import { funnyRandomPhrases } from '../utils/misc.util.js';
import * as waUtil from '../utils/whatsapp.util.js';
import { buildText, messageErrorCommandUsage, uppercaseFirst } from "../utils/general.util.js";
import botTexts from "../helpers/bot.texts.helper.js";
import miscCommands from "./misc.list.commands.js";
import { GroupController } from "../controllers/group.controller.js";
// import { funnyRandomPhrases, frasex } from '../utils/misc.util.js';
import { funnyRandomPhrasesx } from '../utils/misc.util.js';
import { getContentType } from "baileys";
import { downloadMediaMessage } from '@whiskeysockets/baileys';


import path from 'path';
export async function sorteioCommand(client, botInfo, message, group) {
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const chosenNumber = Number(message.text_command);
    if (!chosenNumber || chosenNumber <= 1) {
        throw new Error(miscCommands.sorteio.msgs.error_invalid_value);
    }
    const randomNumber = Math.floor(Math.random() * chosenNumber) + 1;
    const replyText = buildText(miscCommands.sorteio.msgs.reply, randomNumber);
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function sorteiomembroCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    const currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    const randomParticipant = currentParticipantsIds[Math.floor(Math.random() * currentParticipantsIds.length)];
    const replyText = buildText(miscCommands.sorteiomembro.msgs.reply, waUtil.removeWhatsappSuffix(randomParticipant));
    await waUtil.replyWithMentions(client, message.chat_id, replyText, [randomParticipant], message.wa_message, { expiration: message.expiration });
}
export async function mascoteCommand(client, botInfo, message, group) {
    const imagePath = path.resolve('dist/media/mascote.png');
    await waUtil.replyFile(client, message.chat_id, 'imageMessage', imagePath, '🦉Corujito.', message.wa_message, { expiration: message.expiration });
}
/*
export async function simiCommand(client: WASocket, botInfo: Bot, message: Message, group? : Group){
    const miscCommands = commandsMisc(botInfo)

    if (!message.args.length) throw new Error(messageErrorCommandUsage(botInfo.prefix, message))

    const simiResult = await miscLib.simSimi(message.text_command)
    const replyText = buildText(miscCommands.simi.msgs.reply, timestampToDate(Date.now()), simiResult)
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, {expiration: message.expiration})
}*/
export async function viadometroCommand(client, botInfo, message, group) {
    if (!message.isGroupMsg) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted && !message.mentioned.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    else if (message.mentioned.length > 1) {
        throw new Error(miscCommands.viadometro.msgs.error_mention);
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const messageToReply = (message.quotedMessage && message.mentioned.length != 1) ? message.quotedMessage?.wa_message : message.wa_message;
    const replyText = buildText(miscCommands.viadometro.msgs.reply, randomNumber);
    await waUtil.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function detectorCommand(client, botInfo, message, group) {
    if (!message.isGroupMsg) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const quotedMessage = message.quotedMessage?.wa_message;
    if (!quotedMessage) {
        throw new Error(miscCommands.detector.msgs.error_message);
    }
    const imagePathCalibration = path.resolve('dist/media/calibrando.png');
    const imagePathsResult = [
        path.resolve('dist/media/estressealto.png'),
        path.resolve('dist/media/incerteza.png'),
        path.resolve('dist/media/kao.png'),
        path.resolve('dist/media/meengana.png'),
        path.resolve('dist/media/mentiroso.png'),
        path.resolve('dist/media/vaipra.png'),
        path.resolve('dist/media/verdade.png')
    ];
    const randomIndex = Math.floor(Math.random() * imagePathsResult.length);
    const waitReply = miscCommands.detector.msgs.wait;
    await waUtil.replyFile(client, message.chat_id, 'imageMessage', imagePathCalibration, waitReply, quotedMessage, { expiration: message.expiration });
    await waUtil.replyFile(client, message.chat_id, 'imageMessage', imagePathsResult[randomIndex], '', quotedMessage, { expiration: message.expiration });
}
export async function roletarussaCommand(client, botInfo, message, group) {
    const bulletPosition = Math.floor(Math.random() * 6) + 1;
    const currentPosition = Math.floor(Math.random() * 6) + 1;
    const hasShooted = (bulletPosition == currentPosition);
    let replyText;
    if (hasShooted) {
        replyText = miscCommands.roletarussa.msgs.reply_dead;
    }
    else {
        replyText = miscCommands.roletarussa.msgs.reply_alive;
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function casalCommand(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    let currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    if (currentParticipantsIds && currentParticipantsIds.length < 2) {
        throw new Error(miscCommands.casal.msgs.error);
    }
    let randomIndex = Math.floor(Math.random() * currentParticipantsIds.length);
    let chosenParticipant1 = currentParticipantsIds[randomIndex];
    currentParticipantsIds.splice(randomIndex, 1);
    randomIndex = Math.floor(Math.random() * currentParticipantsIds.length);
    let chosenParticipant2 = currentParticipantsIds[randomIndex];
    let replyText = buildText(miscCommands.casal.msgs.reply, waUtil.removeWhatsappSuffix(chosenParticipant1), waUtil.removeWhatsappSuffix(chosenParticipant2));
    await waUtil.sendTextWithMentions(client, message.chat_id, replyText, [chosenParticipant1, chosenParticipant2], { expiration: message.expiration });
}
export async function caracoroaCommand(client, botInfo, message, group) {
    const coinSides = ['cara', 'coroa'];
    const userChoice = message.text_command.toLowerCase();
    if (!message.args.length || !coinSides.includes(userChoice)) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const chosenSide = coinSides[Math.floor(Math.random() * coinSides.length)];
    const imagePath = chosenSide === 'cara' ? path.resolve('dist/media/cara.png') : path.resolve('dist/media/coroa.png');
    const waitText = miscCommands.caracoroa.msgs.wait;
    await waUtil.replyText(client, message.chat_id, waitText, message.wa_message, { expiration: message.expiration });
    const isUserVictory = chosenSide == userChoice;
    let replyText;
    if (isUserVictory) {
        replyText = buildText(miscCommands.caracoroa.msgs.reply_victory, uppercaseFirst(chosenSide));
    }
    else {
        replyText = buildText(miscCommands.caracoroa.msgs.reply_defeat, uppercaseFirst(chosenSide));
    }
    await waUtil.replyFile(client, message.chat_id, 'imageMessage', imagePath, replyText, message.wa_message, { expiration: message.expiration });
}
export async function pptCommand(client, botInfo, message, group) {
    const validChoices = ["pedra", "papel", "tesoura"];
    const userChoice = message.text_command.toLocaleLowerCase();
    const randomIndex = Math.floor(Math.random() * validChoices.length);
    if (!message.args.length || !validChoices.includes(userChoice)) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let botChoice = validChoices[randomIndex];
    let botIconChoice;
    let userIconChoice;
    let isUserVictory;
    if (botChoice == "pedra") {
        botIconChoice = "✊";
        if (userChoice == "pedra")
            userIconChoice = "✊";
        else if (userChoice == "tesoura")
            isUserVictory = false, userIconChoice = "✌️";
        else
            isUserVictory = true, userIconChoice = "✋";
    }
    else if (botChoice == "papel") {
        botIconChoice = "✋";
        if (userChoice == "pedra")
            isUserVictory = false, userIconChoice = "✊";
        else if (userChoice == "tesoura")
            isUserVictory = true, userIconChoice = "✌️";
        else
            userIconChoice = "✋";
    }
    else {
        botIconChoice = "✌️";
        if (userChoice == "pedra")
            isUserVictory = true, userIconChoice = "✊";
        else if (userChoice == "tesoura")
            userIconChoice = "✌️";
        else
            isUserVictory = false, userIconChoice = "✋";
    }
    let replyText;
    if (isUserVictory === true) {
        replyText = buildText(miscCommands.ppt.msgs.reply_victory, userIconChoice, botIconChoice);
    }
    else if (isUserVictory === false) {
        replyText = buildText(miscCommands.ppt.msgs.reply_defeat, userIconChoice, botIconChoice);
    }
    else {
        replyText = buildText(miscCommands.ppt.msgs.reply_draw, userIconChoice, botIconChoice);
    }
    await waUtil.replyText(client, message.chat_id, replyText, message.wa_message, { expiration: message.expiration });
}
export async function gadometroCommand(client, botInfo, message, group) {
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted && !message.mentioned.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    else if (message.mentioned.length > 1) {
        throw new Error(miscCommands.gadometro.msgs.error_mention);
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const messageToReply = (message.quotedMessage && message.mentioned.length != 1) ? message.quotedMessage?.wa_message : message.wa_message;
    const replyText = buildText(miscCommands.gadometro.msgs.reply, randomNumber);
    await waUtil.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function bafometroCommand(client, botInfo, message, group) {
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.isQuoted && !message.mentioned.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    else if (message.mentioned.length > 1) {
        throw new Error(miscCommands.bafometro.msgs.error_mention);
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const messageToReply = (message.quotedMessage && message.mentioned.length != 1) ? message.quotedMessage?.wa_message : message.wa_message;
    const replyText = buildText(miscCommands.bafometro.msgs.reply, randomNumber);
    await waUtil.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function top5Command(client, botInfo, message, group) {
    const groupController = new GroupController();
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    let rankingTheme = message.text_command;
    let currentParticipantsIds = await groupController.getParticipantsIds(group.id);
    if (currentParticipantsIds.length < 5) {
        throw new Error(miscCommands.top5.msgs.error_members);
    }
    let replyText = buildText(miscCommands.top5.msgs.reply_title, rankingTheme);
    let mentionList = [];
    for (let i = 1; i <= 5; i++) {
        let icon;
        switch (i) {
            case 1:
                icon = '🥇';
                break;
            case 2:
                icon = '🥈';
                break;
            case 3:
                icon = '🥉';
                break;
            default:
                icon = '';
        }
        let randomIndex = Math.floor(Math.random() * currentParticipantsIds.length);
        let chosenParticipant = currentParticipantsIds[randomIndex];
        replyText += buildText(miscCommands.top5.msgs.reply_item, icon, i, waUtil.removeWhatsappSuffix(chosenParticipant));
        mentionList.push(chosenParticipant);
        currentParticipantsIds.splice(currentParticipantsIds.indexOf(chosenParticipant), 1);
    }
    await waUtil.sendTextWithMentions(client, message.chat_id, replyText, mentionList, { expiration: message.expiration });
}
export async function parCommand(client, botInfo, message, group) {
    if (!message.isGroupMsg || !group) {
        throw new Error(botTexts.permission.group);
    }
    else if (message.mentioned.length !== 2) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const randomNumber = Math.floor(Math.random() * 100);
    let replyText = buildText(miscCommands.par.msgs.reply, waUtil.removeWhatsappSuffix(message.mentioned[0]), waUtil.removeWhatsappSuffix(message.mentioned[1]), randomNumber);
    await waUtil.sendTextWithMentions(client, message.chat_id, replyText, message.mentioned, { expiration: message.expiration });
}
export async function chanceCommand(client, botInfo, message, group) {
    if (!message.args.length) {
        throw new Error(messageErrorCommandUsage(botInfo.prefix, message));
    }
    const randomNumber = Math.floor(Math.random() * 100);
    const replyText = buildText(miscCommands.chance.msgs.reply, randomNumber, message.text_command);
    const messageToReply = (message.isQuoted && message.quotedMessage) ? message.quotedMessage?.wa_message : message.wa_message;
    await waUtil.replyText(client, message.chat_id, replyText, messageToReply, { expiration: message.expiration });
}
export async function fraseCommand(client, botInfo, message, group) {
    const phraseResult = await funnyRandomPhrases();
    const replyText = buildText(miscCommands.frase.msgs.reply, phraseResult);
    const imagePath = path.resolve('dist/media/frasewhatsappjr.png');
    await waUtil.replyFile(client, message.chat_id, 'imageMessage', imagePath, replyText, message.wa_message, { expiration: message.expiration });
}
export async function frasexCommand(client, botInfo, message, group) {
    const phraseResult = await funnyRandomPhrasesx();
    const replyText = buildText(miscCommands.frasex.msgs.reply, phraseResult);
    const imagePath = path.resolve('dist/media/frasex.png');
    await waUtil.replyFile(client, message.chat_id, 'imageMessage', imagePath, replyText, message.wa_message, { expiration: message.expiration });
}



export async function revelarCommand(client, botInfo, message, group) {
    const remoteJid = message.chat_id;

    // Verifica se há mensagem citada
    if (!message.isQuoted || !message.quotedMessage) {
        await waUtil.replyText(client, remoteJid, "❗ Você precisa citar uma mensagem de visualização única para revelá-la.", message.wa_message);
        return;
    }

    const quotedMsg = message.quotedMessage.wa_message?.message;
    console.log("DEBUG quotedMsg structure:", Object.keys(quotedMsg || {}));

    // Verifica se é uma mensagem viewOnce ou já é a mídia revelada
    let mediaMessage = null;
    let mediaType = "";

    // Caso 1: É uma mensagem viewOnce encapsulada
    if (quotedMsg?.viewOnceMessage) {
        mediaMessage = quotedMsg.viewOnceMessage.message;
    } else if (quotedMsg?.viewOnceMessageV2) {
        mediaMessage = quotedMsg.viewOnceMessageV2.message;
    } else if (quotedMsg?.viewOnceMessageV2Extension) {
        mediaMessage = quotedMsg.viewOnceMessageV2Extension.message;
    } 
    // Caso 2: Já é a mídia diretamente (como no seu debug)
    else {
        mediaMessage = quotedMsg;
    }

    // Determina o tipo de mídia
    if (mediaMessage?.imageMessage) {
        mediaType = "image";
        mediaMessage = mediaMessage.imageMessage;
    } else if (mediaMessage?.videoMessage) {
        mediaType = "video";
        mediaMessage = mediaMessage.videoMessage;
    } else {
        await waUtil.replyText(client, remoteJid, "❗ A mensagem citada não é de visualização única ou formato não suportado.", message.wa_message);
        return;
    }

    console.log("DEBUG mediaType:", mediaType);
    console.log("DEBUG mediaMessage keys:", Object.keys(mediaMessage));

    try {
        // Download da mídia usando a função correta do Baileys
        const buffer = await downloadMediaMessage(
            {
                key: message.quotedMessage.wa_message.key,
                message: {
                    [mediaType + "Message"]: mediaMessage
                }
            },
            "buffer",
            {}
        );

        if (!buffer) {
            await waUtil.replyText(client, remoteJid, "❗ Falha ao fazer o download da mídia.", message.wa_message);
            return;
        }

        const caption = mediaType === "image" 
            ? "🔓 *Imagem de visualização única revelada*" 
            : "🔓 *Vídeo de visualização única revelado*";

        // Envia a mídia revelada
        await client.sendMessage(remoteJid, {
            [mediaType]: buffer,
            caption: caption,
            mentions: []
        }, { quoted: message.wa_message });

        console.log("[SUCESSO] Mídia de visualização única revelada!");

    } catch (err) {
        console.error("[ERRO] Falha no comando revelar:", err);
        
        // Tenta método alternativo se o primeiro falhar
        try {
            // Método alternativo: usar a URL diretamente
            if (mediaMessage.url) {
                await client.sendMessage(remoteJid, {
                    [mediaType]: { url: mediaMessage.url },
                    caption: "🔓 *Mídia de visualização única revelada (via URL)*",
                    mentions: []
                }, { quoted: message.wa_message });
            } else {
                throw new Error("URL não disponível");
            }
        } catch (fallbackErr) {
            console.error("[ERRO] Método alternativo também falhou:", fallbackErr);
            await waUtil.replyText(client, remoteJid, "❗ Houve um erro ao tentar revelar a mensagem.", message.wa_message);
        }
    }
}

export async function euviCommand(client, botInfo, message, group) {
    const remoteJid = message.chat_id;
    const adminJid = "seu_numero_de_admin@c.us"; // Substitua pelo JID do admin

    // Verifica se há mensagem com mídia
    if (!message.wa_message?.message) {
        // Não envia resposta para o usuário, só loga
        console.log("[EUVI] Nenhuma mensagem com mídia encontrada");
        return;
    }

    const msgContent = message.wa_message.message;
    let mediaType = "";
    let mediaMessage = null;

    // Detecta o tipo de mídia
    if (msgContent.imageMessage) {
        mediaType = "image";
        mediaMessage = msgContent.imageMessage;
    } else if (msgContent.videoMessage) {
        mediaType = "video";
        mediaMessage = msgContent.videoMessage;
    } else if (msgContent.documentMessage) {
        mediaType = "document";
        mediaMessage = msgContent.documentMessage;
    } else if (msgContent.audioMessage) {
        mediaType = "audio";
        mediaMessage = msgContent.audioMessage;
    } else if (msgContent.stickerMessage) {
        mediaType = "sticker";
        mediaMessage = msgContent.stickerMessage;
    } else {
        console.log("[EUVI] Nenhuma mídia detectada na mensagem");
        return;
    }

    console.log(`[EUVI] Mídia detectada: ${mediaType}`);

    try {
        // Baixa a mídia
        const buffer = await downloadMediaMessage(
            {
                key: message.wa_message.key,
                message: { [mediaType + "Message"]: mediaMessage }
            },
            "buffer",
            {}
        );

        if (!buffer) {
            console.log("[EUVI] Falha ao baixar a mídia");
            return;
        }

        // Prepara informações do remetente
        const senderInfo = `👤 *Remetente:* ${message.push_name || 'Desconhecido'}\n` +
                          `📞 *Número:* ${message.sender_id}\n` +
                          `💬 *Chat:* ${group?.name || 'Privado'}\n` +
                          `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}`;

        // Envia para o admin SILENCIOSAMENTE
        await client.sendMessage(adminJid, {
            [mediaType]: buffer,
            caption: `📥 *Mídia Recebida*\n\n${senderInfo}`,
            mentions: []
        });

        console.log(`[EUVI] Mídia enviada para admin com sucesso: ${mediaType}`);

    } catch (err) {
        console.error("[EUVI] Erro ao processar mídia:", err);
        
        // Tenta método alternativo com URL se disponível
        try {
            if (mediaMessage.url) {
                await client.sendMessage(adminJid, {
                    [mediaType]: { url: mediaMessage.url },
                    caption: `📥 *Mídia Recebida (via URL)*\n\n👤 De: ${message.sender_id}`,
                    mentions: []
                });
                console.log("[EUVI] Mídia enviada via URL alternativa");
            }
        } catch (fallbackErr) {
            console.error("[EUVI] Método alternativo também falhou:", fallbackErr);
        }
    }
}



