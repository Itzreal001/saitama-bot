/**
 * Auto-Reply System - Respond when owner is away
 */

import fs from 'fs';
import path from 'path';

const AUTO_REPLY_FILE = path.join('data', 'autoreply.json');

function loadAutoReply() {
  try {
    if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
    if (fs.existsSync(AUTO_REPLY_FILE)) {
      return JSON.parse(fs.readFileSync(AUTO_REPLY_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading auto-reply:', error.message);
  }
  return { enabled: false, message: '' };
}

function saveAutoReply(data) {
  try {
    fs.writeFileSync(AUTO_REPLY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving auto-reply:', error.message);
  }
}

export async function setAutoReply(sock, msg) {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  
  const isOwner = msg.key.fromMe;
  if (!isOwner) {
    return await sock.sendMessage(from, { 
      text: '⛔ *Access Denied*\n\nOnly the bot owner can manage auto-reply.' 
    });
  }
  
  const args = text.split(' ').slice(1);
  const action = args[0]?.toLowerCase();
  
  if (action === 'on' || action === 'enable') {
    const replyMsg = args.slice(1).join(' ') || '🤖 I\'m currently away. I\'ll respond as soon as possible!';
    saveAutoReply({ enabled: true, message: replyMsg });
    await sock.sendMessage(from, { 
      text: `✅ *Auto-Reply Enabled*\n\n📝 Message:\n"${replyMsg}"` 
    });
  } 
  else if (action === 'off' || action === 'disable') {
    saveAutoReply({ enabled: false, message: '' });
    await sock.sendMessage(from, { 
      text: '❌ *Auto-Reply Disabled*' 
    });
  } 
  else if (action === 'status') {
    const config = loadAutoReply();
    await sock.sendMessage(from, { 
      text: `📊 *Auto-Reply Status*\n\n${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n${config.enabled ? `📝 Message: "${config.message}"` : ''}` 
    });
  } 
  else {
    await sock.sendMessage(from, { 
      text: '❌ *Invalid Command*\n\nUsage:\n`.autoreply on <message>` - Enable auto-reply\n`.autoreply off` - Disable auto-reply\n`.autoreply status` - Check status' 
    });
  }
}

export async function handleAutoReply(sock, msg) {
  if (msg.key.fromMe) return;
  
  const config = loadAutoReply();
  if (!config.enabled) return;
  
  const from = msg.key.remoteJid;
  
  try {
    await sock.sendMessage(from, { text: config.message });
  } catch (error) {
    console.error('Auto-reply failed:', error.message);
  }
}

export function isAutoReplyEnabled() {
  const config = loadAutoReply();
  return config.enabled;
}
