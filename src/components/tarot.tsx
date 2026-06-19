import { useState } from "react";
import { cards } from "../cards";
import type { TarotCard } from "../types";

async function getAiAnswer(promptText: string) {
  const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
  console.log("КЛЮЧ:", import.meta.env.VITE_OPENROUTER_KEY);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Magic Tarot App",
        },
        body: JSON.stringify({
          model: "cohere/north-mini-code:free",
          messages: [
            {
              role: "system",
              content:
                "You are a mysterious Tarot reader. Answer cryptically, mystically, and briefly (2-3 sentences) in russian. Address the user directly.",
            },
            {
              role: "user",
              content: promptText,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error details:", data);
      return `API Error ${response.status}: ${data.error?.message || "Model unavailable"}`;
    }

    if (!data.choices || !data.choices[0]) {
      return "The spirits are tangled... API returned empty response.";
    }

    return data.choices[0].message.content;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown network error";
    console.error("Network Error:", error);
    return `Network Error: ${errorMessage}.`;
  }
}

export function TarotReader() {
  const [question, setQuestion] = useState("");
  const [card, setCard] = useState<TarotCard | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDrawCard = async () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    const drawnCard = cards[randomIndex] as TarotCard;

    setCard(drawnCard);
    setIsLoading(true);
    setAiResponse("");

    const prompt = `User's question: "${question}". Drawn Tarot card: ${drawnCard.name}. Give a short, mystical prediction in 2-3 sentences.`;

    try {
      const answer = await getAiAnswer(prompt);
      setAiResponse(answer);
    } catch (error) {
      setAiResponse("The spirits are unavailable right now... (Network error)");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tarot-container">
      <input
        className="searchInput"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask the cards a question..."
      />

      <button
        className="tarotBtn"
        onClick={handleDrawCard}
        disabled={isLoading || !question}
      >
        {isLoading ? "🔮 Consulting spirits..." : "✨ Draw a card"}
      </button>

      {card && (
        <div className="card-result">
          <h3>You drew: {card.name}</h3>
          <img
            src={card.image}
            alt={card.name}
            style={{ marginTop: "20px", borderRadius: "10px", width: "200px" }}
          />
        </div>
      )}

      {aiResponse && (
        <div className="ai-interpretation">
          <h4>Interpretation:</h4>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}
