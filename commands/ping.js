export default {
  name: "ping",
  description: "Replies with Pong and latency",
  async execute(sock, msg) {
    const start = Date.now();
    await sock.sendMessage(msg.key.remoteJid, { text: "Pong 🏓" });
    const delta = Date.now() - start;
    // You can edit to calculate better latency; this gives a quick number.
    await sock.sendMessage(msg.key.remoteJid, { text: `Latency: ${delta} ms` });
  }
};
