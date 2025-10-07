import fs from 'fs';
import path from 'path';

const dataDir = 'data';
const warningsFile = path.join(dataDir, 'warnings.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(warningsFile)) fs.writeFileSync(warningsFile, JSON.stringify({}));
  } catch (error) {
    console.error('Error creating warnings data file:', error.message);
  }
}

function loadWarnings() {
  try {
    ensureDataFile();
    const content = fs.readFileSync(warningsFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading warnings, resetting file:', error.message);
    fs.writeFileSync(warningsFile, JSON.stringify({}));
    return {};
  }
}

function saveWarnings(data) {
  try {
    fs.writeFileSync(warningsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving warnings:', error.message);
    throw error;
  }
}

export async function warnUser(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) return await sock.sendMessage(from, { text: '❌ Mention a user to warn!' });

    const data = loadWarnings();

    for (let user of mentioned) {
      if (!data[from]) data[from] = {};
      if (!data[from][user]) data[from][user] = 0;
      data[from][user] += 1;

      await sock.sendMessage(from, { text: `⚠️ <@${user.split('@')[0]}> has been warned! Total warnings: ${data[from][user]}` });
    }

    saveWarnings(data);
  } catch (error) {
    console.error('Error in warnUser:', error.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to warn user. Please try again.' });
  }
}

export async function checkWarnings(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    
    if (!mentioned || mentioned.length === 0) {
      return await sock.sendMessage(from, { text: '❌ Mention a user to check warnings!' });
    }

    const data = loadWarnings();

    for (let user of mentioned) {
      const count = data[from]?.[user] || 0;
      await sock.sendMessage(from, { text: `⚠️ <@${user.split('@')[0]}> has ${count} warning(s)` });
    }
  } catch (error) {
    console.error('Error in checkWarnings:', error.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to check warnings. Please try again.' });
  }
}
