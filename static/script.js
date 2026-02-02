const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
rec.lang = "en-US";

const chat = document.getElementById("chat");

function addMessage(sender, text) {
    chat.innerHTML += `<div class="${sender}">${text}</div>`;
    chat.scrollTop = chat.scrollHeight;
}

function start() {
    addMessage("system", "🎧 Listening...");
    rec.start();
}

rec.onresult = async (e) => {
    const text = e.results[0][0].transcript;
    addMessage("user", text);

    const r = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
    });

    const data = await r.json();
    addMessage("bot", data.reply);

    const msg = new SpeechSynthesisUtterance(data.reply);
    speechSynthesis.speak(msg);
};
