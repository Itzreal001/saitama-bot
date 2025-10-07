export default async function tagAll(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  
  if (!isGroup) {
    await sock.sendMessage(from, { text: '❌ This command only works in groups!' });
    return;
  }

  try {
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;
    const mentions = participants.map(p => p.id);
    
    // Build message with all mentions
    let message = '📢 *Tagging All Group Members* 📢\n\n';
    participants.forEach((participant, index) => {
      message += `${index + 1}. @${participant.id.split('@')[0]}\n`;
    });
    
    await sock.sendMessage(from, { 
      text: message, 
      mentions: mentions 
    });
  } catch (err) {
    await sock.sendMessage(from, { text: `❌ Failed to tag all members: ${err.message}` });
  }
}
