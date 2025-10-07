export default async function antiLink(sock, msg) {
  const from = msg.key.remoteJid;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  
  const linkRegex = /(https?:\/\/)?(www\.)?(discord\.gg|chat\.whatsapp|tiktok\.com|instagram\.com)/gi;

  if (linkRegex.test(text)) {
    try {
      await sock.sendMessage(from, { text: '🚫 Links are not allowed in this group!' });
      await sock.groupParticipantsUpdate(from, [msg.key.participant], 'remove');
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Failed to remove user: ${err.message}` });
    }
  }
}

