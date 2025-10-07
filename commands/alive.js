import fs from 'fs';
import path from 'path';
import os from 'os';
import config from '../config.js';
import chalk from 'chalk';

// 🕓 Format uptime nicely
function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

export default async function alive(sock, remoteJid) {
  const runtime = formatUptime(process.uptime());
  const logoPath = path.resolve(config.image);
  const modeStatus = '🌐 Public Mode';

  if (!fs.existsSync(logoPath)) {
    console.log(chalk.red('⚠️ Logo not found at ' + logoPath));
  }

  const frames = [
    '⚡💪 *Powering up...*',
    '⚡💥 *Systems online...*',
    '⚡🔥 *FULLY OPERATIONAL!*',
  ];

  for (let i = 0; i < frames.length; i++) {
    await sock.sendMessage(remoteJid, {
      image: fs.existsSync(logoPath) ? { url: logoPath } : undefined,
      caption: `╭━━━〔 👊 *ＳＡＩＴＡＭＡ  𝗠𝗗* 👊 〕━━━╮
┃ ⚙️ *Version:* ${config.version}
┃ ⏰ *Uptime:* ${runtime}
┃ 👑 *Owner:* ${config.ownerName}
┃ 🌍 *Platform:* ${os.platform().toUpperCase()}
┃ 📊 *Mode:* ${modeStatus}
╰━━━━━━━━━━━━━━━━━━━━╯

${frames[i]}

_"I'm just a bot for fun..."_ 💪
> Type *.menu* to see available commands`
    });
    await new Promise(r => setTimeout(r, 400)); // animation effect
  }
}
