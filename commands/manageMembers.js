// commands/manageMembers.js
export default async function manageMembers(sock, msg) {
  const isAdd = msg.body.startsWith(".add");
  const isKick = msg.body.startsWith(".kick");

  const target = msg.body.split(" ")[1]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  if (!target) return await sock.sendMessage(msg.from, { text: "⚠️ Please mention or include a valid number." });

  if (isAdd) {
    await sock.groupParticipantsUpdate(msg.from, [target], "add");
    await sock.sendMessage(msg.from, { text: `✅ Added @${target.split("@")[0]}`, mentions: [target] });
  } else if (isKick) {
    await sock.groupParticipantsUpdate(msg.from, [target], "remove");
    await sock.sendMessage(msg.from, { text: `👢 Kicked @${target.split("@")[0]}`, mentions: [target] });
  }
}
