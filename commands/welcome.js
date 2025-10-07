import fs from 'fs';
const welcomeFile = 'data/welcome.json';

if (!fs.existsSync(welcomeFile)) fs.writeFileSync(welcomeFile, JSON.stringify({}));

export async function welcomeMessage(sock, participant) {
  const from = participant.id.split('-')[0] + '@g.us';
  const data = JSON.parse(fs.readFileSync(welcomeFile, 'utf8'));
  const customMsg = data[from]?.welcome || '👋 Welcome to the group!';
  
  await sock.sendMessage(from, { text: `${customMsg}\n@${participant.id.split('@')[0]}`, mentions: [participant.id] });
}

export async function goodbyeMessage(sock, participant) {
  const from = participant.id.split('-')[0] + '@g.us';
  const data = JSON.parse(fs.readFileSync(welcomeFile, 'utf8'));
  const customMsg = data[from]?.goodbye || '👋 Goodbye!';

  await sock.sendMessage(from, { text: `${customMsg}\n@${participant.id.split('@')[0]}`, mentions: [participant.id] });
}
