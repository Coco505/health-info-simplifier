// OpenRouter API key from environment variables
const apiKey = process.env.OPENROUTER_API_KEY;

export async function simplifyText(
  text: string, 
  instruction: string, 
  useBullets: boolean,
  targetLanguage: string = 'Original'
): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add OPENROUTER_API_KEY to your Vercel Environment Variables and redeploy.");
  }

  // Construct formatting instruction based on user preference
  const formattingInstruction = useBullets 
    ? "3. Organize information using clear bullet points where appropriate to improve readability." 
    : "3. Do NOT use bullet points. Write in clear, concise paragraphs.";

  const languageInstruction = (targetLanguage && targetLanguage !== 'Original' && targetLanguage !== 'English')
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

    Original Text:
    "${text}"
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'Health Text Simplifier'
      },
      body: JSON.stringify({
        model: 'google/gemma-2-27b-it:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Unexpected API response format");
    }
    
    return data.choices[0].message.content || "Could not generate a response.";
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw new Error("Failed to simplify text. Please check your API key and try again.");
  }
}