/**
 * Reminder System - Set timed reminders
 */

import fs from 'fs';
import path from 'path';

const REMINDERS_FILE = path.join('data', 'reminders.json');
const activeReminders = new Map();

function loadReminders() {
  try {
    if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
    if (fs.existsSync(REMINDERS_FILE)) {
      return JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading reminders:', error.message);
  }
  return [];
}

function saveReminders(reminders) {
  try {
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
  } catch (error) {
    console.error('Error saving reminders:', error.message);
  }
}

export function initReminders(sock) {
  const reminders = loadReminders();
  const now = Date.now();
  
  reminders.forEach(reminder => {
    if (reminder.time > now) {
      scheduleReminder(sock, reminder);
    }
  });
  
  const activeCount = reminders.filter(r => r.time > now).length;
  console.log(`✅ Loaded ${activeCount} active reminders`);
}

function scheduleReminder(sock, reminder) {
  const delay = reminder.time - Date.now();
  
  if (delay <= 0) return;
  
  const timeoutId = setTimeout(async () => {
    try {
      await sock.sendMessage(reminder.chatJid, { 
        text: `⏰ *REMINDER*\n\n📝 ${reminder.message}\n\n_Set ${formatTimeDiff(reminder.setTime)}_` 
      });
      
      const reminders = loadReminders();
      const filtered = reminders.filter(r => r.id !== reminder.id);
      saveReminders(filtered);
      activeReminders.delete(reminder.id);
    } catch (error) {
      console.error('Failed to send reminder:', error.message);
    }
  }, delay);
  
  activeReminders.set(reminder.id, timeoutId);
}

function formatTimeDiff(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export async function setReminder(sock, msg) {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  
  const match = text.match(/^\.remind(?:er)?\s+(\d+)([smhd])\s+(.+)$/i);
  
  if (!match) {
    return await sock.sendMessage(from, { 
      text: '❌ *Invalid Format*\n\nUsage: `.remind <time><unit> <message>`\n\nExamples:\n`.remind 30s Check the oven`\n`.remind 5m Meeting starts`\n`.remind 2h Take a break`\n`.remind 1d Pay bills`\n\nUnits: s=seconds, m=minutes, h=hours, d=days' 
    });
  }
  
  const [, amount, unit, message] = match;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const delay = parseInt(amount) * multipliers[unit.toLowerCase()];
  
  if (delay < 1000 || delay > 7 * 86400000) {
    return await sock.sendMessage(from, { 
      text: '❌ *Invalid Time*\n\nReminder must be between 1 second and 7 days.' 
    });
  }
  
  const reminder = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    chatJid: from,
    message: message.trim(),
    time: Date.now() + delay,
    setTime: Date.now()
  };
  
  const reminders = loadReminders();
  reminders.push(reminder);
  saveReminders(reminders);
  
  scheduleReminder(sock, reminder);
  
  const timeStr = `${amount}${unit}`;
  await sock.sendMessage(from, { 
    text: `✅ *Reminder Set*\n\n⏰ Time: ${timeStr}\n📝 Message: "${message}"\n\nI'll remind you!` 
  });
}

export async function listReminders(sock, msg) {
  const from = msg.key.remoteJid;
  const reminders = loadReminders().filter(r => r.chatJid === from && r.time > Date.now());
  
  if (reminders.length === 0) {
    return await sock.sendMessage(from, { 
      text: '📭 *No Active Reminders*\n\nSet one with `.remind <time> <message>`' 
    });
  }
  
  let list = '⏰ *Your Active Reminders*\n\n';
  reminders.forEach((r, i) => {
    const timeLeft = r.time - Date.now();
    const minutes = Math.ceil(timeLeft / 60000);
    list += `${i + 1}. "${r.message}"\n   ⏱️ In ${minutes} minute${minutes !== 1 ? 's' : ''}\n\n`;
  });
  
  await sock.sendMessage(from, { text: list });
}
