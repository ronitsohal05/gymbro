# GymBro

GymBro is an AI-powered fitness and nutrition assistant designed to help users plan workouts, manage meals, and achieve their health goals through natural conversation. It uses advanced language models, intelligent logging, and voice features to create a seamless experience.

## Features

- **Conversational AI**: Chat with GymBro to get personalized workout or nutrition advice.
- **Intelligent Classification**: Classifies user input into categories: workout, nutrition, or logging.
- **Structured Logging**: Extracts and logs structured meal and workout data with user confirmation.
- **User Authentication**: JWT-secured endpoints using Flask-JWT-Extended.
- **Progress Tracking Dashboard**: Personalized charts and summaries of workouts and nutrition over time.
- **Voice Input**: Users can speak to GymBro using browser-based speech-to-text (Web Speech API).
- **Voice Output**: Responses are synthesized to realistic speech using ElevenLabs TTS and returned as base64-encoded audio.
- **Interactive UI**: Built in React with a simple, responsive chat interface using Markdown and Tailwind.

## Tech Stack

### Frontend
- **React** with **TailwindCSS**
- **Web Speech API** for speech recognition
- **React Markdown** for rich message formatting

### Backend
- **Flask** (Python)
- **MongoDB** for user data and logs
- **OpenAI API** for GPT-powered responses
- **ElevenLabs API** for TTS
- **JWT Authentication**

## Coming Soon

- **Real-Time Speech-to-Speech Mode**: Ongoing development to support fully natural conversations, where GymBro listens and speaks in real-time—no typing required.
- **Audio Streaming**: Switch from base64 blobs to streamed audio for lower latency.
- **Voice Customization**: Let users select different ElevenLabs voices.

## Example Use Cases

- “Can you log that I had 2 eggs and oatmeal for breakfast?”

- “Give me a 4-day upper/lower split for building strength.”

- “What should I eat post-workout to recover faster?”

- "How many calories was the meal i ate for breakfast last Tuesday?"