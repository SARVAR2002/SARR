const wa = require("@open-wa/wa-automate");
const { create, decryptMedia, ev } = wa;
const { default: PQueue } = require("p-queue");
const fs = require("fs");
const express = require("express");

const helpOnInPM = ["hello", "hi", "hii", "hey", "heyy", "#help", "#menu"];
const helpOnInGroup = ["#help", "#menu"];

const helpText =
  process.env.HELP_TEXT ||
  `Commands:
#sticker: write in caption of a image/video/gif to turn it into sticker
#spam: tag everyone in a message in a group (only works in a group)
#join https://chat.whatsapp.com/shdkashdh: joing a group with invite link
#leave: i hope you don't use this (only works in a group if sent by an admin)
#help: to recive this same message
#menu: same as help but some people prefer it
maadarchod zyada spam mat karna (don't spam excessively , that would give this bot a heartattack)
Add '#nospam' in group description to stop spam commands 
BOT would crash if someone spams commands, if it crashes wait for some time :)

`;

const leaveText =
  process.env.LEAVE_TEXT ||
  "GAYA KHATAM TATA BYE BYE GOODBYE GAYA                                    ALLAHUAKBARRRRRRRR💣💥 ";

const server = express();
const PORT = parseInt(process.env.PORT) || 3000;
const queue = new PQueue({
  concurrency: 2,
  autoStart: false,
});
/**
 * WA Client
 * @type {null | import("@open-wa/wa-automate").Client}
 */
let cl = null;

/**
 * Process the message
 * @param {import("@open-wa/wa-automate").Message} message
 */
async function procMess(message) {
  if (message.type === "chat") {
    if (
      message.isGroupMsg &&
      helpOnInGroup.includes(message.body.toLowerCase())
    ) {
      await cl.sendText(message.from, helpText);
    } else if (
      !message.isGroupMsg &&
      helpOnInPM.includes(message.body.toLowerCase())
    ) {
      await cl.sendText(message.from, helpText);
    } else if (message.isGroupMsg && message.body.toLowerCase() === "#spam") {
      if (
        message.chat.groupMetadata.desc &&
        message.chat.groupMetadata.desc.includes("#nospam")
      ) {
        await cl.sendText(message.chatId, "Spam protected group");
      } else {
        const text = `HELLOOOOOOOOO BC ${message.chat.groupMetadata.participants.map(
          (participant) =>
            `\n😃 @${
              typeof participant.id === "string"
                ? participant.id.split("@")[0]
                : participant.user
            }`
        )}`;
        await cl.sendTextWithMentions(message.chatId, text);
      }
    } else if (message.body.startsWith("#join https://chat.whatsapp.com/")) {
      await cl.joinGroupViaLink(message.body);
      await cl.reply(message.chatId, "Joined group", message.id);
    } else if (message.body.toLowerCase() === "#nospam") {
      await cl.reply(
        message.chatId,
        "Add #nospam in group description",
        message.id
      );
    } else if (message.isGroupMsg && message.body.toLowerCase() === "#leave") {
      const user = message.chat.groupMetadata.participants.find(
        (pat) => pat.id === message.author
      );
      if (user && user.isAdmin) {
        await cl.sendText(message.chatId, leaveText);
        await cl.leaveGroup(message.chat.id);
      } else {
        await cl.reply(message.chatId, "You're not an admin coz you are ugly ,LOLLLLLLLL!         (BHAKK MAADARCHOD)", message.id);
      }
    }
  } else if (
    ["image", "video"].includes(message.type) &&
    message.caption === "#sticker"
  ) {
    await cl.sendText(message.chatId, "Processing sticker(BANN RAHA H BSDK RUK JAA)");
    const mediaData = await decryptMedia(message);
    const dataUrl = `data:${message.mimetype};base64,${mediaData.toString(
      "base64"
    )}`;
    message.type === "image" &&
      (await cl.sendImageAsSticker(message.chatId, dataUrl, message.id));
    message.type === "video" &&
      (await cl.sendMp4AsSticker(message.chatId, dataUrl));
  }
}

/**
 * Add message to process queue
 */
	case 'tts':
		if (!isRegistered) return await benny.reply(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n#daftar`, id)
            if (args.length === 1) return benny.reply(from, 'Kirim perintah *#tts [id, en, jp, ar] [teks]*, contoh *#tts id halo semua*')
            benny.reply(from, mess.wait, id)
			const ttsId = require('node-gtts')('id')
            const ttsEn = require('node-gtts')('en')
	    const ttsJp = require('node-gtts')('ja')
            const ttsAr = require('node-gtts')('ar')
            const dataText = body.slice(8)
            if (dataText === '') return benny.reply(from, 'Baka?', id)
            if (dataText.length > 65536) return benny.reply(from, 'Teks terlalu panjang!', id)
            var dataBhs = body.slice(5, 7)
	    if (dataBhs == 'id') {
                ttsId.save('./media/tts/resId.mp3', dataText, function () {
                    benny.sendPtt(from, './media/tts/resId.mp3', id)
                })
            } else if (dataBhs == 'en') {
                ttsEn.save('./media/tts/resEn.mp3', dataText, function () {
                    benny.sendPtt(from, './media/tts/resEn.mp3', id)
                })
            } else if (dataBhs == 'jp') {
                ttsJp.save('./media/tts/resJp.mp3', dataText, function () {
                    benny.sendPtt(from, './media/tts/resJp.mp3', id)
                })
	    } else if (dataBhs == 'ar') {
                ttsAr.save('./media/tts/resAr.mp3', dataText, function () {
                    benny.sendPtt(from, './media/tts/resAr.mp3', id)
                })
            } else {
                benny.reply(from, 'Masukkan data bahasa : [id] untuk indonesia, [en] untuk inggris, [jp] untuk jepang, dan [ar] untuk arab', id)
            }
const processMessage = (message) =>
  queue.add(async () => {
    try {
      procMess(message);
    } catch (e) {
      console.error(e);
    }
  });

/**
 * Initialize client
 * @param {import("@open-wa/wa-automate").Client} client
 */
async function start(client) {
  cl = client;
  queue.start();
  const unreadMessages = await client.getAllUnreadMessages();
  unreadMessages.forEach(processMessage);
  client.onMessage(processMessage);
}

ev.on("qr.**", async (qrcode) => {
  const imageBuffer = Buffer.from(
    qrcode.replace("data:image/png;base64,", ""),
    "base64"
  );
  fs.writeFileSync("./public/qr_code.png", imageBuffer);
});

create({
  qrTimeout: 0,
  cacheEnabled: false,
}).then((client) => start(client));

server.use(express.static("public"));
server.listen(PORT, () =>
  console.log(`> Listining on http://localhost:${PORT}`)
);

process.on("exit", () => {
  if (fs.existsSync("./session.data.json")) {
    fs.unlinkSync("./session.data.json");
  }
});
