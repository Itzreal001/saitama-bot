export default async function groupInfo(sock, msg) {
  const from = msg.key.remoteJid;

  try {
    const metadata = await sock.groupMetadata(from);
    const owner = metadata.owner || 'Unknown';
    const participants = metadata.participants.map(p => p.id.split('@')[0]).join(', ');

    await sock.sendMessage(from, {
      text: `📋 *Group Info*\n\n👥 Name: ${metadata.subject}\n🆔 ID: ${metadata.id}\n👑 Owner: ${owner}\n🧍‍♂️ Participants: ${participants}`,
    });
  } catch (err) {
    await sock.sendMessage(from, { text: `❌ Could not fetch group info: ${err.message}` });
  }
}
