import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import P from "pino";
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import menu from "./commands/menu.js";
import alive from "./commands/alive.js";
import config from "./config.js";
import { groupMenu } from "./commands/group.js";
import muteGroup from "./commands/mute.js";
import manageMembers from "./commands/manageMembers.js";
import groupInfo from "./commands/groupinfo.js";
import tagAll from "./commands/tagall.js";
import sendLogo from './commands/logo.js';
import { warnUser, checkWarnings } from './commands/warnings.js';
import antiLink from './commands/antilink.js';
import hideTag from './commands/hidetag.js';
import { welcomeMessage, goodbyeMessage } from './commands/welcome.js';
import funGames from './commands/funGames.js';
import downloads from './commands/downloads.js';
import aiSearch from './commands/aiSearch.js';
import { toggleAlwaysOnline, toggleAutoTyping, handlePresence, maintainOnlineStatus } from './commands/presence.js';

// === Bot Banner Display ===
const banner = `
███████╗ █████╗ ██╗████████╗ █████╗ ███╗   ███╗ █████╗ 
██╔════╝██╔══██╗██║╚══██╔══╝██╔══██╗████╗ ████║██╔══██╗
███████╗███████║██║   ██║   ███████║██╔████╔██║███████║
╚════██║██╔══██║██║   ██║   ██╔══██║██║╚██╔╝██║██╔══██║
███████║██║  ██║██║   ██║   ██║  ██║██║ ╚═╝ ██║██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝
              Saitama Bot — Activated ⚡
`;

console.log(chalk.cyanBright(banner));

// === Global Error Handlers ===
process.on('unhandledRejection', (reason, promise) => {
  console.log(chalk.red('❌ Unhandled Promise Rejection:'), reason);
  console.log(chalk.gray('Promise:'), promise);
});

process.on('uncaughtException', (error) => {
  console.log(chalk.red('❌ Uncaught Exception:'), error.message);
  console.log(chalk.gray('Stack:'), error.stack);
});

// === Image Display ===
const imagePath = path.join('assets', 'media', 'logo.jpg');
if (fs.existsSync(imagePath)) {
  console.log(chalk.green('📸 Displaying Saitama Logo...'));
  console.log(chalk.gray(`(Image path: ${imagePath})`));
} else {
  console.log(chalk.red('⚠️ Logo not found in assets/media/logo.jpg'));
}

// === Connection Management ===
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 3000;

function getReconnectDelay() {
  return Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts), 60000);
}

// === Start WhatsApp Connection ===
async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
      auth: state,
      browser: ['Saitama Bot', 'Chrome', '1.0.0'],
      logger: P({ level: 'silent' }),
      syncFullHistory: false,
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000
    });

    sock.ev.on('creds.update', saveCreds);

    // Connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(chalk.yellow('\n📌 Scan this QR code with WhatsApp:\n'));
        qrcode.generate(qr, { small: true });
        console.log(chalk.gray('\nOr use this pairing code: ' + qr));
      }

      if (connection === 'open') {
        console.log(chalk.greenBright('✅ Saitama Bot Connected Successfully!'));
        reconnectAttempts = 0;
      } else if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.error;
        
        console.log(chalk.yellow(`⚠️ Connection closed. Status: ${statusCode}, Reason: ${reason}`));
        
        if (statusCode === 401) {
          console.log(chalk.red('❌ Authentication failed. Please delete auth_info and scan QR again.'));
          return;
        }
        
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log(chalk.red(`❌ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping bot.`));
          return;
        }
        
        reconnectAttempts++;
        const delay = getReconnectDelay();
        console.log(chalk.yellow(`⚠️ Reconnecting in ${delay/1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
        setTimeout(() => startBot(), delay);
      }
    });

  // Welcome / Goodbye events
  sock.ev.on('group-participants.update', async (update) => {
    try {
      for (let participant of update.participants) {
        if (update.action === 'add') await welcomeMessage(sock, { id: participant });
        if (update.action === 'remove') await goodbyeMessage(sock, { id: participant });
      }
    } catch (error) {
      console.log(chalk.red('Error handling group participant update:'), error.message);
    }
  });

  // Store original sendMessage
  const originalSendMessage = sock.sendMessage.bind(sock);
  
  // Override sendMessage with safe timeout-protected version
  sock.sendMessage = async (jid, content, options = {}) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message send timeout')), 30000)
      );
      
      const sendPromise = originalSendMessage(jid, content, options);
      
      return await Promise.race([sendPromise, timeoutPromise]);
    } catch (error) {
      console.log(chalk.red('⚠️ Failed to send message:'), error.message);
      return null;
    }
  };

  // Handle incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      
      if (!msg.message) return;
      
      // Ignore protocol messages, notifications, and status updates
      if (msg.message.protocolMessage || msg.message.senderKeyDistributionMessage) return;
      
      const from = msg.key.remoteJid;
      
      // Debug: Log message info
      console.log(chalk.magenta('📨 Message - fromMe:'), msg.key.fromMe, 'from:', from);
    
    // Extract text from various message types
    const text = 
      msg.message.conversation || 
      msg.message.extendedTextMessage?.text || 
      msg.message.imageMessage?.caption || 
      msg.message.videoMessage?.caption || 
      '';

    console.log(chalk.yellow(`[${from}] ${text}`));
    
    // Skip if no text
    if (!text) {
      console.log(chalk.red('⚠️ No text found in message'));
      return;
    }

    // Check if message is a command
    if (!text.startsWith('.')) return;
    
    // === Commands ===
    switch (true) {
      case text.toLowerCase() === '.menu':
        await menu(sock, from, 'main', msg);
        break;

      case text.toLowerCase() === '.alive':
        await alive(sock, from);
        break;

      case text.toLowerCase() === '.logo':
        await sendLogo(sock, from);
        break;

      case text.toLowerCase() === '.groupmenu':
        await menu(sock, from, 'group', msg);
        break;

      case text.toLowerCase() === '.ping':
        const frames = ['🏓', '🏓🏓', '🏓🏓🏓', '🏓🏓', '🏓', '✅ Pong! Saitama is active!'];
        for (let i = 0; i < frames.length; i++) {
          await sock.sendMessage(from, { text: frames[i] });
          await new Promise(r => setTimeout(r, 300));
        }
        break;

      case text.toLowerCase() === '.alwaysonline':
      case text.toLowerCase() === '.online':
        await toggleAlwaysOnline(sock, msg);
        break;

      case text.toLowerCase() === '.autotyping':
      case text.toLowerCase() === '.typing':
        await toggleAutoTyping(sock, msg);
        break;

      case text.toLowerCase() === '.mute' || text.toLowerCase() === '.unmute':
        await muteGroup(sock, msg);
        break;

      case text.toLowerCase() === '.groupinfo':
        await groupInfo(sock, msg);
        break;

      case text.toLowerCase() === '.tagall':
        await tagAll(sock, msg);
        break;

      case text.toLowerCase().startsWith('.warn'):
        await warnUser(sock, msg);
        break;

      case text.toLowerCase().startsWith('.warnings'):
        await checkWarnings(sock, msg);
        break;

      case text.toLowerCase() === '.hidetag':
        await hideTag(sock, msg);
        break;

      case ['.kick', '.add', '.promote', '.demote', '.ban', '.unban'].includes(text.toLowerCase().split(' ')[0]):
        await manageMembers(sock, msg);
        break;

      case ['.truth', '.dare', '.trivia', '.guess', '.tictactoe'].includes(text.toLowerCase()):
      case text.toLowerCase().startsWith('.spam'):
      case text.toLowerCase().startsWith('.banbug'):
        await funGames(sock, msg);
        break;

      case ['.play', '.song', '.video', '.ytmp4', '.tiktok', '.instagram', '.facebook'].some(cmd => text.toLowerCase().startsWith(cmd)):
        await downloads(sock, msg);
        break;

      case ['.gpt', '.cyberai', '.gemini', '.calculator', '.imagine'].some(cmd => text.toLowerCase().startsWith(cmd)):
        await aiSearch(sock, msg);
        break;
    }

      // Anti-link detection
      if (text.includes('https://') || text.includes('www.')) await antiLink(sock, msg);
    } catch (error) {
      console.log(chalk.red('Error handling message:'), error.message);
    }
  });
  
  } catch (error) {
    console.log(chalk.red('❌ Fatal error in startBot:'), error.message);
    console.log(chalk.gray('Stack:'), error.stack);
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = getReconnectDelay();
      console.log(chalk.yellow(`⚠️ Restarting bot in ${delay/1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
      setTimeout(() => startBot(), delay);
    } else {
      console.log(chalk.red(`❌ Max reconnection attempts reached. Bot stopped.`));
    }
  }
}

startBot();
