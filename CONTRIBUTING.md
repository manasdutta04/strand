# Contributing to Strand

First off, thank you for considering contributing to Strand! It's people like you that make Strand such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [Strand Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please provide a clear and detailed explanation of the feature you want and why it's needed.

### Pull Requests

The process described here has several goals:

- Maintain Strand's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Strand
- Enable a sustainable system for Strand's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in the template
2. Follow the styleguides
3. After you submit your pull request, verify that all status checks are passing

## Environment Setup

To set up the development environment, follow these steps:

1. Install prerequisites: Node.js 18+, Rust 1.75+, Solana CLI 1.18+, Anchor 0.31.x.
2. Choose an oracle provider:
	- Local Ollama: install Ollama and run `ollama pull llama3.2`
	- Cloud mode: set `LLM_PROVIDER` to `openai`, `groq`, `gemini`, or `claude`, then provide the matching API key in `oracle/.env`
3. Configure Solana to devnet:
	- `solana config set --url devnet`
4. Install dependencies:
	- `npm install`
5. Build programs:
	- `anchor build`
6. Set environment values:
	- Fill `STRAND_CORE_PROGRAM_ID`, `STRAND_SCORE_PROGRAM_ID`, `STRAND_CREDIT_PROGRAM_ID` in `oracle/.env`.
	- Set `LLM_PROVIDER` in `oracle/.env` to one of: `ollama`, `openai`, `groq`, `gemini`, `claude`.
	- If using cloud provider mode, fill the matching API key (`OPENAI_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, or `ANTHROPIC_API_KEY`) and provider model/base URL values.
	- Fill `NEXT_PUBLIC_STRAND_*` values in `app/.env`.
7. Run services:
	- Oracle: `cd oracle && npm run dev`
	- Frontend: `cd app && npm run dev`

## Run The Full App

When you want to start the complete local demo stack, use these commands from the repo root:

```bash
npm run setup:oracle-env
npm run dev:oracle
npm run dev:app
```

If you want the fully manual version:

```bash
npm install
npm run setup:oracle-env

# then open two terminals
cd oracle
npm run dev

cd app
npm run dev
```

Helpful checks:

```bash
npm run build
npm run test:anchor
npm run lint
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Coding Standards

* Keep your code clean, well-documented, and readable.
* Write tests for new features and bug fixes.
* Run `npm run lint` and `npm run test` before submitting your PR, ensuring all checks pass. (or the equivalent for Rust/Anchor: `cargo clippy`, `anchor test`, etc.)

Thank you for contributing!
