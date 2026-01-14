import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnalysisResult {
  name: string;
  description: string | null;
  expirationDate: string | null;
  category: string;
  confidence: number;
}

interface ImageInput {
  base64: string;
  mimeType: string;
}

export async function analyzeImages(
  frontImage: ImageInput,
  expirationImage?: ImageInput,
  language: "da" | "en" = "en"
): Promise<AnalysisResult> {
  console.log("[Anthropic] analyzeImages called");
  console.log("[Anthropic] frontImage base64 length:", frontImage.base64?.length || 0);
  console.log("[Anthropic] frontImage mimeType:", frontImage.mimeType);
  console.log("[Anthropic] expirationImage provided:", !!expirationImage);

  const frontMediaType = frontImage.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const imageContent: Anthropic.ImageBlockParam[] = [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: frontMediaType,
        data: frontImage.base64,
      },
    },
  ];

  if (expirationImage) {
    const expMediaType = expirationImage.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    console.log("[Anthropic] Adding expiration image, mimeType:", expMediaType);
    imageContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: expMediaType,
        data: expirationImage.base64,
      },
    });
  }

  const languageInstruction = language === "da"
    ? "IMPORTANT: Write the name and description in Danish."
    : "Write the name and description in English.";

  const today = new Date().toISOString().split("T")[0];
  const expirationDateNote = `Note: Today's date is ${today}. Expiration dates are almost never in the past (users are scanning items they're adding to their inventory). If you read a date that appears to be in the past, it's likely you misread it or it's a manufacturing date, not an expiration date. Only return an expirationDate in the past if you are absolutely certain.`;

  const promptText = expirationImage
    ? `You are analyzing two images of a food or emergency supply item:
- Image 1: The front/label of the product
- Image 2: The area showing the expiration/best-by date

Extract the following information and return it as JSON:

1. "name": The product name (be specific, include brand if visible)
2. "description": A brief description of the item
3. "expirationDate": The expiration date from image 2 (format: YYYY-MM-DD), or null if not visible
4. "category": One of: WATER, CANNED_FOOD, DRY_GOODS, FIRST_AID, TOOLS, HYGIENE, DOCUMENTS, OTHER
5. "confidence": A number from 0 to 1 indicating how confident you are in the analysis

${expirationDateNote}

${languageInstruction}

Return ONLY valid JSON, no other text. Example:
{"name": "Campbell's Chicken Noodle Soup", "description": "Canned soup, ready to heat and serve", "expirationDate": "2025-06-15", "category": "CANNED_FOOD", "confidence": 0.95}`
    : `Analyze this image of a food or emergency supply item. Extract the following information and return it as JSON:

1. "name": The product name (be specific, include brand if visible)
2. "description": A brief description of the item
3. "expirationDate": The expiration date if visible (format: YYYY-MM-DD), or null if not visible
4. "category": One of: WATER, CANNED_FOOD, DRY_GOODS, FIRST_AID, TOOLS, HYGIENE, DOCUMENTS, OTHER
5. "confidence": A number from 0 to 1 indicating how confident you are in the analysis

${expirationDateNote}

${languageInstruction}

Return ONLY valid JSON, no other text. Example:
{"name": "Campbell's Chicken Noodle Soup", "description": "Canned soup, ready to heat and serve", "expirationDate": "2025-06-15", "category": "CANNED_FOOD", "confidence": 0.95}`;

  console.log("[Anthropic] Sending request to Claude API...");
  console.log("[Anthropic] Model: claude-haiku-4-5");
  console.log("[Anthropic] Number of images:", imageContent.length);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: promptText,
          },
        ],
      },
    ],
  });

  console.log("[Anthropic] Response received");
  console.log("[Anthropic] Response stop_reason:", response.stop_reason);
  console.log("[Anthropic] Response content blocks:", response.content.length);

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    console.error("[Anthropic] No text content in response");
    throw new Error("No text response from AI");
  }

  console.log("[Anthropic] Text response:", textContent.text);

  // Extract JSON from the response - handle markdown code blocks
  let jsonText = textContent.text.trim();

  // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  // Try to find JSON object if there's extra text
  if (!jsonText.startsWith("{")) {
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
  }

  try {
    const result = JSON.parse(jsonText) as AnalysisResult;
    console.log("[Anthropic] Parsed result:", result);
    return result;
  } catch (parseError) {
    console.error("[Anthropic] JSON parse error:", parseError);
    console.error("[Anthropic] Raw text was:", textContent.text);
    console.error("[Anthropic] Attempted to parse:", jsonText);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Keep backwards compatibility
export async function analyzeImage(imageBase64: string, mimeType: string, language: "da" | "en" = "en"): Promise<AnalysisResult> {
  return analyzeImages({ base64: imageBase64, mimeType }, undefined, language);
}

export default anthropic;
