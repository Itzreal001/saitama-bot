export default async function manageMembers(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  if (!isGroup) return;

  const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
  const args = text.split(' ');

  const command = args[0].toLowerCase();
  const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentioned || mentioned.length === 0) {
    await sock.sendMessage(from, { text: '❌ Please mention the user(s).' });
    return;
  }

  try {
    switch (command) {
      case '.kick':
        for (let user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'remove');
        await sock.sendMessage(from, { text: '✅ User(s) kicked!' });
        break;

      case '.add':
        for (let user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'add');
        await sock.sendMessage(from, { text: '✅ User(s) added!' });
        break;

      case '.promote':
        for (let user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'promote');
        await sock.sendMessage(from, { text: '✅ User(s) promoted!' });
        break;

      case '.demote':
        for (let user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'demote');
        await sock.sendMessage(from, { text: '✅ User(s) demoted!' });
        break;

      case '.ban':
        // Ban can be implemented via kick and tracking banned users
        for (let user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'remove');
        await sock.sendMessage(from, { text: '⛔ User(s) banned!' });
        break;

      case '.unban':
        // Unban is similar to .add
        for (let user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'add');
        await sock.sendMessage(from, { text: '✅ User(s) unbanned!' });
        break;
    }
  } catch (err) {
    await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
  }
}
