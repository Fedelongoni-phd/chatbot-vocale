// --- ELEMENTI DELLA CHAT ---
const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("send");

// --- FUNZIONE: aggiunge un messaggio in chat ---
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = text;
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
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook-test/6b0d8b12-2c2b-413c-9463-f6120dcaf3fd/chat",
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

    // Mostra la risposta del bot
    const reply =
      data.text || data.reply || "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error("Errore:", err);

    // Rimuove il messaggio di attesa
    waiting.remove();

    // Messaggio di errore lato utente
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
}

// --- EVENTI: invio messaggio ---
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
