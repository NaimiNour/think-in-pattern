import {
  CHATBOT_PROMPT,
  EXERCISE_PROMPT,
  RECOMMENDER_PROMPT,
} from "./prompts.js";

const API_KEY = window.GROQ_API_KEY || "";
const MODEL = "llama-3.3-70b-versatile"; // modèle gratuit Groq
const chatHistory = [];

async function askGroq(systemPrompt, messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

// Feature 1 — Pattern Recommender
window.runRecommender = async () => {
  const input = document.getElementById("rec-input").value.trim();
  if (!input) return;
  const output = document.getElementById("rec-output");
  const btn = event.target;
  output.className = "ai-output visible";
  output.textContent = "Analyzing your problem...";
  btn.disabled = true;
  try {
    const result = await askGroq(RECOMMENDER_PROMPT, [
      { role: "user", content: input },
    ]);
    output.textContent = result;
  } catch (e) {
    output.textContent = "Error: " + e.message;
  }
  btn.disabled = false;
};

// Feature 2 — Exercise Generator
window.runExercise = async () => {
  const pattern = document.getElementById("pattern-select").value;
  const level = document.getElementById("level-select").value;
  const output = document.getElementById("ex-output");
  const btn = event.target;
  output.className = "ai-output visible";
  output.textContent = "Generating exercise...";
  btn.disabled = true;
  try {
    const result = await askGroq(EXERCISE_PROMPT(pattern, level), [
      { role: "user", content: "Generate the exercise now." },
    ]);
    output.textContent = result;
  } catch (e) {
    output.textContent = "Error: " + e.message;
  }
  btn.disabled = false;
};

// Feature 3 — Chatbot
window.runChat = async () => {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";
  const history = document.getElementById("chat-history");

  const userBubble = document.createElement("div");
  userBubble.className = "chat-msg user";
  userBubble.textContent = msg;
  history.appendChild(userBubble);

  const loadingBubble = document.createElement("div");
  loadingBubble.className = "chat-msg ai loading";
  loadingBubble.textContent = "Thinking...";
  history.appendChild(loadingBubble);
  history.scrollTop = history.scrollHeight;

  chatHistory.push({ role: "user", content: msg });

  try {
    const result = await askGroq(CHATBOT_PROMPT, chatHistory);
    chatHistory.push({ role: "assistant", content: result });
    loadingBubble.className = "chat-msg ai";
    loadingBubble.textContent = result;
  } catch (e) {
    loadingBubble.textContent = "Error: " + e.message;
  }
  history.scrollTop = history.scrollHeight;
};

// Enter key pour le chat
document.getElementById("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") window.runChat();
});

// Navigation entre features
window.showFeature = (name) => {
  document
    .querySelectorAll(".feature-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".ftab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("feat-" + name).classList.add("active");
  event.target.classList.add("active");
};
