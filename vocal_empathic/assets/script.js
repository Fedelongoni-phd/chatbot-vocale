const recordBtn = document.getElementById("record");
const chatBox = document.getElementById("chat");
const statusText = document.getElementById("status");
const audioEl = document.getElementById("replyAudio");

let mediaRecorder;
let chunks = [];

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;
  div.appendChild(bubble);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendAudio(blob) {
  const form = new FormData();
  const sessionId =
    localStorage.getItem("sessionId_empatico_vocale") || crypto.randomUUID();
  localStorage.setItem("sessionId_empatico_vocale", sessionId);

  form.append("sessionId", sessionId);
  form.append("file0", blob, "input.webm");

  statusText.textContent = "🎧 Elaborazione in corso...";
  recordBtn.disabled = true;

  try {
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/dafa96e5-048b-4012-8035-416847fd8e17",
      {
        method: "POST",
        body: form,
      }
    );

    if (!res.ok) throw new Error("Errore nella risposta del server");

    // 🔹 Il backend restituisce un oggetto { audio: binary, text: string }
    const contentType = res.headers.get("content-type");

    if (contentType.includes("application/json")) {
      const data = await res.json();

      if (data.text) addMessage(data.text, "bot");

      if (data.audio) {
        const audioBlob = base64ToBlob(data.audio, "audio/mpeg");
        playAudio(audioBlob);
      }
    } else {
      // Se il backend invia direttamente un blob audio
      const audioBlob = await res.blob();
      playAudio(audioBlob);
      addMessage("🔊 Risposta vocale ricevuta", "bot");
    }
  } catch (err) {
    console.error(err);
    addMessage("⚠️ Errore: " + err.message, "bot");
  } finally {
    recordBtn.disabled = false;
    statusText.textContent = "In attesa...";
  }
}

function base64ToBlob(base64, type) {
  const binary = atob(base64.split(",")[1] || base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
  return new Blob([new Uint8Array(array)], { type });
}

function playAudio(blob) {
  const url = URL.createObjectURL(blob);
  audioEl.src = url;
  audioEl.hidden = false;
  audioEl.load();
  audioEl.play().catch(() => console.warn("Autoplay bloccato"));
}

recordBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "🎤";
    recordBtn.classList.remove("pulse");
    statusText.textContent = "Invio audio...";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      addMessage("🗣️ Hai parlato...", "user");
      sendAudio(blob);
    };

    mediaRecorder.start();
    recordBtn.textContent = "⏹️";
    recordBtn.classList.add("pulse");
    statusText.textContent = "🎙️ Registrazione in corso...";
  } catch (err) {
    alert("Errore nell'accesso al microfono: " + err.message);
  }
};
