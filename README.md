# 🧠 MediGuide-AI
[Click here to try the live app](https://mediguide-ai.onrender.com/)

An AI-powered medical guidance web application built with **React, TypeScript, Vite, and Tailwind CSS**.  
MediGuide-AI integrates the **Gemini API** to provide intelligent, real-time health insights through a clean and responsive interface.

> ⚠️ This project provides informational guidance only and is not a substitute for professional medical advice.

---

## 🚀 Features

- 🤖 AI-powered medical question answering
- ⚡ Fast frontend powered by Vite
- 🎨 Modern UI with Tailwind CSS
- 🔐 Secure environment variable configuration
- 🌐 Deployable on Vercel or Render
- 📦 Clean project architecture

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend     | React + TypeScript |
| Build Tool   | Vite |
| Styling      | Tailwind CSS |
| AI Provider  | Gemini API |
| Deployment   | Vercel / Render |

---

## 📁 Project Structure
MediGuide-AI/
│
├── src/ # Application source code
├── components/ # Reusable UI components
├── services/ # API interaction logic
├── public/ # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
## 🚀 Getting Started

Follow these steps to run the project locally.

---

### 📌 Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Gemini API Key

---

### 📥 Installation

Clone the repository:

```bash
git clone https://github.com/Sayan51/MediGuide-AI.git
cd MediGuide-AI
```

Install dependencies:

```bash
npm install
```

---

### 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Gemini API key.

---

### ▶ Run the Development Server

```bash
npm run dev
```

---

## 🌐 Deployment

This project can be deployed on:

- Vercel
- Render

Make sure to set the `GEMINI_API_KEY` in your deployment environment variables.

📝 About

MediGuide-AI was created as part of a hackathon to explore AI-driven medical guidance interfaces with a focus on usability and rapid deployment. This project demonstrates integrating generative AI into a responsive UI to provide health-related answers.

🚀 Future Enhancements

✅ Add backend service for secure API key handling
✅ Better error handling & input validation
✅ User authentication & session support
✅ Medical content filtering/safety checks
✅ Real UI conversation flow improvements

🤝 Contributing
Contributions are welcome.

Fork the repository
Create a feature branch
Commit your changes
Submit a pull request
