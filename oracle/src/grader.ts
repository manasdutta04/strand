export interface GradeResult {
  verified_skills: string[];
  confidences: number[];
  quality_rating: number;
}

export type LlmProvider = "ollama" | "openai" | "groq" | "gemini" | "claude";

export interface LlmConfigOverride {
  provider?: LlmProvider;
  apiKey?: string;
  model?: string;
}

const DEFAULT_PROVIDER: LlmProvider = "ollama";
const REQUEST_TIMEOUT_MS = 30_000;
const OLLAMA_BASE_URL_DEFAULT = "http://localhost:11434";

interface ResolvedLlmConfig {
  provider: LlmProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

function isSupportedProvider(value: string): value is LlmProvider {
  return (
    value === "openai" ||
    value === "groq" ||
    value === "gemini" ||
    value === "claude" ||
    value === "ollama"
  );
}

function normalizeProvider(raw: string): LlmProvider {
  const normalized = raw.trim().toLowerCase();
  const canonical = normalized === "anthropic" ? "claude" : normalized;
  if (!isSupportedProvider(canonical)) {
    throw new Error(
      `Unsupported LLM_PROVIDER "${raw}". Supported values: ollama, openai, groq, gemini, claude`
    );
  }
  return canonical;
}

function getProviderFromEnv(): LlmProvider {
  const raw = String(process.env.LLM_PROVIDER ?? DEFAULT_PROVIDER);
  if (!raw.trim()) {
    return DEFAULT_PROVIDER;
  }
  return normalizeProvider(raw);
}

function getModelForProvider(provider: LlmProvider, override?: string): string {
  if (override && override.trim().length > 0) {
    return override.trim();
  }

  if (provider === "openai") {
    return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }
  if (provider === "groq") {
    return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  }
  if (provider === "gemini") {
    return process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  }
  if (provider === "claude") {
    return process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-latest";
  }
  return process.env.OLLAMA_MODEL ?? "llama3.2";
}

function getApiKey(provider: Exclude<LlmProvider, "ollama">, override?: string): string {
  if (override && override.trim().length > 0) {
    return override.trim();
  }

  if (provider === "openai") {
    return process.env.OPENAI_API_KEY ?? "";
  }
  if (provider === "groq") {
    return process.env.GROQ_API_KEY ?? "";
  }
  if (provider === "gemini") {
    return process.env.GEMINI_API_KEY ?? "";
  }
  return process.env.ANTHROPIC_API_KEY ?? "";
}

function resolveLlmConfig(override?: LlmConfigOverride): ResolvedLlmConfig {
  const provider =
    override?.provider && override.provider.trim().length > 0
      ? normalizeProvider(override.provider)
      : getProviderFromEnv();
  const model = getModelForProvider(provider, override?.model);

  if (provider === "ollama") {
    const baseUrl = String(process.env.OLLAMA_BASE_URL ?? OLLAMA_BASE_URL_DEFAULT).trim();
    return {
      provider,
      model,
      baseUrl: baseUrl.length > 0 ? baseUrl : OLLAMA_BASE_URL_DEFAULT
    };
  }

  const apiKey = getApiKey(provider, override?.apiKey);
  if (!apiKey) {
    const envKeyByProvider: Record<Exclude<LlmProvider, "ollama">, string> = {
      openai: "OPENAI_API_KEY",
      groq: "GROQ_API_KEY",
      gemini: "GEMINI_API_KEY",
      claude: "ANTHROPIC_API_KEY"
    };
    throw new Error(
      `Missing API key for provider "${provider}". Set ${envKeyByProvider[provider]} in oracle/.env`
    );
  }

  if (provider === "openai") {
    return {
      provider,
      model,
      apiKey,
      baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").trim()
    };
  }
  if (provider === "groq") {
    return {
      provider,
      model,
      apiKey,
      baseUrl: (process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1").trim()
    };
  }
  return { provider, model, apiKey };
}

function buildPrompt(workSampleUrl: string, claimedSkills: string[]): string {
  return `You are a technical skill verifier for Strand, a professional
credentialing protocol on Solana.

Work sample URL: ${workSampleUrl}
Worker claims these skills: ${claimedSkills.join(", ")}

Your job: verify which skills are actually demonstrated in this work.

Respond ONLY with a JSON object. No explanation, no markdown, no text before or after.
Exactly this format:
{"verified_skills":["skill1"],"confidences":[85],"quality_rating":4}

Rules:
- confidences are integers 0-100
- quality_rating is integer 1-5
- Only list skills you can actually verify from the work sample URL
- Exclude any skill with confidence below 65
- If the URL is a GitHub repo, infer skills from languages, frameworks, and code patterns
- If URL is inaccessible, return {"verified_skills":[],"confidences":[],"quality_rating":0}`;
}

function extractJsonObject(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error("Model response did not include a JSON object.");
  }
  return raw.slice(start, end + 1);
}

function normalizeResult(value: unknown): GradeResult {
  const parsed = value as Partial<GradeResult>;
  return {
    verified_skills: Array.isArray(parsed?.verified_skills) ? parsed.verified_skills : [],
    confidences: Array.isArray(parsed?.confidences)
      ? parsed.confidences.map((item) => Math.max(0, Math.min(100, Math.trunc(Number(item)))))
      : [],
    quality_rating:
      Number.isInteger(parsed?.quality_rating) && Number(parsed.quality_rating) >= 0
        ? Number(parsed.quality_rating)
        : 0
  };
}

async function requestOllama(prompt: string, model: string): Promise<string> {
  const baseUrl = String(process.env.OLLAMA_BASE_URL ?? OLLAMA_BASE_URL_DEFAULT).trim();
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json"
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { response?: string };
  if (!data.response) {
    throw new Error("Ollama response payload missing response field");
  }
  return data.response;
}

async function requestOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  providerName: "OpenAI" | "Groq"
): Promise<string> {
  if (!apiKey) {
    throw new Error(`${providerName} API key is required.`);
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`${providerName} request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${providerName} response payload missing message content`);
  }
  return content;
}

async function requestGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is required.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("Gemini response payload missing text content");
  }
  return content;
}

async function requestClaude(apiKey: string, model: string, prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Anthropic API key is required.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }]
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Claude request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = data.content?.find((item) => item.type === "text")?.text;
  if (!text) {
    throw new Error("Claude response payload missing text content");
  }
  return text;
}

export async function gradeWorkSample(
  workSampleUrl: string,
  claimedSkills: string[],
  override?: LlmConfigOverride
): Promise<GradeResult> {
  const config = resolveLlmConfig(override);
  const prompt = buildPrompt(workSampleUrl, claimedSkills);

  let rawResponse = "";
  if (config.provider === "ollama") {
    rawResponse = await requestOllama(prompt, config.model);
  } else if (config.provider === "openai") {
    rawResponse = await requestOpenAiCompatible(
      config.baseUrl ?? "https://api.openai.com/v1",
      config.apiKey ?? "",
      config.model,
      prompt,
      "OpenAI"
    );
  } else if (config.provider === "groq") {
    rawResponse = await requestOpenAiCompatible(
      config.baseUrl ?? "https://api.groq.com/openai/v1",
      config.apiKey ?? "",
      config.model,
      prompt,
      "Groq"
    );
  } else if (config.provider === "gemini") {
    rawResponse = await requestGemini(config.apiKey ?? "", config.model, prompt);
  } else {
    rawResponse = await requestClaude(config.apiKey ?? "", config.model, prompt);
  }

  const parsed = JSON.parse(extractJsonObject(rawResponse));
  return normalizeResult(parsed);
}
