import chalk from "chalk";

export const groupMenu = async (sock, jid, uptime) => {
  const groupText = `
╭━━━〔 *👥 SAITAMA MD — GROUP MENU* 〕━━━╮
┃ ⚡ *Uptime:* ${uptime}
┃
┃ 🛠️ *.add* _<number>_
┃ ┣➤ Add a member to the group
┃
┃ 🚫 *.kick* _<@tag>_
┃ ┣➤ Remove a user from the group
┃
┃ 📢 *.tagall*
┃ ┣➤ Tag every member
┃
┃ 🧾 *.groupinfo*
┃ ┣➤ Get group info & metadata
┃
┃ 🔒 *.mute / .unmute*
┃ ┣➤ Enable or disable group chat
┃
┃ 🧹 *.clear*
┃ ┗➤ Delete all messages
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

  await sock.sendMessage(jid, { text: groupText });
  console.log(chalk.cyan("[Saitama MD] Group menu sent ✅"));
};
