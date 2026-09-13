# ⚖️ ProContra — AI-Assisted Weighted Decision Making

<p align="center">
  <img src="https://raw.githubusercontent.com/Doginnet/pro-contra/main/public/favicon.svg" width="80" height="80" alt="ProContra Logo" />
</p>

<p align="center">
  <b>A minimalist, lightning-fast desktop application for weighing difficult decisions using a 10-point Pro & Contra matrix, interactive balance meter, and an embedded AI Decision Advisor powered by Google Gemini (and OpenAI-compatible LLMs).</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-44-47848F?logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Google_Gemini-3.x-8E75B2?logo=google-gemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## ✨ Key Features

### 1. 📋 Two-Sided Split Board
- **Dedicated Columns**: **PRO (For)** in subtle emerald accents and **CONTRA (Against)** in crimson rose accents.
- **1–10 Scale Weighting**: Smooth interactive sliders for each argument with qualitative tiers (*Minor, Moderate, Major, Critical*).
- **Fast Entry**: Add new arguments seamlessly with the `Enter` key while setting initial weight.

### 2. ⚖️ Interactive Tug-of-War Balance Bar
- Real-time score aggregation and percentage split calculations (*e.g., 64% PRO vs 36% CONTRA*).
- Dynamic visual Tug-of-War bar with a center parity indicator and instant lean visualization.
- Verbal verdict calculating exact point spreads (*e.g., "🏆 Lean towards PRO by +11 pts (64% vs 36%)"*).

### 3. 🤖 AI Decision Coach ("ASK AGENT")
A non-intrusive right slide-out panel that lets you consult AI without losing sight of your arguments. The entire dilemma context (title, description, arguments, and weights) is formatted and injected into the prompt.

- 📊 **Deep Analysis**: Objective strategic assessment, reversible vs irreversible risk evaluation, and high-leverage closing questions.
- 💡 **Brainstorm Factors**: AI identifies overlooked blind spots and surfaces candidate reasons. Add any suggested card to your board in **1 click**!
- 😈 **Devil's Advocate**: Rigorously challenges your assumptions, audits subjective weights, detects cognitive biases (*loss aversion, optimism bias, status quo bias*), and runs a pre-mortem failure simulation.
- 💬 **Ephemeral Multi-Turn Dialogue**: Ask follow-up questions, introduce new nuances, or discuss trade-offs. The chat session remains active in memory and resets on demand.
- 🌍 **Multilingual Intelligence**: Write in **any language** (Russian, English, Spanish, German, etc.) — the AI automatically matches your language for all responses and brainstorm cards.

### 4. 🔌 LLM Provider Flexibility
- **Google Gemini**: Native integration with Google AI Studio API. Pre-configured with next-gen models: `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`, and `gemini-3.5-pro` (or any custom model identifier).
- **OpenAI Compatible**: Connect any custom endpoint — **OpenAI**, **OpenRouter**, **Groq**, **DeepSeek**, or local **Ollama** (`http://localhost:11434/v1`).
- Built-in connection tester for instant verification.

### 5. 💾 Persistence & Clean Export
- Autosaves all dilemmas locally in `localStorage`.
- Decision manager modal to switch between dilemmas or start fresh.
- Export full structured decision dossiers to formatted **Markdown** (`.md`).
- Raycast / Linear-inspired dark aesthetic with instant toggle to light mode.

---

## 🛠️ Tech Stack

- **Desktop Shell**: [Electron](https://www.electronjs.org/)
- **UI Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vite.dev/) + `vite-plugin-electron`
- **Styles**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integrations**: Google Gemini REST API & OpenAI Chat Completions API

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm, pnpm, or yarn

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Doginnet/pro-contra.git
   cd pro-contra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development mode (Vite + Electron):
   ```bash
   npm run dev
   ```

---

## 📦 Packaging for Production

To build a standalone desktop executable for your operating system:

```bash
# Build TypeScript and Vite/Electron bundles
npm run build

# Package desktop installer (Windows .exe, macOS .dmg, Linux AppImage)
npm run package
```

Built installers will be generated in the `release/` or `dist/` directory.

---

## ⚙️ Setting Up Your API Key

1. Launch the app and click the **⚙️ (Settings)** icon in the top right.
2. For Gemini: Grab a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and paste it in.
3. Click **"Test Connection"** and then **"Save"**.

---

## 📄 License

Distributed under the [MIT](LICENSE) License. Contributions and feature suggestions are welcome!
