# ✨ EduTube AI - AI-Powered YouTube Learning Companion

![preview](./public/preview.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

**EduTube AI** is a cutting-edge web application that turns any YouTube video into a dynamic, multilingual learning experience. Built with **Next.js**, **Genkit**, and **ShadCN UI**, it enables learners to generate AI-powered summaries, notes, flashcards, chapter breakdowns, quizzes, and more — instantly.

🔗 **Live Demo:** [Add your deployed link here, e.g. Vercel]

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
