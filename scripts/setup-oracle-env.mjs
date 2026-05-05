import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const rootDir = process.cwd();
const oracleEnvPath = path.join(rootDir, "oracle", ".env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function normalizeProvider(input) {
  const normalized = input.trim().toLowerCase();
  if (normalized === "anthropic") {
    return "claude";
  }
  if (["ollama", "openai", "groq", "gemini", "claude"].includes(normalized)) {
    return normalized;
  }
  return "ollama";
}

function providerDefaultModel(provider) {
  if (provider === "openai") {
    return "gpt-4o-mini";
  }
  if (provider === "groq") {
    return "llama-3.3-70b-versatile";
  }
  if (provider === "gemini") {
    return "gemini-1.5-flash";
  }
  if (provider === "claude") {
    return "claude-3-5-sonnet-latest";
  }
  return "llama3.2";
}

async function main() {
  console.log("Strand Oracle LLM setup");
  console.log("Supported providers: ollama, openai, groq, gemini, claude");
  console.log("");

  const providerInput = await ask("Choose LLM_PROVIDER [ollama]: ");
  const provider = normalizeProvider(providerInput || "ollama");
  const modelInput = await ask(
    `Model for ${provider} [${providerDefaultModel(provider)}]: `
  );
  const model = modelInput || providerDefaultModel(provider);

  let openAiKey = "";
  let groqKey = "";
  let geminiKey = "";
  let anthropicKey = "";

  if (provider === "openai") {
    openAiKey = await ask("Enter OPENAI_API_KEY: ");
  } else if (provider === "groq") {
    groqKey = await ask("Enter GROQ_API_KEY: ");
  } else if (provider === "gemini") {
    geminiKey = await ask("Enter GEMINI_API_KEY: ");
  } else if (provider === "claude") {
    anthropicKey = await ask("Enter ANTHROPIC_API_KEY: ");
  }

  const envLines = [
    "ANCHOR_WALLET=../../.config/solana/id.json",
    "ANCHOR_PROVIDER_URL=https://api.devnet.solana.com",
    "ORACLE_KEYPAIR_PATH=./oracle-keypair.json",
    "STRAND_CORE_PROGRAM_ID=",
    "STRAND_SCORE_PROGRAM_ID=",
    "OLLAMA_BASE_URL=http://localhost:11434",
    `OLLAMA_MODEL=${provider === "ollama" ? model : "llama3.2"}`,
    "",
    `LLM_PROVIDER=${provider}`,
    "",
    `OPENAI_API_KEY=${openAiKey}`,
    `OPENAI_MODEL=${provider === "openai" ? model : "gpt-4o-mini"}`,
    "OPENAI_BASE_URL=https://api.openai.com/v1",
    "",
    `GROQ_API_KEY=${groqKey}`,
    `GROQ_MODEL=${provider === "groq" ? model : "llama-3.3-70b-versatile"}`,
    "GROQ_BASE_URL=https://api.groq.com/openai/v1",
    "",
    `GEMINI_API_KEY=${geminiKey}`,
    `GEMINI_MODEL=${provider === "gemini" ? model : "gemini-1.5-flash"}`,
    "",
    `ANTHROPIC_API_KEY=${anthropicKey}`,
    `CLAUDE_MODEL=${provider === "claude" ? model : "claude-3-5-sonnet-latest"}`
  ];

  fs.writeFileSync(oracleEnvPath, `${envLines.join("\n")}\n`, "utf8");
  rl.close();

  console.log("");
  console.log(`Created ${oracleEnvPath}`);
  console.log("Next: fill STRAND_CORE_PROGRAM_ID and STRAND_SCORE_PROGRAM_ID, then run npm run dev:oracle");
}

main().catch((error) => {
  console.error("Failed to generate oracle/.env:", error);
  rl.close();
  process.exit(1);
});
