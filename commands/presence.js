// Store presence states
let alwaysOnline = true;  // Enabled by default - bot always appears online
let autoTyping = true;     // Enabled by default - shows typing when receiving messages

export async function toggleAlwaysOnline(sock, msg) {
  const from = msg.key.remoteJid;
  alwaysOnline = !alwaysOnline;
  
  if (alwaysOnline) {
    await sock.sendMessage(from, { text: '✅ *Always Online Mode: ENABLED*\n\nBot will appear online at all times.' });
  } else {
    await sock.sendMessage(from, { text: '❌ *Always Online Mode: DISABLED*\n\nBot status will return to normal.' });
  }
}

export async function toggleAutoTyping(sock, msg) {
  const from = msg.key.remoteJid;
  autoTyping = !autoTyping;
  
  if (autoTyping) {
    await sock.sendMessage(from, { text: '✅ *Auto Typing Mode: ENABLED*\n\nBot will show typing indicator on incoming messages.' });
  } else {
    await sock.sendMessage(from, { text: '❌ *Auto Typing Mode: DISABLED*\n\nTyping indicator will return to normal.' });
  }
}

export async function handlePresence(sock, from) {
  // Send typing indicator if auto typing is enabled
  if (autoTyping && from) {
    await sock.sendPresenceUpdate('composing', from);
    // Stop typing after 3 seconds
    setTimeout(async () => {
      await sock.sendPresenceUpdate('paused', from);
    }, 3000);
  }
}

export async function maintainOnlineStatus(sock) {
  if (alwaysOnline) {
    await sock.sendPresenceUpdate('available');
  }
}

export function getPresenceStatus() {
  return { alwaysOnline, autoTyping };
}
