const wa = require("@open-wa/wa-automate");
const { create, decryptMedia, ev } = wa;
const { default: PQueue } = require("p-queue");
const fs = require("fs");
const express = require("express");

const helpOnInPM = ["hello", "hi", "hii", "hey", "heyy", "#help", "#menu"];
const helpOnInGroup = ["#help", "#menu"];

const helpText =
  process.env.HELP_TEXT ||
  `                        *COMMANDS*:

*#sticker*:write in caption of a image/video/gif to turn it into sticker


*#spam*: tag everyone in a message in a group (only works in a group)
       (If you don't want soomeone to spam then write *#nospam* in group description)

*#join https://chat.whatsapp.com/abcdefg*: to invite me into a group


*#leave*: i hope you don't use this (only works in a group if sent by an admin)


*#help*: to recive command list or to check if iam still alive


MAADARCHOD zyada spam mat karna (don't spam excessively)
BOT would crash if someone spams commands, if it crashes wait for some time 
SUNN LIYAAAA, AB MAAA CHUDA

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
            `\nHEHE NOOOOB @${
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
