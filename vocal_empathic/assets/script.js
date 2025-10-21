const chat = document.getElementById("chat");
const micButton = document.getElementById("micButton");
const audioEl = document.getElementById("replyAudio");

let mediaRecorder;
let chunks = [];
let isRecording = false;
let listeningMsg = null; // il fumetto “Sto ascoltando…”
let typing = null;       // i tre puntini del bot

// ===== utility chat =====
function addMessage(html, sender) {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = html;
  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

function addTypingIndicator() {
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

function base64ToBlob(base64, type) {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(clean);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type });
}

function playAudio(blob) {
  const url = URL.createObjectURL(blob);
  audioEl.src = url;
  audioEl.hidden = false;
  audioEl.load();
  audioEl.play().catch(() => {/* autoplay può essere bloccato */});
}

// ===== registrazione =====
async function startRecording(e) {
  e.preventDefault();
  if (isRecording) return;
  isRecording = true;
  micButton.classList.add("recording");

  // bubble utente in stile mockup (led rosso + testo)
  listeningMsg = addMessage(
    `<div class="recording-light"></div> Sto ascoltando`,
    "user"
  );

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // mimeType sicuro cross-browser
    const opts = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? { mimeType: "audio/webm;codecs=opus" }
      : {};
    mediaRecorder = new MediaRecorder(stream, opts);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      sendAudioToN8N(blob);
      // disattiva traccia microfono
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
  } catch (err) {
    isRecording = false;
    micButton.classList.remove("recording");
    addMessage(`⚠️ Errore microfono: ${err.message}`, "bot");
  }
}

function stopRecording(e) {
  e.preventDefault();
  if (!isRecording) return;
  isRecording = false;
  micButton.classList.remove("recording");

  // effetto molla come mockup
  micButton.classList.add("released");
  setTimeout(() => micButton.classList.remove("released"), 450);

  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  } else {
    // fallback: nessuna registrazione avviata
    addMessage("⚠️ Nessuna registrazione da inviare.", "bot");
  }
}

// ===== invio a n8n e gestione risposta =====
async function sendAudioToN8N(blob) {
  // mostra i tre puntini del bot
  typing = addTypingIndicator();

  const form = new FormData();
  // sessione temporanea (si resetta al refresh)
  if (!sessionStorage.getItem("sessionId_vocale_empatico")) {
    sessionStorage.setItem("sessionId_vocale_empatico", crypto.randomUUID());
  }
  const sessionId = sessionStorage.getItem("sessionId_vocale_empatico");

  form.append("sessionId", sessionId);
  form.append("file0", blob, "input.webm");

  try {
    const res = await fetch(
      "https://n8n.srv1060901.hstgr.cloud/webhook/dafa96e5-048b-4012-8035-416847fd8e17",
      { method: "POST", body: form }
    );

    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);

    const ct = res.headers.get("content-type") || "";

    // Caso 1: JSON { userText?, text|reply|output, audio? (base64) }
    if (ct.includes("application/json")) {
      const data = await res.json();

      // aggiorna la bubble utente con la TRASCRIZIONE se il backend la invia
      if (listeningMsg && data.userText) {
        listeningMsg.querySelector(".bubble").innerHTML = data.userText;
      } else if (listeningMsg) {
        // se non arriva trascrizione, metti un placeholder coerente
        listeningMsg.querySelector(".bubble").innerHTML = "🗣️ Messaggio vocale inviato";
      }

      // rimuovi i tre puntini e mostra la risposta testuale del bot
      if (typing) typing.remove();
      const replyText = data.output || data.text || data.reply || "🔊 Risposta vocale pronta.";
      addMessage(replyText, "bot");

      // riproduci audio se presente
      if (data.audio) {
        const audioBlob = base64ToBlob(data.audio, "audio/mpeg");
        playAudio(audioBlob);
      }
    } else {
      // Caso 2: il webhook restituisce direttamente un audio (blob)
      const audioBlob = await res.blob();

      // se non abbiamo ancora aggiornato la bubble utente, metti un placeholder
      if (listeningMsg) {
        listeningMsg.querySelector(".bubble").innerHTML = "🗣️ Messaggio vocale inviato";
      }

      if (typing) typing.remove();
      addMessage("🔊 Risposta vocale ricevuta", "bot");
      playAudio(audioBlob);
    }
  } catch (err) {
    if (typing) typing.remove();
    addMessage(`⚠️ Errore: ${err.message}`, "bot");
  } finally {
    listeningMsg = null;
  }
}

// ===== eventi (press-and-hold) =====
micButton.addEventListener("mousedown", startRecording);
micButton.addEventListener("touchstart", startRecording, { passive: false });

micButton.addEventListener("mouseup", stopRecording);
micButton.addEventListener("mouseleave", stopRecording);
micButton.addEventListener("touchend", stopRecording);
micButton.addEventListener("touchcancel", stopRecording);
