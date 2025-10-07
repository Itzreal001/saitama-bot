/**
 * Bot Statistics - Show usage analytics
 */

import { getStats } from '../utils/analytics.js';
import { getRateLimitInfo } from '../utils/rateLimiter.js';
import os from 'os';

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

export default async function stats(sock, msg) {
  const from = msg.key.remoteJid;
  
  const isOwner = msg.key.fromMe;
  if (!isOwner) {
    return await sock.sendMessage(from, { 
      text: '⛔ *Access Denied*\n\nOnly the bot owner can view statistics.' 
    });
  }
  
  try {
    const analytics = getStats();
    const rateInfo = getRateLimitInfo();
    const uptime = formatUptime(process.uptime());
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    
    let statsMsg = `📊 *SAITAMA BOT STATISTICS*\n\n`;
    statsMsg += `⏱️ *Uptime:* ${uptime}\n`;
    statsMsg += `💾 *Memory:* ${memUsage} MB\n`;
    statsMsg += `🖥️ *Platform:* ${os.platform()}\n\n`;
    
    statsMsg += `📈 *Usage Analytics*\n`;
    statsMsg += `├ Total Commands: ${analytics.totalCommands}\n`;
    statsMsg += `├ Unique Users: ${analytics.uniqueUsers}\n`;
    statsMsg += `└ Unique Groups: ${analytics.uniqueGroups}\n\n`;
    
    statsMsg += `🔥 *Top Commands*\n`;
    if (analytics.topCommands.length > 0) {
      analytics.topCommands.slice(0, 5).forEach((cmd, i) => {
        statsMsg += `${i + 1}. ${cmd.command} - ${cmd.count}×\n`;
      });
    } else {
      statsMsg += `No commands tracked yet\n`;
    }
    
    statsMsg += `\n🛡️ *Rate Limiting*\n`;
    statsMsg += `├ Max: ${rateInfo.maxCommands} cmds/${rateInfo.windowSeconds}s\n`;
    statsMsg += `├ Cooldown: ${rateInfo.cooldownSeconds}s\n`;
    statsMsg += `└ Tracked Users: ${rateInfo.trackedUsers}\n`;
    
    statsMsg += `\n_Analytics since ${new Date(analytics.startDate).toLocaleDateString()}_`;
    
    await sock.sendMessage(from, { text: statsMsg });
  } catch (error) {
    await sock.sendMessage(from, { 
      text: `❌ *Error Loading Stats*\n\n${error.message}` 
    });
  }
}
