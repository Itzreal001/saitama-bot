import chalk from 'chalk';

export async function generatePairingCode(sock, msg) {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  
  // Extract phone number from command
  const args = text.split(' ');
  if (args.length < 2) {
    await sock.sendMessage(from, { 
      text: '❌ *Usage Error*\n\nPlease provide a phone number.\n\n*Example:* .pair 1234567890\n\n*Note:* Use country code without + sign' 
    });
    return;
  }
  
  const phoneNumber = args[1].replace(/[^0-9]/g, ''); // Remove any non-numeric characters
  
  if (phoneNumber.length < 10) {
    await sock.sendMessage(from, { 
      text: '❌ *Invalid Phone Number*\n\nPlease provide a valid phone number with country code.\n\n*Example:* .pair 1234567890' 
    });
    return;
  }
  
  try {
    // Request pairing code from WhatsApp
    const code = await sock.requestPairingCode(phoneNumber);
    
    console.log(chalk.green(`✅ Pairing code generated for ${phoneNumber}: ${code}`));
    
    // Get bot owner's JID (the logged-in account)
    const ownerJid = sock.user.id;
    
    // Send pairing code to bot owner's WhatsApp
    await sock.sendMessage(ownerJid, { 
      text: `✅ *Pairing Code Generated*\n\n📱 *Phone Number:* +${phoneNumber}\n🔐 *Pairing Code:* ${code}\n\n*Instructions for the user:*\n1. Open WhatsApp on their device\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Tap "Link with phone number instead"\n5. Enter the pairing code: *${code}*\n\n⚠️ *Note:* The code expires in a few minutes!` 
    });
    
    // Send confirmation to the person who requested it (if not the owner)
    if (from !== ownerJid) {
      await sock.sendMessage(from, { 
        text: '✅ Pairing code has been sent to the bot owner!' 
      });
    }
    
  } catch (error) {
    console.log(chalk.red('Error generating pairing code:'), error.message);
    
    // Get bot owner's JID
    const ownerJid = sock.user?.id || from;
    
    await sock.sendMessage(ownerJid, { 
      text: `❌ *Pairing Code Error*\n\nFailed to generate pairing code for +${phoneNumber}\n\nPlease make sure:\n1. The phone number is valid\n2. The number includes country code (without +)\n3. The bot is properly connected\n\n*Error:* ${error.message}` 
    });
    
    // Send error to requester if different from owner
    if (from !== ownerJid) {
      await sock.sendMessage(from, { 
        text: '❌ Failed to generate pairing code. Error has been sent to bot owner.' 
      });
    }
  }
}
