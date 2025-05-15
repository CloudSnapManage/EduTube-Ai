## 📄 `README.md`

````markdown
# ✨ EduTube AI - AI-Powered YouTube Learning Companion

![preview](./public/preview.png)

[![License: CC BY-SA 4.0]([https://img.shields.io/badge/License-MIT-yellow.svg](https://camo.githubusercontent.com/8893a5ee2d7f73909733da3e88ef024aab2bb1fce0ada8155499b8db59b4d148/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c6963656e73652d434325323042592d2d5341253230342e302d6c69676874677265792e737667))](LICENSE.md)
**EduTube AI** is a cutting-edge web application that turns any YouTube video into a dynamic, multilingual learning experience. Built with **Next.js**, **Genkit**, and **ShadCN UI**, it enables learners to generate AI-powered summaries, notes, flashcards, chapter breakdowns, quizzes, and more — instantly.

🔗 **Live Demo:** [s]

---

## 🚀 Features

- 🎯 **AI-Powered Learning Content:**
  - Summaries (Short, Medium, Detailed, ELI5, Academic)
  - Comprehensive Notes
  - Flashcards (Create/Edit/Delete/Export)
  - Video Chapters with Timestamps
  - Contextual Q&A
  - Quizzes & Exams (MCQs, T/F, Fill in the blanks)
  - Key Takeaways & Study Prompts

- 🌍 **Multilingual Support:** English, Spanish, German, Hindi, Nepali, and more.

- 🎧 **Text-to-Speech Integration**

- 📥 **Export:** PDF downloads (Notes, Exams), Flashcards (CSV, TXT)

- 🖥️ **Modern UI:** Built with TailwindCSS + ShadCN UI for a smooth, responsive experience.

---

## 🧠 Visual Journey

![mindmap](./public/mindmap.png)

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **AI Integration:** Genkit (Google AI / Gemini)
- **Styling:** Tailwind CSS + ShadCN UI
- **PDF Export:** jsPDF
- **Form & Schema:** React Hook Form + Zod
- **Video & Transcript:** react-youtube + youtube-transcript
- **Icons:** Lucide-react

---

## 📦 Getting Started

### Prerequisites

- Node.js `v18+`
- npm, yarn, or pnpm

### Setup Instructions

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/edutube-ai.git
cd edutube-ai

# 2. Install dependencies
npm install  # or yarn or pnpm

# 3. Create .env
cp .env.example .env
````

Add your `GOOGLE_API_KEY` to the `.env` file:

```env
GOOGLE_API_KEY=your_google_ai_api_key_here
```

### Run the Dev Servers

```bash
# Genkit Dev Server
npm run genkit:dev

# Next.js Dev Server
npm run dev
```

Visit the app at `http://localhost:9002`.

---

## 🧬 Project Structure

```
src/
├── ai/            → Genkit flows & setup
│   ├── flows/
│   ├── genkit.ts
│   └── dev.ts
├── app/           → App Router structure (routes, layout)
├── components/    → Shared components + UI
│   ├── edutube/
│   └── ui/
├── hooks/         → Custom React hooks
├── lib/           → Utility functions
├── services/      → YouTube integration
public/            → Static files (images, logos)
```

---

## ⚙️ How It Works

1. **User inputs a YouTube URL**
2. **Transcript is fetched** via `youtube-transcript`
3. **Genkit AI flows** process the transcript using Gemini models
4. **Content is generated**: summaries, notes, flashcards, questions, etc.
5. **Results are rendered** in an interactive UI with export options

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

```bash
# Fork the repo
# Create your branch
git checkout -b feature/your-feature

# Commit your changes
git commit -m "Add feature"

# Push to your fork
git push origin feature/your-feature

# Open a PR
```

---

