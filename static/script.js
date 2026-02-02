// ---------- ELEMENTS ----------
const micBtn = document.getElementById("micBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const nextBtn = document.getElementById("nextBtn");

const statusText = document.getElementById("status");
const avatar = document.getElementById("avatar");

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
  statusText.innerText = `You said: "${userText}"`;
  clearIndicator();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();
    speak(data.reply);

  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Error talking to server";
    clearIndicator();
  }
};

// ---------- SPEECH ERROR ----------
recognition.onerror = () => {
  statusText.innerText = "❌ Could not recognize speech";
  clearIndicator();
};

// ---------- SPEAK FUNCTION ----------
function speak(text) {
  speechSynthesis.cancel(); // stop any previous speech
  clearIndicator();
  setSpeaking();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "en-US";

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
  recognition.abort();       // stop listening if active
  speechSynthesis.cancel();  // stop speaking
  clearIndicator();
  statusText.innerText = "🎤 Ready for next question";
};
