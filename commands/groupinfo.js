// commands/groupinfo.js
export default async function groupInfo(sock, msg) {
  const metadata = await sock.groupMetadata(msg.from);
  const admins = metadata.participants.filter(p => p.admin).map(p => `@${p.id.split("@")[0]}`);

  const info = `
╭━━━〔 👥 *GROUP INFO* 〕━━━╮
┃ 📛 *Name:* ${metadata.subject}
┃ 🆔 *ID:* ${metadata.id}
┃ 👥 *Members:* ${metadata.participants.length}
┃ 🧑‍💼 *Admins:* ${admins.join(", ") || "None"}
┃ 📜 *Description:* ${metadata.desc || "No description"}
╰━━━━━━━━━━━━━━━━━━━━╯
`;

  await sock.sendMessage(msg.from, {
    text: info,
    mentions: metadata.participants.map(p => p.id),
  });
}
