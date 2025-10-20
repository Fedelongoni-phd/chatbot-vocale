const chatBox = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('send');

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('msg', sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  userInput.value = '';

  addMessage('Typing...', 'bot');

  try {
    const res = await fetch('https://n8n.srv1060901.hstgr.cloud/webhook/YOUR_EMPATHIC_TEXT_WEBHOOK', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    const reply = data.reply || "I'm here for you. Please, tell me more.";
    chatBox.lastChild.textContent = reply;
  } catch (err) {
    chatBox.lastChild.textContent = "⚠️ Error connecting to the server.";
  }
}

sendBtn.onclick = sendMessage;
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

