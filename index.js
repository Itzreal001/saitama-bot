import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import P from "pino";
import qrcode from "qrcode-terminal";
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import menu from "./commands/menu.js";
import alive from "./commands/alive.js";
import config from "./config/config.js";
import { groupMenu } from "./commands/group.js";
import muteGroup from "./commands/mute.js";
if (msg.body === ".mute" || msg.body === ".unmute") await muteGroup(sock, msg);

import manageMembers from "./commands/manageMembers.js";
if (msg.body.startsWith(".add") || msg.body.startsWith(".kick")) await manageMembers(sock, msg);
import groupInfo from "./commands/groupinfo.js";
if (msg.body === ".groupinfo") await groupInfo(sock, msg);
import tagAll from "./commands/tagall.js";
if (msg.body === ".tagall") await tagAll(sock, msg);


// === Bot Banner Display ===
const banner = `
███████╗ █████╗ ██╗████████╗ █████╗ ███╗   ███╗ █████╗ 
██╔════╝██╔══██╗██║╚══██╔══╝██╔══██╗████╗ ████║██╔══██╗
███████╗███████║██║   ██║   ███████║██╔████╔██║███████║
╚════██║██╔══██║██║   ██║   ██╔══██║██║╚██╔╝██║██╔══██║
███████║██║  ██║██║   ██║   ██║  ██║██║ ╚═╝ ██║██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝
              Saitama Bot — Activated ⚡
`

console.log(chalk.cyanBright(banner))

// === Image Display ===
const imagePath = path.join('assets', 'media', 'logo.jpg')
if (fs.existsSync(imagePath)) {
  console.log(chalk.green('📸 Displaying Saitama Logo...'))
  console.log(chalk.gray(`(Image path: ${imagePath})`))
} else {
  console.log(chalk.red('⚠️ Logo not found in assets/media/logo.jpg'))
}

// === Start WhatsApp Connection ===
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: ['Saitama Bot', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'open') {
      console.log(chalk.greenBright('✅ Saitama Bot Connected Successfully!'))
    } else if (connection === 'close') {
      console.log(chalk.red('❌ Connection closed, reconnecting...'))
      startBot()
    }
  })

  // Handle incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    console.log(chalk.yellow(`[${from}] ${text}`))

    if (text.toLowerCase() === '.menu') {
      const menu = fs.readFileSync(path.join('assets', 'menu', 'main-menu.txt'), 'utf8')
      await sock.sendMessage(from, { text: menu })
    }
    if (msg.body === ".groupmenu") {
  await groupMenu(sock, msg.from, uptime);
}


    if (text.toLowerCase() === '.ping') {
      await sock.sendMessage(from, { text: '🏓 Pong! Saitama is active!' })
    }
  })
}

startBot()
