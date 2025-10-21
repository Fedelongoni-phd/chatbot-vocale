// Selettori base
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");

// Funzione per aggiungere messaggi in chat
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

// Mostra indicatore “il bot sta scrivendo...”
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

// 🔹 Gestione invio messaggi
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // <--- ✅ impedisce il refresh della pagina
  const text = input.value.trim();
  if (!text) return;

  // Mostra messaggio dell’utente
  addMessage(text, "user");
  input.value = "";

  // Mostra i tre puntini
  const typing = showTypingIndicator();

  // Gestione sessione (mantiene memoria conversazione)
  const sessionId =
    localStorage.getItem("sessionId_empatico_testo") || crypto.randomUUID();
  localStorage.setItem("sessionId_empatico_testo", sessionId);

  try {
    // 🔗 Webhook n8n (sostituisci con il tuo se diverso)
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

    // Mostra la risposta del bot
    const reply =
      data.output ||
      data.text ||
      data.reply ||
      "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error("Errore:", err);
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
});
