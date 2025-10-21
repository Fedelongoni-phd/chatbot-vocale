const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");
const sendBtn = document.getElementById("send");

let isWaiting = false;
let isAnimating = false;

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = window.marked ? marked.parse(text) : text;
  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.classList.add("msg", "bot");
  typing.innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>`;
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
  return typing;
}

async function sendMessage(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || isWaiting) return;

  addMessage(text, "user");
  input.value = "";

  isWaiting = true;
  sendBtn.classList.add("up");

  const typing = showTypingIndicator();

  try {
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/e69d6e9f-2c8b-4dbf-b93b-99f39923ce6f/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      }
    );

    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);
    const data = await res.json();

    typing.remove();
    addMessage(
      data.output || data.text || data.reply || "💬 Nessuna risposta ricevuta.",
      "bot"
    );
  } catch (err) {
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }

  isWaiting = false;
  isAnimating = true;
  sendBtn.classList.add("return");

  sendBtn.addEventListener(
    "animationend",
    () => {
      sendBtn.classList.remove("return");
      sendBtn.classList.remove("up");
      isAnimating = false;
    },
    { once: true }
  );
}

input.addEventListener("input", () => {
  if (isWaiting || isAnimating) return;
  if (input.value.trim() !== "") sendBtn.classList.add("up");
  else sendBtn.classList.remove("up");
});

form.addEventListener("submit", sendMessage);
