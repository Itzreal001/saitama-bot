// commands/tagall.js
export default async function tagAll(sock, msg) {
  const groupMetadata = await sock.groupMetadata(msg.from);
  const participants = groupMetadata.participants.map(p => p.id);

  const message = `👥 *Tagging all members of ${groupMetadata.subject}:* \n\n`;
  await sock.sendMessage(msg.from, {
    text: message + participants.map(u => `@${u.split("@")[0]}`).join(" "),
    mentions: participants,
  });
}
