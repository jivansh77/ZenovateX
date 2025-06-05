# ReachBee -  GenAI Content Creation & Marketing Platform

## Overview

This project is an AI-powered platform designed to automate content generation and streamline multi-platform marketing efforts. It leverages generative AI models to create engaging content and provides tools to manage and distribute it across various social media channels.

## Features

*   **AI Content Generation:** Utilizes state-of-the-art generative AI models (Google Gemini, Stable Diffusion via `diffusers`, and others via `transformers`) to create text and image-based content automatically.
*   **Multi-Platform Integration:** Connects with social media platforms like Twitter (with potential for others like Facebook, etc.) to manage posts and campaigns.
*   **Content Scheduling & Management:** Tools to schedule posts, manage generated content, and track performance (using Chart.js for visualization).
*   **User Authentication:** Secure user login and management (via Firebase Authentication).
*   **API Endpoints:** Provides APIs for interacting with the backend services (built with FastAPI/Django and Node.js/Express).

## Technology Stack

**Frontend:**
*   Framework/Library: React
*   Build Tool: Vite
*   Styling: Tailwind CSS, DaisyUI
*   Routing: React Router
*   HTTP Client: Axios
*   Charting: Chart.js

**Backend:**
*   Python:
    *   Frameworks: FastAPI, Django
    *   AI/ML: `google-generativeai`, `diffusers`, `transformers`
    *   Database: SQLite (for Django)
*   Node.js:
    *   Framework: Express
    *   Cloud Functions: Firebase Functions for specific tasks (e.g., Twitter integration)
*   Database: Firebase Firestore (used alongside Firebase Auth)

**Services:**
*   Firebase (Authentication, Firestore, Functions, Hosting)
*   Google Cloud (Implied by Google Generative AI usage)

**Environment Variables:**
*   Uses `.env` files for configuration.

## Setup and Installation

**Prerequisites:**
*   Node.js (check `package.json` for version)
*   Python (check `requirements.txt` and `backend/requirements.txt` for version/details)
*   Firebase CLI (`npm install -g firebase-tools`)
*   Access keys/credentials for Firebase, Google AI, Twitter API, etc.

**Frontend:**
1.  Navigate to the root directory.
2.  Create a `.env` file based on `.env.example` (if available) or populate with necessary keys (e.g., `VITE_FIREBASE_...`, `VITE_TWITTER_...`).
3.  Install dependencies: `npm install`
4.  Run the development server: `npm run dev`

**Backend (Python - Root/FastAPI):**
1.  Navigate to the root directory.
2.  Create a Python virtual environment: `python -m venv venv`
3.  Activate the virtual environment:
    *   macOS/Linux: `source venv/bin/activate`
    *   Windows: `.\venv\Scripts\activate`
4.  Install dependencies: `pip install -r requirements.txt`
5.  Configure necessary environment variables (refer to code or add `.env` support).
6.  Run the FastAPI server (example): `uvicorn main:app --reload` (adjust `main:app` based on actual file/app name).

**Backend (Python - `backend/` Directory):**
1.  Navigate to the `backend/` directory.
2.  Create/activate a Python virtual environment (separate from the root one is recommended).
3.  Install dependencies: `pip install -r requirements.txt`
4.  Create a `.env` file with necessary keys (e.g., Google AI API Key).
5.  Run migrations (if using Django): `python manage.py migrate`
6.  Run the development server (if using Django): `python manage.py runserver`

**Firebase Functions:**
1.  Navigate to the `functions/` directory.
2.  Install dependencies: `npm install`
3.  Configure environment variables for functions (e.g., using `firebase functions:config:set twitter.apikey="..."`). Refer to `functions/index.js` for required variables.
4.  Deploy functions: `firebase deploy --only functions`

## Usage

1.  Ensure all services (Frontend, Backend(s), Functions) are running or deployed.
2.  Access the frontend application through the URL provided by Vite (e.g., `http://localhost:5173`) or the deployed Firebase Hosting URL.
3.  Log in or sign up (if authentication is implemented).
4.  Use the platform features to generate content, connect social accounts, and manage posts.
 ![logo2](https://github.com/user-attachments/assets/714396b8-2767-4d48-8353-b7eb3b638251)
