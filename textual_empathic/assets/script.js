// --- ELEMENTI BASE ---
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");
const sendBtn = document.getElementById("send");

// --- AGGIUNGE MESSAGGIO IN CHAT ---
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

// --- MOSTRA INDICATORE "STA SCRIVENDO..." ---
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

// --- GESTIONE SESSIONE TEMPORANEA ---
// Usa sessionStorage: si resetta ad ogni chiusura/refresh
if (!window.sessionStorage.getItem("sessionId_empatico_testo")) {
  window.sessionStorage.setItem("sessionId_empatico_testo", crypto.randomUUID());
}
const sessionId = window.sessionStorage.getItem("sessionId_empatico_testo");

// --- INVIO MESSAGGIO ---
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita refresh pagina
  const text = input.value.trim();
  if (!text) return;

  // Messaggio utente
  addMessage(text, "user");
  input.value = "";
  sendBtn.classList.add("sent"); // Animazione bottone

  // Mostra i tre puntini
  const typing = showTypingIndicator();

  try {
    // 🔗 Webhook n8n
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/b37cb498-e21a-4a99-a507-93def91fc18f",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      }
    );

    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);
    const data = await res.json();

    // Rimuove i tre puntini
    typing.remove();

    // Risposta bot
    const reply =
      data.output ||
      data.text ||
      data.reply ||
      "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");

    // Ritorno pulsante alla posizione base
    sendBtn.classList.remove("sent");
  } catch (err) {
    console.error("Errore:", err);
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
});

// --- BOTTONCINO DINAMICO ---
input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    sendBtn.classList.add("up");
  } else {
    sendBtn.classList.remove("up");
  }
});
