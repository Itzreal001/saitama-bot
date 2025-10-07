export default async function hideTag(sock, msg) {
  const from = msg.key.remoteJid;
  try {
    const metadata = await sock.groupMetadata(from);
    const mentions = metadata.participants.map(p => p.id);
    await sock.sendMessage(from, { text: '📢 Attention everyone!', mentions });
  } catch (err) {
    await sock.sendMessage(from, { text: `❌ Failed to hidetag: ${err.message}` });
  }
}
