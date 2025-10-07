// Store presence states
let alwaysOnline = false;  // Disabled - only auto typing is active
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
    try {
      await sock.sendPresenceUpdate('composing', from);
      // Stop typing after 3 seconds
      setTimeout(async () => {
        try {
          await sock.sendPresenceUpdate('paused', from);
        } catch (error) {
          // Silently fail if connection is not ready
        }
      }, 3000);
    } catch (error) {
      // Silently fail if connection is not ready
    }
  }
}

export async function maintainOnlineStatus(sock) {
  if (alwaysOnline) {
    try {
      await sock.sendPresenceUpdate('available');
    } catch (error) {
      // Silently fail if connection is not ready
      throw error; // Re-throw to be caught by interval handler
    }
  }
}

export function getPresenceStatus() {
  return { alwaysOnline, autoTyping };
}
