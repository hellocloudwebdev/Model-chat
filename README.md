<div align="center">

# ✨ Model Chat

### Compare AI models side by side in real-time

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Features

- **Multi-Model Comparison** — Send one prompt and get responses from multiple AI models simultaneously
- **Token Usage & Latency** — See response time and token consumption for each model
- **Configurable Base URL** — Works with OpenRouter, Groq, Together AI, Ollama, or any OpenAI-compatible API
- **Auto-Fetch Models** — Automatically fetch available models from your API endpoint
- **Favorites System** — Favorite up to 6 fetched models for quick access
- **Dual Endpoint Support** — Supports both `/chat/completions` and `/responses` endpoints
- **Local Model Support** — Connect to Ollama or any local OpenAI-compatible server
- **Modern UI** — Clean, responsive interface with smooth animations

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- An API key from [OpenRouter](https://openrouter.ai/keys), [Groq](https://console.groq.com/keys), [Together AI](https://api.together.xyz/settings/api-keys), or any OpenAI-compatible provider

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/Model-chat.git
cd Model-chat

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### 1. Set Your API Provider

Click **Settings** → **API** tab:

| Field | Description | Example |
|-------|-------------|---------|
| **Base URL** | Your provider's API base URL | `https://openrouter.ai/api/v1` |
| **API Key** | Your API key | `sk-or-v1-...` |
| **Endpoint Type** | API format | `Chat Completions` or `Responses` |

### 2. Popular Providers

| Provider | Base URL |
|----------|----------|
| OpenRouter | `https://openrouter.ai/api/v1` |
| Groq | `https://api.groq.com/openai/v1` |
| Together AI | `https://api.together.xyz/v1` |
| OpenAI | `https://api.openai.com/v1` |
| Anthropic | `https://api.anthropic.com/v1` |
| Local (Ollama) | `http://localhost:11434/v1` |

### 3. Fetch & Favorite Models

1. Enter your Base URL and API Key
2. Click **Fetch Models**
3. Star your favorites (max 6)
4. Only favorited models appear in the selector

---

## Usage

```
1. Select models from the grid (up to 5)
2. Type your message
3. Press Enter
4. Compare responses side by side with latency & token stats
```

### Built-in Models

| Model | Provider | Context |
|-------|----------|---------|
| Grok 4.3 | xAI | 1M tokens |
| GPT-OSS 120B | OpenAI | 131K tokens |
| GPT-4.1 Mini | OpenAI | 128K tokens |
| Claude 3 Haiku | Anthropic | 200K tokens |
| Codestral 2508 | Mistral AI | 256K tokens |
| LLaMA 3.3 70B | Meta | 128K tokens |
| Gemini 2.5 Flash | Google | 1M tokens |
| Nemotron 3 Ultra | Nvidia | 1M tokens (Free) |
| Gemma 4 31B | Google | 262K tokens (Free) |

---

## Local Models

Connect to local models via Ollama:

1. Install [Ollama](https://ollama.ai)
2. Pull a model: `ollama pull llama3`
3. Go to **Settings** → **Local Models**
4. Add your model with endpoint `http://localhost:11434`

---

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Markdown:** React Markdown + Syntax Highlighter

---

## Project Structure

```
Model-chat/
├── src/
│   ├── components/       # UI Components
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ...
│   ├── config/
│   │   └── models.ts     # Built-in model definitions
│   ├── hooks/
│   │   └── useChat.ts    # Chat state management
│   ├── services/
│   │   ├── api.ts        # API communication
│   │   └── settings.ts   # Settings persistence
│   ├── types/
│   │   └── index.ts      # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run build:single  # Build as single HTML file
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with React + TypeScript + Tailwind CSS**

</div>
