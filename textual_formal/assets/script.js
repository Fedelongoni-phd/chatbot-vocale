<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chatbot</title>

  <!-- Libreria per Markdown -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <style>
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #f4f6f8;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .chat-container {
      width: 100%;
      max-width: 500px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #chat {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    .msg {
      padding: 10px 14px;
      margin: 8px 0;
      border-radius: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .msg.user {
      background: #e0f7fa;
      align-self: flex-end;
    }

    .msg.bot {
      background: #f1f1f1;
      align-self: flex-start;
    }

    .input-area {
      display: flex;
      border-top: 1px solid #ddd;
    }

    #userInput {
      flex-grow: 1;
      padding: 12px;
      border: none;
      outline: none;
      font-size: 16px;
    }

    #send {
      background: #0078ff;
      color: white;
      border: none;
      padding: 12px 20px;
      cursor: pointer;
      font-weight: bold;
    }

    #send:hover {
      background: #005ecc;
    }
  </style>
</head>

<body>
  <div class="chat-container">
    <div id="chat"></div>

    <div class="input-area">
      <input id="userInput" type="text" placeholder="Scrivi un messaggio..." />
      <button id="send">Invia</button>
    </div>
  </div>

  <script>
    // --- ELEMENTI DELLA CHAT ---
    const chatBox = document.getElementById("chat");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("send");

    // --- FUNZIONE: aggiunge un messaggio in chat ---
    function addMessage(text, sender) {
      const div = document.createElement("div");
      div.classList.add("msg", sender);

      // ✅ Interpreta Markdown (fallback se Marked non è disponibile)
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
        // 🔗 URL del tuo Webhook n8n
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

    console.log("✅ Chatbot avviato correttamente");
  </script>
</body>
</html>
