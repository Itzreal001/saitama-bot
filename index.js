import makeWASocket, { useSingleFileAuthState } from '@whiskeysockets/baileys';
import P from "pino";
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import menu from "./commands/menu.js";
import alive from "./commands/alive.js";
import config from "./config/config.js";
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
import funGames from './commands/fungames.js';
import downloads from './commands/downloads.js';
import aiSearch from './commands/aiSearch.js';

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

// === Image Display ===
const imagePath = path.join('assets', 'media', 'logo.jpg');
if (fs.existsSync(imagePath)) {
  console.log(chalk.green('📸 Displaying Saitama Logo...'));
  console.log(chalk.gray(`(Image path: ${imagePath})`));
} else {
  console.log(chalk.red('⚠️ Logo not found in assets/media/logo.jpg'));
}

// === Start WhatsApp Connection ===
async function startBot() {
  const { state, saveCreds } = await useSingleFileAuthState('auth_info.json');

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: ['Saitama Bot', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  // Connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('📌 Scan this QR or save this login code:'));
      console.log(qr); // login code
    }

    if (connection === 'open') {
      console.log(chalk.greenBright('✅ Saitama Bot Connected Successfully!'));
    } else if (connection === 'close') {
      console.log(chalk.red('❌ Connection closed, reconnecting...'));
      startBot(); // auto-reconnect
    }
  });

  // Welcome / Goodbye events
  sock.ev.on('group-participants.update', async (update) => {
    for (let participant of update.participants) {
      if (update.action === 'add') await welcomeMessage(sock, { id: participant });
      if (update.action === 'remove') await goodbyeMessage(sock, { id: participant });
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    console.log(chalk.yellow(`[${from}] ${text}`));

    // === Commands ===
    switch (true) {
      case text.toLowerCase() === '.menu':
        await menu(sock, from);
        break;

      case text.toLowerCase() === '.logo':
        await sendLogo(sock, from);
        break;

      case text.toLowerCase() === '.groupmenu':
        await menu(sock, from, 'group');
        break;

      case text.toLowerCase() === '.ping':
        const frames = ['🏓', '🏓🏓', '🏓🏓🏓', '🏓🏓', '🏓', '✅ Pong! Saitama is active!'];
        for (let i = 0; i < frames.length; i++) {
          await sock.sendMessage(from, { text: frames[i] });
          await new Promise(r => setTimeout(r, 300));
        }
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
        
if (['.truth', '.dare', '.trivia', '.guess', '.tictactoe', '.spam', '.banbug'].includes(text.toLowerCase())) {
  await funGames(sock, msg);
}


if (['.play', '.song', '.video', '.ytmp4', '.tiktok', '.instagram', '.facebook'].some(cmd => text.startsWith(cmd))) {
  await downloads(sock, msg);
}

if (['.gpt', '.cyberai', '.gemini', '.calculator', '.imagine'].some(cmd => text.startsWith(cmd))) {
  await aiSearch(sock, msg);
}
    }

    // Anti-link detection
    if (text.includes('https://') || text.includes('www.')) await antiLink(sock, msg);
  });
}

startBot();
