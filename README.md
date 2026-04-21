# Interview Prep AI

Interview Prep AI is a comprehensive platform designed to elevate your interview readiness. It features an advanced suite of tools powered by Artificial Intelligence, including a resume analyzer, adaptive Multiple Choice Question (MCQ) assessments, and realistic HR Mock Interviews equipped with speech-to-text (STT) and text-to-speech (TTS) capabilities.

## 🚀 Features

- **Resume Analyzer**: Extracts and distills technical skills directly from uploaded resumes using AI parsing and natural language processing.
- **Adaptive MCQ Assessment**: Dynamically generates technical questions tailored to specific job roles and difficulty levels.
- **HR Mock Interview**: Immersive, voice-enabled mock interviews using LLMs, text-to-speech, and speech-recognition to mimic real-world interactions.
- **Assessment Integrity Checks**: Features such as tab switching detection to ensure testing integrity.
- **Progress Tracking & Dashboard**: Keep track of test histories and overall interview preparedness scores.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS / Custom UI Libraries
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Framework**: Django & Django REST Framework
- **Authentication**: Simple JWT
- **Database**: SQLite
- **AI & Machine Learning PIP Packages**:
  - `langchain` / `langchain-core` / `langchain-community`
  - `chromadb` (Vector Store for RAG representations)
  - `sentence-transformers` (Generating Text Embeddings)
  - `groq` (LLaMA/Mixtral LLM APIs for rapid inference)
  - `pypdf` (Resume parsing)

## ⚙️ Local Setup Guide

Follow these steps to run the complete platform locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18+)
- [Python](https://www.python.org/downloads/) (3.10+)
- Option to sign up for a [Groq API Key](https://console.groq.com/keys)

### 1. Environment Configuration

In the root directory of the project, create a `.env` file based on the local specifications. You'll need the following variables:

```env
# Example .env configuration
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_django_secret_key
JWT_SECRET=your_jwt_signing_key
```

### 2. Backend Setup

Open a terminal in the root project folder:

```bash
# Optional: Create a virtual environment
python -m venv venv
# Activate the virtual env
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install the necessary python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Boot up the Django Local Server
python manage.py runserver
```

### 3. Frontend Setup

Open a new terminal window to keep the backend running, and navigate to the frontend directory:

```bash
# Navigate to the frontend directory
cd frontend

# Install necessary npm packages (React, Vite, etc.)
npm install

# Run the frontend dev web server
npm run dev
```

The React App should successfully launch in your browser on `http://localhost:5173`.

## 📦 About `requirements.txt` & Packages

* The current `requirements.txt` file is thoroughly verified to include all essentials: Django backend packages, authentication libraries, and robust AI integrations via Langchain, Groq, and ChromaDB.
* When working with the frontend environment, running `npm install` inside the `frontend` directory resolves all dependencies dynamically via `package.json`. No separate frontend text file is required.
