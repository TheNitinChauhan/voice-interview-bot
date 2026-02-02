const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");

micBtn.addEventListener("click", async () => {
  statusText.innerText = "Requesting microphone access...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    statusText.innerText = "🎙️ Listening...";

    // Just for test — stop mic after 5 sec
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
      statusText.innerText = "Mic working ✅ (recording stopped)";
    }, 5000);

  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Microphone permission denied";
  }
});
