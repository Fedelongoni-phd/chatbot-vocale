const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");
const sendBtn = document.getElementById("send");

let isWaiting = false;   // il bot sta rispondendo
let isAnimating = false; // la freccia è in animazione

// === Funzione per aggiungere un messaggio ===
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

// === Indicatore di "sta scrivendo" ===
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

// === Invia messaggio ===
async function sendMessage(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || isWaiting) return; // evita doppio invio

  // Mostra messaggio utente
  addMessage(text, "user");
  input.value = "";

  // Imposta stato "in attesa"
  isWaiting = true;
  isAnimating = false;
  sendBtn.classList.add("up"); // resta su

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
    addMessage(
      data.output || data.text || data.reply || "💬 Nessuna risposta ricevuta.",
      "bot"
    );
  } catch (err) {
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }

  // Dopo la risposta → avvia ritorno
  isWaiting = false;
  isAnimating = true;

  sendBtn.classList.add("return");
  sendBtn.classList.remove("sent");

  // Quando l’animazione è finita → resta giù
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

// === Input dinamico ===
input.addEventListener("input", () => {
  if (isWaiting || isAnimating) return;
  if (input.value.trim() !== "") {
    sendBtn.classList.add("up");
  } else {
    sendBtn.classList.remove("up");
  }
});

form.addEventListener("submit", sendMessage);
