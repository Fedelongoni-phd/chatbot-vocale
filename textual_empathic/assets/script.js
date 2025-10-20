// --- Empathic Text Chatbot Script --- //

const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// 👉 URL del tuo webhook empatico (n8n)
const N8N_WEBHOOK_URL = "https://n8n.srv1060901.hstgr.cloud/webhook/c87f3f26-4323-44cd-b610-03b990efd8c3";

// funzione per aggiungere messaggi nella chat
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// invio messaggio all’agente empatico
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  try {
    const sessionId =
      localStorage.getItem("sessionId_empatic") || crypto.randomUUID();
    localStorage.setItem("sessionId_empatic", sessionId);

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, sessionId }),
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    const reply = data.output || data.text || "⚠️ No response received.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error(err);
    addMessage("⚠️ Error: " + err.message, "bot");
  } finally {
    sendBtn.disabled = false;
  }
}

// eventi click e invio con ENTER
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
