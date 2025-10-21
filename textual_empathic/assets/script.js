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
// Si resetta automaticamente al refresh
if (!window.sessionStorage.getItem("sessionId_empatico_testo")) {
  window.sessionStorage.setItem("sessionId_empatico_testo", crypto.randomUUID());
}
const sessionId = window.sessionStorage.getItem("sessionId_empatico_testo");

// --- INVIO MESSAGGIO ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Mostra messaggio utente
  addMessage(text, "user");
  input.value = "";

  // Effetto bottone "invio"
  sendBtn.classList.add("sent");

  // Mostra indicatore di digitazione
  const typing = showTypingIndicator();

  try {
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

    typing.remove();

    const reply =
      data.output ||
      data.text ||
      data.reply ||
      "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");

    // 🔹 Bottone torna alla posizione base (come nel mockup)
    sendBtn.classList.remove("sent");
    sendBtn.classList.add("return");
    setTimeout(() => {
      sendBtn.classList.remove("return");
    }, 600);
  } catch (err) {
    console.error("Errore:", err);
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
});

// --- BOTTONCINO DINAMICO (ruota quando scrivi) ---
input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    sendBtn.classList.add("up");
  } else if (!sendBtn.classList.contains("return")) {
    sendBtn.classList.remove("up");
  }
});
