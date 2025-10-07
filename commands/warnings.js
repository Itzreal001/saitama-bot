import fs from 'fs';
import path from 'path';

const dataDir = 'data';
const warningsFile = path.join(dataDir, 'warnings.json');

// Ensure data directory and warnings storage exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(warningsFile)) fs.writeFileSync(warningsFile, JSON.stringify({}));

export async function warnUser(sock, msg) {
  const from = msg.key.remoteJid;
  const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned || mentioned.length === 0) return await sock.sendMessage(from, { text: '❌ Mention a user to warn!' });

  const data = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));

  for (let user of mentioned) {
    if (!data[from]) data[from] = {};
    if (!data[from][user]) data[from][user] = 0;
    data[from][user] += 1;

    await sock.sendMessage(from, { text: `⚠️ <@${user.split('@')[0]}> has been warned! Total warnings: ${data[from][user]}` });
  }

  fs.writeFileSync(warningsFile, JSON.stringify(data, null, 2));
}

export async function checkWarnings(sock, msg) {
  const from = msg.key.remoteJid;
  const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const data = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));

  if (!mentioned || mentioned.length === 0) {
    return await sock.sendMessage(from, { text: '❌ Mention a user to check warnings!' });
  }

  for (let user of mentioned) {
    const count = data[from]?.[user] || 0;
    await sock.sendMessage(from, { text: `⚠️ <@${user.split('@')[0]}> has ${count} warning(s)` });
  }
}
