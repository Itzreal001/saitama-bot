/**
 * AI & Search Handler — Saitama MD
 * Commands: .gpt, .cyberai, .gemini, .calculator, .imagine
 */

function safeCalculate(expr) {
  const sanitized = expr.replace(/[^0-9+\-*/(). ]/g, '');
  
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid expression');
  }
  
  if (sanitized.includes('(') && !sanitized.includes(')')) {
    throw new Error('Unbalanced parentheses');
  }
  
  try {
    const result = Function('"use strict"; return (' + sanitized + ')')();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Result is not a valid number');
    }
    
    return result;
  } catch (error) {
    throw new Error('Invalid mathematical expression');
  }
}

export default async function aiSearch(sock, msg) {
  const text = msg.message?.conversation || '';
  const from = msg.key.remoteJid;
  const lower = text.toLowerCase();

  const sendReply = async (reply) => {
    await sock.sendMessage(from, { text: reply });
  };

  if (lower.startsWith('.gpt') || lower.startsWith('.cyberai')) {
    const query = text.replace(/^\.(gpt|cyberai)\s*/i, '');
    await sendReply(`🤖 *Saitama GPT:* "${query || 'Hello!'}" \n> (AI response coming soon...)`);
  } 
  else if (lower.startsWith('.gemini')) {
    const query = text.replace('.gemini', '').trim();
    await sendReply(`💭 *Gemini:* Thinking about "${query || 'your prompt'}"... (Coming soon ⚡)`);
  } 
  else if (lower.startsWith('.calculator')) {
    const expr = text.replace('.calculator', '').trim();
    try {
      const result = safeCalculate(expr);
      await sendReply(`🧮 *Result:* ${expr} = ${result}`);
    } catch (error) {
      await sendReply('⚠️ Invalid expression. Try `.calculator 5 + 3 * 2`');
    }
  } 
  else if (lower.startsWith('.imagine')) {
    const prompt = text.replace('.imagine', '').trim();
    await sendReply(`🌠 *Generating image for:* "${prompt || 'your imagination'}"... (Coming soon 🖼️)`);
  }
}
