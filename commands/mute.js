export default async function muteGroup(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  
  if (!isGroup) {
    await sock.sendMessage(from, { text: '❌ This command only works in groups!' });
    return;
  }

  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  const command = text.toLowerCase();

  try {
    if (command === '.mute') {
      // Mute group - only admins can send messages
      await sock.groupSettingUpdate(from, 'announcement');
      await sock.sendMessage(from, { text: '🔇 *Group Muted!*\n\nOnly admins can send messages now.' });
    } else if (command === '.unmute') {
      // Unmute group - everyone can send messages
      await sock.groupSettingUpdate(from, 'not_announcement');
      await sock.sendMessage(from, { text: '🔊 *Group Unmuted!*\n\nEveryone can send messages now.' });
    }
  } catch (err) {
    await sock.sendMessage(from, { text: `❌ Error: ${err.message}\n\nMake sure the bot is an admin!` });
  }
}
