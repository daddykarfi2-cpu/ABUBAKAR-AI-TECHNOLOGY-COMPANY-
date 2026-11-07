const API_URL = "https://abubakar-ai-platform.onrender.com/api/chat";

const chatState = {
  history: [],
  isLoading: false
};

async function sendMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage || chatState.isLoading) {
    return null;
  }

  chatState.isLoading = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: cleanMessage,
        history: chatState.history
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed");
    }

    const reply = data.reply;

    chatState.history.push(
      { role: "user", parts: [{ text: cleanMessage }] },
      { role: "model", parts: [{ text: reply }] }
    );

    return reply;
  } catch (error) {
    console.error("ABUBAKAR AI Error:", error);
    return "An samu matsala wajen haduwa da AI. Ka sake gwadawa.";
  } finally {
    chatState.isLoading = false;
  }
}

function clearChatHistory() {
  chatState.history = [];
}

window.ABUBAKAR_AI = {
  sendMessage,
  clearChatHistory
};
