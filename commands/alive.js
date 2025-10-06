export default async function alive(sock, remoteJid) {
  const text = `
*👊 SAITAMA BOT ONLINE 👊*
> The Hero has awakened ⚡
> Uptime: ${Math.floor(process.uptime() / 60)} minutes
`;
  await sock.sendMessage(remoteJid, { text });
}
