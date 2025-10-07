import fs from 'fs';
import path from 'path';

export default async function sendLogo(sock, from) {
  const imagePath = path.join('assets', 'media', 'logo.jpg');

  if (!fs.existsSync(imagePath)) {
    await sock.sendMessage(from, { text: '⚠️ Logo not found!' });
    return;
  }

  await sock.sendMessage(from, {
    image: { url: imagePath },
    caption: '📸 Here is the Saitama Logo!',
  });
}
