import fs from "fs";
import path from "path";
import os from "os";
import config from "../config/config.js";

// 🕓 Format uptime nicely
function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

// 🧠 Main Menu + Group Menu Combined
export default async function menu(sock, remoteJid, type = "main") {
  const runtime = formatUptime(process.uptime());
  const menuImage = path.resolve(config.image);

  // 💬 Menu Templates
  const menus = {
    main: `
╭━━━〔 👊 *ＳＡＩＴＡＭＡ  𝗠𝗗* 👊 〕━━━╮
┃ ⚙️ *Version:* ${config.version}
┃ ⏰ *Uptime:* ${runtime}
┃ 👑 *Owner:* ${config.ownerName}
┃ 🌍 *Platform:* ${os.platform().toUpperCase()}
╰━━━━━━━━━━━━━━━━━━━━╯

┏━━━〔 🧠 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 𝗠𝗘𝗡𝗨 〕━━━┓
┣➤ 💬 .menu
┣➤ ⚡ .alive
┣➤ 🧏‍♂️ .tts
┣➤ 📰 .news
┣➤ ☁️ .weather
┣➤ 💡 .quote
┣➤ 🤣 .joke
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 👥 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨 〕━━━┓
┣➤ 🧑‍🤝‍🧑 .groupmenu
┣➤ 🚫 .ban / .unban
┣➤ 🪄 .promote / .demote
┣➤ 🔇 .mute / .unmute
┣➤ 🧩 .tagall / .hidetag
┣➤ ⚔️ .kick
┣➤ 🌐 .antilink
┣➤ 💬 .welcome / .goodbye
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 🪄 𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦 〕━━━┓
┣➤ 🎲 .truth / .dare
┣➤ ❓ .trivia
┣➤ 🧩 .guess
┣➤ 🕹️ .tictactoe
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 🧭 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗦 〕━━━┓
┣➤ 🎵 .play / .song
┣➤ 🎥 .video / .ytmp4
┣➤ 🌀 .tiktok / .instagram / .facebook
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 🔮 𝗔𝗜 & 𝗦𝗘𝗔𝗥𝗖𝗛 〕━━━┓
┣➤ 🤖 .gpt / .cyberai
┣➤ 💭 .gemini
┣➤ 🧮 .calculator
┣➤ 🌠 .imagine
┗━━━━━━━━━━━━━━━━━━┛

> *「 Saitama MD — The Hero Who Coded Too Hard 」*
`,

    group: `
╭━━━〔 👥 *ＳＡＩＴＡＭＡ  𝗠𝗗 — 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨* 👥 〕━━━╮
┃ ⚙️ *Version:* ${config.version}
┃ ⏰ *Uptime:* ${runtime}
┃ 👑 *Owner:* ${config.ownerName}
┃ 🌍 *Platform:* ${os.platform().toUpperCase()}
╰━━━━━━━━━━━━━━━━━━━━╯

┏━━━〔 🧑‍🤝‍🧑 𝗚𝗥𝗢𝗨𝗣 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧 〕━━━┓
┣➤ 🚫 .ban / .unban — Ban or unban users
┣➤ 🪄 .promote / .demote — Manage admin roles
┣➤ 🔇 .mute / .unmute — Control group chat
┣➤ 🧩 .tagall / .hidetag — Mention all members
┣➤ ⚔️ .kick — Remove member
┣➤ 🌐 .antilink — Block links automatically
┣➤ 💬 .welcome / .goodbye — Custom greetings
┗━━━━━━━━━━━━━━━━━━┛

> *「 Saitama MD — The Hero Who Coded Too Hard 」*
`,
  };

  const selectedMenu = type === "group" ? menus.group : menus.main;

  await sock.sendMessage(remoteJid, {
    image: { url: menuImage },
    caption: selectedMenu,
  });
}
