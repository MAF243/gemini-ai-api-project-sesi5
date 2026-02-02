const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendBtn = form.querySelector('button');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // tampilkan bubble bot "thinking" lalu nanti diganti dengan jawaban asli
  const thinkingEl = appendMessage('bot', 'Gemini is thinking...');

  setLoading(true);

  try {
    const resp = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!resp.ok) {
      // coba ambil pesan error dari server
      let msg = `HTTP ${resp.status}`;
      try {
        const errJson = await resp.json();
        msg = errJson.error || msg;
      } catch {
        const errText = await resp.text();
        if (errText) msg = errText;
      }
      throw new Error(msg);
    }

    const data = await resp.json();
    thinkingEl.textContent = data.output || '(no output)';
  } catch (err) {
    thinkingEl.textContent = 'Error: ' + (err?.message || err);
  } finally {
    setLoading(false);
    input.focus();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function setLoading(isLoading) {
  input.disabled = isLoading;
  sendBtn.disabled = isLoading;
}
