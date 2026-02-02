// ---------- ELEMENTS ----------
const micBtn = document.getElementById("micBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const nextBtn = document.getElementById("nextBtn");
const sendTextBtn = document.getElementById("sendTextBtn");

const statusText = document.getElementById("status");
const avatar = document.getElementById("avatar");
const chatBox = document.getElementById("chatBox");
const textInput = document.getElementById("textInput");
const botSubtitleToggle = document.getElementById("botSubtitleToggle");

// ---------- CHAT HELPERS ----------
function addMessage(type, text) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---------- VOICE INDICATOR HELPERS ----------
function setListening() {
  avatar.classList.add("listening");
  avatar.classList.remove("speaking");
}

function setSpeaking() {
  avatar.classList.remove("listening");
  avatar.classList.add("speaking");
}

function clearIndicator() {
  avatar.classList.remove("listening");
  avatar.classList.remove("speaking");
}

// ---------- SPEECH RECOGNITION ----------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = false;

// ---------- SPEECH SYNTHESIS ----------
let currentUtterance = null;

// ---------- MIC BUTTON ----------
micBtn.onclick = () => {
  statusText.innerText = "🎙️ Listening...";
  clearIndicator();
  setListening();
  recognition.start();
};

// ---------- ON SPEECH RESULT ----------
recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  addMessage("user", userText);
  statusText.innerText = "🧠 Thinking...";
  clearIndicator();

  await handleBotResponse(userText);
};

// ---------- SPEECH ERROR ----------
recognition.onerror = () => {
  statusText.innerText = "❌ Could not recognize speech";
  clearIndicator();
};

// ---------- TEXT INPUT ----------
sendTextBtn.onclick = async () => {
  const text = textInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  textInput.value = "";
  statusText.innerText = "🧠 Thinking...";

  await handleBotResponse(text);
};

// ---------- BOT RESPONSE HANDLER ----------
async function handleBotResponse(userText) {
  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();

    // Subtitle (only if toggle ON)
    if (botSubtitleToggle.checked) {
      addMessage("bot", data.reply);
    }

    speak(data.reply);

  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Error talking to server";
    clearIndicator();
  }
}

// ---------- SPEAK FUNCTION ----------
function speak(text) {
  speechSynthesis.cancel();
  clearIndicator();
  setSpeaking();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "en-US";
  currentUtterance.rate = 0.9;

  currentUtterance.onend = () => {
    clearIndicator();
    currentUtterance = null;
    statusText.innerText = "🎤 Ready for next question";
  };

  speechSynthesis.speak(currentUtterance);
}

// ---------- PAUSE ----------
pauseBtn.onclick = () => {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    statusText.innerText = "⏸ Answer paused";
  }
};

// ---------- RESUME ----------
resumeBtn.onclick = () => {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    statusText.innerText = "▶ Resuming answer...";
  }
};

// ---------- NEXT QUESTION ----------
nextBtn.onclick = () => {
  recognition.abort();
  speechSynthesis.cancel();
  clearIndicator();
  statusText.innerText = "🎤 Ready for next question";
};
