const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");
const sendBtn = document.getElementById("send");

let isWaiting = false;   // true = bot sta rispondendo
let isReturning = false; // true = animazione di ritorno in corso

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

function whenAnimationEnds(el, cb) {
  const handler = () => {
    el.removeEventListener("animationend", handler);
    cb();
  };
  el.addEventListener("animationend", handler);
}

// === Invio messaggio principale ===
async function sendMessage(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  // 🔼 fase di attesa → resta su
  isWaiting = true;
  sendBtn.classList.add("up", "sent");

  const typing = showTypingIndicator();

  try {
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/b37cb498-e21a-4a99-a507-93def91fc18f",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      }
    );
    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);
    const data = await res.json();

    typing.remove();
    addMessage(data.output || data.text || data.reply || "💬 Nessuna risposta ricevuta.", "bot");
  } catch (err) {
    console.error("Errore:", err);
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }

  // ✅ risposta arrivata → fa animazione di ritorno
  isWaiting = false;
  sendBtn.classList.remove("sent");
  sendBtn.classList.add("return");
  isReturning = true;

  whenAnimationEnds(sendBtn, () => {
    sendBtn.classList.remove("return");
    // piccolo ritardo per stabilizzare la posizione giù
    setTimeout(() => {
      sendBtn.classList.remove("up");
      isReturning = false;
    }, 250);
  });
}

// === Aggiornamento dinamico durante la scrittura ===
input.addEventListener("input", () => {
  // Se sto aspettando il bot o tornando giù → ignora
  if (isWaiting || isReturning) return;

  if (input.value.trim() !== "") {
    sendBtn.classList.add("up");
  } else {
    sendBtn.classList.remove("up");
  }
});

form.addEventListener("submit", sendMessage);
