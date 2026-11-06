const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const menuButton = document.getElementById("menuButton");

function addMessage(message, sender) {
  const messageElement = document.createElement("div");

  messageElement.className =
    sender === "user" ? "user-message" : "ai-message";

  messageElement.textContent = message;

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageElement;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) return;

  addMessage(message, "user");
  messageInput.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "Thinking...";

  const loadingMessage = addMessage(
    "ABUBAKAR AI is thinking...",
    "ai"
  );

  try {
    const reply = await window.ABUBAKAR_AI.sendMessage(message);

    loadingMessage.textContent =
      reply || "No response received. Please try again.";

  } catch (error) {
    loadingMessage.textContent =
      "An error occurred. Please try again.";
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send";
    messageInput.focus();
  }
});

menuButton.addEventListener("click", () => {
  const navigation = document.querySelector(".navbar nav");

  navigation.classList.toggle("mobile-visible");
});
