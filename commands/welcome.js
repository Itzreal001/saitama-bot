import fs from 'fs';
const welcomeFile = 'data/welcome.json';

function ensureWelcomeFile() {
  try {
    const dir = 'data';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(welcomeFile)) fs.writeFileSync(welcomeFile, JSON.stringify({}));
  } catch (error) {
    console.error('Error creating welcome file:', error.message);
  }
}

function loadWelcomeData() {
  try {
    ensureWelcomeFile();
    const content = fs.readFileSync(welcomeFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading welcome data, resetting file:', error.message);
    fs.writeFileSync(welcomeFile, JSON.stringify({}));
    return {};
  }
}

export async function welcomeMessage(sock, participant) {
  try {
    const from = participant.id.split('-')[0] + '@g.us';
    const data = loadWelcomeData();
    const customMsg = data[from]?.welcome || '👋 Welcome to the group!';
    
    await sock.sendMessage(from, { text: `${customMsg}\n@${participant.id.split('@')[0]}`, mentions: [participant.id] });
  } catch (error) {
    console.error('Error sending welcome message:', error.message);
  }
}

export async function goodbyeMessage(sock, participant) {
  try {
    const from = participant.id.split('-')[0] + '@g.us';
    const data = loadWelcomeData();
    const customMsg = data[from]?.goodbye || '👋 Goodbye!';

    await sock.sendMessage(from, { text: `${customMsg}\n@${participant.id.split('@')[0]}`, mentions: [participant.id] });
  } catch (error) {
    console.error('Error sending goodbye message:', error.message);
  }
}
