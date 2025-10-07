/**
 * Rate Limiter - Prevents spam and abuse
 * Tracks command usage per user and enforces limits
 */

const userCommands = new Map();
const RATE_LIMIT = {
  maxCommands: 10,
  windowMs: 60000,
  cooldown: 3000
};

export function checkRateLimit(userJid) {
  const now = Date.now();
  
  if (!userCommands.has(userJid)) {
    userCommands.set(userJid, { count: 1, firstCommand: now, lastCommand: now });
    return { allowed: true, remaining: RATE_LIMIT.maxCommands - 1 };
  }
  
  const userData = userCommands.get(userJid);
  
  if (now - userData.lastCommand < RATE_LIMIT.cooldown) {
    return { 
      allowed: false, 
      reason: 'cooldown',
      waitTime: Math.ceil((RATE_LIMIT.cooldown - (now - userData.lastCommand)) / 1000)
    };
  }
  
  if (now - userData.firstCommand > RATE_LIMIT.windowMs) {
    userData.count = 1;
    userData.firstCommand = now;
    userData.lastCommand = now;
    return { allowed: true, remaining: RATE_LIMIT.maxCommands - 1 };
  }
  
  if (userData.count >= RATE_LIMIT.maxCommands) {
    const resetTime = Math.ceil((RATE_LIMIT.windowMs - (now - userData.firstCommand)) / 1000);
    return { 
      allowed: false, 
      reason: 'limit',
      resetTime 
    };
  }
  
  userData.count++;
  userData.lastCommand = now;
  return { allowed: true, remaining: RATE_LIMIT.maxCommands - userData.count };
}

export function resetRateLimit(userJid) {
  userCommands.delete(userJid);
}

export function getRateLimitInfo() {
  return {
    maxCommands: RATE_LIMIT.maxCommands,
    windowSeconds: RATE_LIMIT.windowMs / 1000,
    cooldownSeconds: RATE_LIMIT.cooldown / 1000,
    trackedUsers: userCommands.size
  };
}
