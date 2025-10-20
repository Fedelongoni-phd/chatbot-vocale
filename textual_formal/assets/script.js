// --- ELEMENTI DELLA CHAT ---
const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("send");

// --- FUNZIONE: aggiunge un messaggio in chat ---
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);

  // ✅ Conversione Markdown → HTML semplice
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **grassetto**
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // *corsivo*
    .replace(/\n/g, "<br>"); // a capo

  div.innerHTML = formatted; // usa HTML, non textContent
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
    // 🔗 URL del Webhook di PRODUZIONE
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

    // --- GESTIONE ERRORI HTTP ---
    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);

    // --- OTTIENI RISPOSTA DAL SERVER ---
    const data = await res.json();

    // Rimuove il messaggio di attesa
    waiting.remove();

    // --- MOSTRA RISPOSTA DEL BOT ---
    const reply =
      data.output || data.text || data.reply || "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error("Errore:", err);

    // Rimuove il messaggio di attesa
    waiting.remove();

    // Mostra errore lato utente
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
}

// --- EVENTI: invio messaggio ---
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
