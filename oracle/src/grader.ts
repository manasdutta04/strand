export interface GradeResult {
  verified_skills: string[];
  confidences: number[];
  quality_rating: number;
}

export async function gradeWorkSample(
  workSampleUrl: string,
  claimedSkills: string[]
): Promise<GradeResult> {
  const prompt = `You are a technical skill verifier for Strand, a professional 
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

  const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
      prompt,
      stream: false,
      format: "json"
    }),
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { response?: string };
  if (!data.response) {
    throw new Error("Ollama response payload missing response field");
  }

  const parsed = JSON.parse(data.response) as GradeResult;
  return {
    verified_skills: Array.isArray(parsed.verified_skills) ? parsed.verified_skills : [],
    confidences: Array.isArray(parsed.confidences) ? parsed.confidences : [],
    quality_rating: Number.isInteger(parsed.quality_rating)
      ? parsed.quality_rating
      : 0
  };
}
