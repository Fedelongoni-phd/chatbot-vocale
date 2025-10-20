// --- ELEMENTI DELLA CHAT ---
const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("send");

// --- FUNZIONE: aggiunge un messaggio in chat ---
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);

  // ✅ Converte Markdown in HTML
  const formatted = window.marked ? marked.parse(text) : text;
  div.innerHTML = formatted;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- FUNZIONE PRINCIPALE: invia messaggio a n8n ---
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Mostra subito il messaggio dell’utente
  addMessage(text, "user");
  userInput.value = "";

  // --- Gestione sessione per memoria del bot ---
  const sessionId =
    localStorage.getItem("sessionId_formale_testo") || crypto.randomUUID();
  localStorage.setItem("sessionId_formale_testo", sessionId);

  // Messaggio temporaneo di attesa
  const waiting = document.createElement("div");
  waiting.classList.add("msg", "bot");
  waiting.textContent = "💭 Sto pensando...";
  chatBox.appendChild(waiting);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // 🔗 URL del Webhook n8n
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/e69d6e9f-2c8b-4dbf-b93b-99f39923ce6f/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
      }
    );

    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);

    const data = await res.json();

    // Rimuove il messaggio di attesa
    waiting.remove();

    // Mostra la risposta del bot (interpretata come Markdown)
    const reply =
      data.output ||
      data.text ||
      data.reply ||
      "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error("Errore:", err);

    waiting.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
}

// --- EVENTI: invio messaggio ---
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

console.log("✅ Script caricato correttamente");
