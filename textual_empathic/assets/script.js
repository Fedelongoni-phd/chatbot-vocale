const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("send");

// Add message to chat box
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message to backend (placeholder for n8n webhook)
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  try {
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/your_empathic_text_webhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      }
    );

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    const reply = data.reply || "💬 No response from server.";
    addMessage(reply, "bot");
  } catch (err) {
    console.error(err);
    addMessage("⚠️ Connection error.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
