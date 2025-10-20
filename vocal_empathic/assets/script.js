const recordBtn = document.getElementById('record');
const chatBox = document.getElementById('chat');
const statusText = document.getElementById('status');
const audioEl = document.getElementById('replyAudio');
let mediaRecorder;
let chunks = [];

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('msg', sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendAudio(blob) {
  const form = new FormData();
  const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
  localStorage.setItem('sessionId', sessionId);
  form.append('sessionId', sessionId);
  form.append('file0', blob, 'input.webm');

  statusText.textContent = "🎙️ Elaborazione in corso...";
  recordBtn.disabled = true;

  try {
    const res = await fetch('https://n8n.srv1060901.hstgr.cloud/webhook/dafa96e5-048b-4012-8035-416847fd8e17', {
      method: 'POST',
      body: form
    });

    if (!res.ok) throw new Error('Errore nella risposta del server');

    const audioBlob = await res.blob();
    if (audioBlob.size < 100) throw new Error('File audio ricevuto vuoto o corrotto');

    const url = URL.createObjectURL(audioBlob);
    audioEl.src = url;
    audioEl.hidden = false;
    audioEl.load();
    await audioEl.play().catch(() => console.warn('Autoplay bloccato'));

    addMessage("🔊 Risposta vocale ricevuta", "bot");
  } catch (err) {
    console.error(err);
    addMessage("⚠️ Errore: " + err.message, "bot");
  } finally {
    recordBtn.disabled = false;
    statusText.textContent = "In attesa...";
  }
}

recordBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = "🎤 Premi per parlare";
    recordBtn.classList.remove('pulse');
    statusText.textContent = "Invio audio...";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      addMessage("🗣️ Hai parlato...", "user");
      sendAudio(blob);
    };
    mediaRecorder.start();
    recordBtn.textContent = "⏹️ Ferma registrazione";
    recordBtn.classList.add('pulse');
    statusText.textContent = "🎙️ Registrazione in corso...";
  } catch (err) {
    alert("Errore nell'accesso al microfono: " + err.message);
  }
};
// Script del chatbot vocale empatico
