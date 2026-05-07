export interface WorkRecordData {
  earning_amount_usdc: number;
  delivery_count: number;
  platform: string;
  verified: boolean;
  extracted_at: string;
}

export type LLMProvider = "ollama" | "openai" | "anthropic" | "gemini" | "groq";

/**
 * Parse earnings PDF using vision model from selected provider
 * Returns structured work record data extracted from the PDF
 */
export async function parseEarningsPdf(
  base64Pdf: string,
  platform: string,
  fileName: string
): Promise<WorkRecordData> {
  const provider = (process.env.LLM_PROVIDER as LLMProvider) || "ollama";

  switch (provider) {
    case "ollama":
      return parseWithOllama(base64Pdf, platform, fileName);
    case "openai":
      return parseWithOpenAI(base64Pdf, platform, fileName);
    case "anthropic":
      return parseWithAnthropic(base64Pdf, platform, fileName);
    case "gemini":
      return parseWithGemini(base64Pdf, platform, fileName);
    case "groq":
      return parseWithGroq(base64Pdf, platform, fileName);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ============= OLLAMA (LOCAL) =============
async function parseWithOllama(
  base64Pdf: string,
  platform: string,
  _fileName: string
): Promise<WorkRecordData> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2-vision";

  const prompt = `You are an earnings verification agent. Analyze the provided earnings screenshot/PDF from ${platform} and extract:
1. Total earnings amount (in USD)
2. Number of deliveries/tasks completed

Respond in JSON format only:
{
  "earning_amount_usdc": <number>,
  "delivery_count": <number>,
  "verified": true
}

If you cannot extract the data, set verified to false.`;

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      images: [base64Pdf],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  const responseText = data.response || "";

  try {
    const json = JSON.parse(responseText);
    return {
      ...json,
      platform,
      extracted_at: new Date().toISOString()
    };
  } catch {
    throw new Error(`Failed to parse Ollama response as JSON: ${responseText}`);
  }
}

// ============= OPENAI (gpt-4o) =============
async function parseWithOpenAI(
  base64Pdf: string,
  platform: string,
  _fileName: string
): Promise<WorkRecordData> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an earnings verification agent. Analyze the provided earnings screenshot from ${platform} and extract:
1. Total earnings amount (in USD)
2. Number of deliveries/tasks completed

Respond in JSON format only:
{
  "earning_amount_usdc": <number>,
  "delivery_count": <number>,
  "verified": true
}

If you cannot extract the data, set verified to false.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64Pdf}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  const content = data.choices[0]?.message?.content || "";

  try {
    const json = JSON.parse(content);
    return {
      ...json,
      platform,
      extracted_at: new Date().toISOString()
    };
  } catch {
    throw new Error(`Failed to parse OpenAI response as JSON: ${content}`);
  }
}

// ============= ANTHROPIC (Claude) =============
async function parseWithAnthropic(
  base64Pdf: string,
  platform: string,
  _fileName: string
): Promise<WorkRecordData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  const model = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an earnings verification agent. Analyze the provided earnings document from ${platform} and extract:
1. Total earnings amount (in USD)
2. Number of deliveries/tasks completed

Respond in JSON format only:
{
  "earning_amount_usdc": <number>,
  "delivery_count": <number>,
  "verified": true
}

If you cannot extract the data, set verified to false.`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  const content = data.content[0]?.text || "";

  try {
    const json = JSON.parse(content);
    return {
      ...json,
      platform,
      extracted_at: new Date().toISOString()
    };
  } catch {
    throw new Error(`Failed to parse Anthropic response as JSON: ${content}`);
  }
}

// ============= GOOGLE GEMINI =============
async function parseWithGemini(
  base64Pdf: string,
  platform: string,
  _fileName: string
): Promise<WorkRecordData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an earnings verification agent. Analyze the provided earnings document from ${platform} and extract:
1. Total earnings amount (in USD)
2. Number of deliveries/tasks completed

Respond in JSON format only:
{
  "earning_amount_usdc": <number>,
  "delivery_count": <number>,
  "verified": true
}

If you cannot extract the data, set verified to false.`
              },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Pdf
                }
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text || "";

  try {
    const json = JSON.parse(content);
    return {
      ...json,
      platform,
      extracted_at: new Date().toISOString()
    };
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${content}`);
  }
}

// ============= GROQ (text-only for now) =============
async function parseWithGroq(
  _base64Pdf: string,
  platform: string,
  _fileName: string
): Promise<WorkRecordData> {
  // Groq doesn't support vision yet, so return mock data
  console.warn(
    "⚠️  Groq does not yet support vision models. Returning mock data for earnings verification."
  );

  // In production, you could store the PDF and process it with Groq's text models
  // after converting PDF to text with a separate service
  return {
    earning_amount_usdc: 150,
    delivery_count: 12,
    platform,
    verified: false,
    extracted_at: new Date().toISOString()
  };
}
