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
  const sessionId = localStorage.getItem('formalSessionId') || crypto.randomUUID();
  localStorage.setItem('formalSessionId', sessionId);
  form.append('sessionId', sessionId);
  form.append('file0', blob, 'input.webm');

  statusText.textContent = "⏳ Invio audio per l'elaborazione...";
  recordBtn.disabled = true;

  try {
    const res = await fetch('https://n8n.srv1060901.hstgr.cloud/webhook/e03d09eb-88f5-46ed-81b4-99974fc016ff', {
      method: 'POST',
      body: form
    });

    if (!res.ok) throw new Error('Errore nella risposta del server.');

    const audioBlob = await res.blob();
    if (audioBlob.size < 100) throw new Error('File audio ricevuto non valido.');

    const url = URL.createObjectURL(audioBlob);
    audioEl.src = url;
    audioEl.hidden = false;
    audioEl.load();
    await audioEl.play().catch(() => console.warn('Autoplay bloccato.'));

    addMessage("Risposta vocale ricevuta.", "bot");
  } catch (err) {
    console.error(err);
    addMessage("⚠️ Errore: " + err.message, "bot");
  } finally {
    recordBtn.disabled = false;
    statusText.textContent = "In attesa di un nuovo messaggio.";
  }
}

recordBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = "🎤 Avvia registrazione";
    statusText.textContent = "Invio in corso...";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      addMessage("Registrazione completata. Invio...", "user");
      sendAudio(blob);
    };
    mediaRecorder.start();
    recordBtn.textContent = "⏹️ Ferma registrazione";
    statusText.textContent = "🎙️ Registrazione in corso...";
  } catch (err) {
    alert("Errore nell'accesso al microfono: " + err.message);
  }
};

