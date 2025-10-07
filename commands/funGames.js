

export default async function funGames(sock, msg) {
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const from = msg.key.remoteJid;
  const command = text.toLowerCase().split(' ')[0];

  if (command === ".spam") {
    const victim = text.split(" ")[1] || "chat";
    await sock.sendMessage(from, { text: `⚠️ Initiating Spam Bug on ${victim}...` });
    const fakeSpam = [
      "💥 Injecting packets...",
      "📡 Sending overload data...",
      "⚙️ Bypassing anti-spam filter...",
      "🔥 Flood sequence initiated!",
      "💣 WhatsApp servers shaking...",
      "✅ Spam bug completed successfully (fake 😎)",
    ];
    for (const line of fakeSpam) {
      await new Promise((r) => setTimeout(r, 700));
      await sock.sendMessage(from, { text: line });
    }
    return;
  }

  // === BAN BUG (Fake Ban Attack) ===
  if (command === ".banbug") {
    const target = text.split(" ")[1] || "unknown user";
    const stages = [
      `🚫 Starting Ban Bug on *${target}*...`,
      "⚡ Connecting to Meta API...",
      "📤 Uploading malicious payload...",
      "🧩 Encrypting ban packet...",
      "☠️ Sending to target...",
      "💀 User permanently banned (jk 🤣)",
    ];
    for (const stage of stages) {
      await sock.sendMessage(from, { text: stage });
      await new Promise((r) => setTimeout(r, 800));
    }
    await sock.sendMessage(from, { text: "✅ Ban bug completed. (No one was harmed 😅)" });
    return;
  }

  // === Truth / Dare ===
  const truths = [
    "What's your biggest fear?",
    "Have you ever lied to your best friend?",
    "What's the most embarrassing thing you've done?"
  ];

  const dares = [
    "Send a funny selfie in the group.",
    "Change your profile picture to a random emoji.",
    "Say 'I love Saitama MD!' in the group."
  ];

  if (text === '.truth') {
    const randomTruth = truths[Math.floor(Math.random() * truths.length)];
    await sock.sendMessage(from, { text: `📝 Truth: ${randomTruth}` });
    return;
  }

  if (text === '.dare') {
    const randomDare = dares[Math.floor(Math.random() * dares.length)];
    await sock.sendMessage(from, { text: `🎯 Dare: ${randomDare}` });
    return;
  }

  // === Trivia ===
  const triviaQs = [
    { q: "What is the capital of France?", a: "Paris" },
    { q: "Which planet is known as the Red Planet?", a: "Mars" },
    { q: "What year did the Titanic sink?", a: "1912" }
  ];

  if (text === '.trivia') {
    const randomTrivia = triviaQs[Math.floor(Math.random() * triviaQs.length)];
    await sock.sendMessage(from, { text: `❓ Trivia: ${randomTrivia.q}\n*(Answer: ${randomTrivia.a})*` });
    return;
  }

  // === Guess (simple example) ===
  const guesses = [
    "I am a superhero who codes hard. Who am I?",
    "I have a big punch but stay silent. Who am I?"
  ];

  if (text === '.guess') {
    const randomGuess = guesses[Math.floor(Math.random() * guesses.length)];
    await sock.sendMessage(from, { text: `🤔 Guess: ${randomGuess}` });
    return;
  }

  // === TicTacToe placeholder ===
  if (text === '.tictactoe') {
    await sock.sendMessage(from, { text: "🎮 TicTacToe: Coming soon! Use reactions to play." });
    return;
  }
}
