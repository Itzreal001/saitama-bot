/**
 * Broadcast System - Send announcements to multiple groups
 */

export default async function broadcast(sock, msg) {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  
  const isOwner = msg.key.fromMe;
  if (!isOwner) {
    return await sock.sendMessage(from, { 
      text: '⛔ *Access Denied*\n\nOnly the bot owner can use broadcast commands.' 
    });
  }
  
  const broadcastMsg = text.replace(/^\.(broadcast|bc)\s*/i, '').trim();
  
  if (!broadcastMsg) {
    return await sock.sendMessage(from, { 
      text: '❌ *Broadcast Message Required*\n\nUsage: `.broadcast <message>`\n\nExample: `.broadcast Important update for all groups!`' 
    });
  }
  
  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupJids = Object.keys(groups);
    
    if (groupJids.length === 0) {
      return await sock.sendMessage(from, { 
        text: '⚠️ *No Groups Found*\n\nThe bot is not in any groups yet.' 
      });
    }
    
    await sock.sendMessage(from, { 
      text: `📡 *Broadcasting to ${groupJids.length} groups...*\n\nPlease wait...` 
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (const groupJid of groupJids) {
      try {
        await sock.sendMessage(groupJid, { 
          text: `📢 *BROADCAST MESSAGE*\n\n${broadcastMsg}\n\n_— Saitama Bot Announcement_` 
        });
        successCount++;
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        failCount++;
        console.error(`Failed to broadcast to ${groupJid}:`, error.message);
      }
    }
    
    await sock.sendMessage(from, { 
      text: `✅ *Broadcast Complete*\n\n📤 Sent: ${successCount}\n❌ Failed: ${failCount}\n📊 Total Groups: ${groupJids.length}` 
    });
    
  } catch (error) {
    await sock.sendMessage(from, { 
      text: `❌ *Broadcast Failed*\n\n${error.message}` 
    });
  }
}
