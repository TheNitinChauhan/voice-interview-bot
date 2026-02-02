const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = false;

micBtn.onclick = () => {
  statusText.innerText = "🎙️ Listening...";
  recognition.start();
};

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  statusText.innerText = `You said: "${userText}"`;

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
  }
};

recognition.onerror = () => {
  statusText.innerText = "❌ Could not recognize speech";
};

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
