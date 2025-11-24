const apiKey = process.env.API_KEY; // set this in Vercel

export async function simplifyText(
  text: string,
  instruction: string,
  useBullets: boolean,
  targetLanguage: string = "Original"
) {
  if (!apiKey) throw new Error("API_KEY is missing!");

  const formattingInstruction = useBullets
    ? "3. Organize information using clear bullet points where appropriate to improve readability."
    : "3. Do NOT use bullet points. Write in clear, concise paragraphs.";

  const languageInstruction =
    targetLanguage && targetLanguage !== "Original" && targetLanguage !== "English"
      ? `IMPORTANT: Translate the simplified text into ${targetLanguage}. Ensure the translation is culturally appropriate and uses standard medical terminology for that language.`
      : "Ensure the text remains in the same language as the Original Text.";

  const prompt = `
    You are an expert health communicator specializing in health literacy and patient education.
    Your task is to rewrite the following health education text based on the specific instruction provided.

    Instruction: ${instruction}

    Guidelines:
    1. Maintain all medical accuracy and key instructions.
    2. Use active voice.
    ${formattingInstruction}
    4. Return ONLY the rewritten text. 
    5. Do NOT include conversational filler like "Here is the rewritten text".
    6. Do NOT use markdown bolding (do not use double asterisks **).
    7. Ensure the tone is empathetic but professional.
    8. ${languageInstruction}
    9. Do NOT add advice, conclusions, summaries, or new facts. Use ONLY the exact information that appears in the original text. If something is not explicitly written in the original text, do NOT include it.”

    Original Text:
    "${text}"
  `;

try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug log
    
    return data?.choices?.[0]?.message?.content || "Could not generate a response.";
  } catch (error) {
    console.error("Error in simplifyText:", error);
    throw error;
  }
}
