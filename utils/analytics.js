/**
 * Bot Analytics - Track usage statistics
 */

import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join('data', 'analytics.json');

function loadStats() {
  try {
    if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading analytics:', error.message);
  }
  return {
    totalCommands: 0,
    commandCounts: {},
    userCounts: {},
    groupCounts: {},
    startDate: new Date().toISOString()
  };
}

function saveStats(stats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error saving analytics:', error.message);
  }
}

export function trackCommand(command, userJid, groupJid = null) {
  const stats = loadStats();
  
  stats.totalCommands++;
  
  stats.commandCounts[command] = (stats.commandCounts[command] || 0) + 1;
  
  stats.userCounts[userJid] = (stats.userCounts[userJid] || 0) + 1;
  
  if (groupJid) {
    stats.groupCounts[groupJid] = (stats.groupCounts[groupJid] || 0) + 1;
  }
  
  saveStats(stats);
}

export function getStats() {
  const stats = loadStats();
  
  const topCommands = Object.entries(stats.commandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cmd, count]) => ({ command: cmd, count }));
  
  const topUsers = Object.entries(stats.userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([user, count]) => ({ user, count }));
  
  return {
    totalCommands: stats.totalCommands,
    uniqueUsers: Object.keys(stats.userCounts).length,
    uniqueGroups: Object.keys(stats.groupCounts).length,
    topCommands,
    topUsers,
    startDate: stats.startDate
  };
}

export function resetStats() {
  if (fs.existsSync(STATS_FILE)) {
    fs.unlinkSync(STATS_FILE);
  }
  return true;
}
