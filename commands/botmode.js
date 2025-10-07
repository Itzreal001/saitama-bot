import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join('data', 'bot_state.json');

// Load bot state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log(chalk.red('Error loading bot state:'), error.message);
  }
  return { privateMode: false, ownerJid: null, sudoUsers: [] };
}

// Save bot state
function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.log(chalk.red('Error saving bot state:'), error.message);
  }
}

// Get normalized JID (remove device suffix)
export function getNormalizedJid(jid) {
  if (!jid) return null;
  return jid.split(':')[0];
}

// Check if user is owner
export function isOwner(userJid) {
  const state = loadState();
  if (!state.ownerJid) return false;
  
  const normalizedUser = getNormalizedJid(userJid);
  const normalizedOwner = getNormalizedJid(state.ownerJid);
  
  // Also check if the user number matches the owner number (handle different JID formats)
  const userNumber = normalizedUser.split('@')[0];
  const ownerNumber = normalizedOwner.split('@')[0];
  
  return normalizedUser === normalizedOwner || userNumber === ownerNumber;
}

// Check if user is sudo
export function isSudo(userJid) {
  const state = loadState();
  const normalizedUser = getNormalizedJid(userJid);
  return state.sudoUsers.some(sudo => getNormalizedJid(sudo) === normalizedUser);
}

// Check if user has access
export function hasAccess(userJid) {
  const state = loadState();
  if (!state.privateMode) return true; // Public mode - everyone has access
  return isOwner(userJid) || isSudo(userJid);
}

// Initialize owner from socket
export function initializeOwner(sock) {
  const state = loadState();
  if (!state.ownerJid && sock.user && sock.user.id) {
    state.ownerJid = getNormalizedJid(sock.user.id);
    saveState(state);
    console.log(chalk.green(`✅ Bot owner initialized: ${state.ownerJid}`));
  }
}

// Set private mode
export async function setPrivateMode(sock, msg, enablePrivate) {
  const from = msg.key.remoteJid;
  const userJid = msg.key.participant || msg.key.remoteJid;
  
  if (!isOwner(userJid)) {
    await sock.sendMessage(from, { 
      text: '⛔ *Access Denied*\n\n🔐 Only my supreme master can control my privacy settings.\n\n_You dare challenge the authority of Saitama?_ 💪' 
    });
    return;
  }
  
  const state = loadState();
  state.privateMode = enablePrivate;
  saveState(state);
  
  if (enablePrivate) {
    await sock.sendMessage(from, { 
      text: '🔒 *PRIVATE MODE ACTIVATED*\n\n⚡ The bot is now in exclusive mode.\n\nOnly authorized users can use my commands.\n\n_The power is now restricted..._ 🛡️' 
    });
  } else {
    await sock.sendMessage(from, { 
      text: '🌐 *PUBLIC MODE ACTIVATED*\n\n⚡ The bot is now open to everyone.\n\nAll users can freely use my commands.\n\n_The power flows freely once more..._ ✨' 
    });
  }
}

// Get access denied message
export function getAccessDeniedMessage() {
  const messages = [
    '⛔ *ACCESS DENIED*\n\n🔐 This bot is currently in *PRIVATE MODE*.\n\nOnly my supreme master has the authority to command me.\n\n_You shall not pass..._ ⚔️',
    '⛔ *HALT!*\n\n🛡️ I serve only one master in private mode.\n\n_Your commands fall on deaf ears..._ 👊',
    '⛔ *RESTRICTED ACCESS*\n\n⚡ The bot is locked for unauthorized users.\n\nMy master alone holds the key.\n\n_Know your place..._ 💥'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Get current mode status
export function getModeStatus() {
  const state = loadState();
  return state.privateMode ? '🔒 Private Mode' : '🌐 Public Mode';
}

// Add sudo user
export async function addSudoUser(sock, msg) {
  const from = msg.key.remoteJid;
  const userJid = msg.key.participant || msg.key.remoteJid;
  
  if (!isOwner(userJid)) {
    await sock.sendMessage(from, { 
      text: '⛔ *Access Denied*\n\nOnly the bot owner can add sudo users.' 
    });
    return;
  }
  
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) {
    await sock.sendMessage(from, { 
      text: '❌ Please mention a user to add as sudo.\n\n*Example:* .sudo @user' 
    });
    return;
  }
  
  const state = loadState();
  const normalizedJid = getNormalizedJid(mentionedJid);
  
  if (state.sudoUsers.includes(normalizedJid)) {
    await sock.sendMessage(from, { 
      text: '✅ User is already a sudo user.' 
    });
    return;
  }
  
  state.sudoUsers.push(normalizedJid);
  saveState(state);
  
  await sock.sendMessage(from, { 
    text: `✅ *Sudo Access Granted*\n\n🔐 User has been elevated to sudo status.\n\nThey can now use commands even in private mode.` 
  });
}
