const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("send");

// Aggiunge messaggio nella chat
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Invia messaggio al backend (n8n webhook di test)
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  // 🔹 Sessione per mantenere la memoria del chatbot
  const sessionId =
    localStorage.getItem("sessionId_formale_testo") || crypto.randomUUID();
  localStorage.setItem("sessionId_formale_testo", sessionId);

  // Messaggio temporaneo di attesa
  addMessage("⏳ Sto pensando...", "bot");

  try {
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/6b0d8b12-2c2b-413c-9463-f6120dcaf3fd/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      }
    );

    if (!res.ok) throw new Error("Errore dal server");

    const data = await res.json();

    // Rimuove il messaggio "Sto pensando..."
    chatBox.removeChild(chatBox.lastChild);

    const reply =
      data.text || data.reply || "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error(err);

    // Rimuove il messaggio "Sto pensando..." in caso di errore
    chatBox.removeChild(chatBox.lastChild);

    addMessage("⚠️ Errore di connessione al server.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
