// commands/mute.js
export default async function muteGroup(sock, msg) {
  const isMute = msg.body === ".mute";
  const action = isMute ? "announcement" : "not_announcement";
  await sock.groupSettingUpdate(msg.from, action);
  await sock.sendMessage(msg.from, { text: isMute ? "🔇 Group has been muted." : "🔊 Group unmuted." });
}
