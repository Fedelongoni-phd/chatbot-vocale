// ELEMENTI
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("chatForm");
const sendBtn = document.getElementById("send");

// Aggiunge messaggio
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

// Indicatore “sta scrivendo…”
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

// SESSIONE: solo finché la pagina resta aperta
if (!sessionStorage.getItem("sessionId_empatico_testo")) {
  sessionStorage.setItem("sessionId_empatico_testo", crypto.randomUUID());
}
const sessionId = sessionStorage.getItem("sessionId_empatico_testo");

// INVIO
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  // Stato bottone: invio
  sendBtn.classList.add("sent");

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
      data.output || data.text || data.reply || "💬 Nessuna risposta ricevuta dal server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error("Errore:", err);
    typing.remove();
    addMessage("⚠️ Errore di connessione al server.", "bot");
  }

  // 🔽 RITORNO DELLA FRECCIA
  // 1) finisce l'effetto "sent"
  sendBtn.classList.remove("sent");
  // 2) fa l'animazione di ritorno verso il basso
  sendBtn.classList.add("return");
  sendBtn.addEventListener(
    "animationend",
    () => {
      sendBtn.classList.remove("return");
      // se il campo è vuoto, togli anche "up" (freccia giù)
      if (!input.value.trim()) sendBtn.classList.remove("up");
    },
    { once: true }
  );
});

// FRECCIA DINAMICA: ruota quando scrivi, torna giù quando svuoti
input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    sendBtn.classList.add("up");
  } else if (!sendBtn.classList.contains("return")) {
    sendBtn.classList.remove("up");
  }
});
