# 🌌 SkyShift — Project Documentation

> **NASA Space Apps Challenge 2026** · SPHEREx Mission Interactive Experience

---

## 🔗 Quick Links

| Resource | Link |
|---|---|
| 🚀 **Live App** | [skyshift-spherex.vercel.app](https://skyshift-spherex.vercel.app) |
| 💻 **GitHub Repository** | [github.com/sreenath1212/skyshift-spherex](https://github.com/sreenath1212/skyshift-spherex) |
| 🛰️ **SPHEREx Mission** | [nasa.gov/mission/spherex](https://www.nasa.gov/mission/spherex/) |
| 👤 **Creator** | Sreenath Mohan — Robotics Trainer, Unique World Robotics |

---

## 📖 What Is SkyShift?

**SkyShift** is an immersive, interactive web application built for the **NASA Space Apps Challenge 2026**. It brings NASA's **SPHEREx** (Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer) telescope to life through interactive visualizations, educational tools, and an AI-powered guide — designed to engage students, space enthusiasts, and citizen scientists.

The site answers a central question: **"The sky is changing. Can you spot it?"** — teaching users how astronomers detect comets, asteroids, and mysterious solar-system objects by watching them move between sky images.

---

## 🎯 Challenge Context

SPHEREx maps the **entire sky in 102 infrared wavelengths**, photographing hundreds of millions of galaxies, stars, and moving solar-system objects. By comparing images taken weeks apart, astronomers can spot objects that have shifted — a comet, an asteroid, or perhaps an undiscovered planet.

SkyShift makes this science **accessible and fun** for everyone.

---

## ✨ Features

### 1. 🎬 Cinematic Preloader
- Preloads **all 5 section videos** before revealing the site
- Per-video progress tracking with labelled status dots
- "Skip and enter" option for fast connections
- 25-second safety timeout — never hangs

### 2. 🌠 Hero Section
- Full-screen infrared space video background
- Animated letter-by-letter headline reveal
- Floating particle system with glow effects
- Smooth scroll navigation

### 3. 🔭 What Is SPHEREx?
- Step-by-step educational breakdown with telescope video background
- Interactive tooltips explaining infrared light, galaxy counts, and mission science
- Animated scroll-triggered reveals using GSAP

### 4. 🗺️ Sky Explorer (Interactive Canvas)
- Drag-and-drop canvas built from real SPHEREx-style sky data
- Zoom, pan, and click stars to reveal metadata
- Toggle infrared wavelength filters
- Highlights moving objects against the fixed star field

### 5. 👁️ Blink Mode
- Classic astronomical blink comparator technique
- Two sky images flicker back and forth — users spot what moved
- Adjustable blink speed and zoom level
- Inspired by how Pluto was discovered in 1930

### 6. 🌠 Meet the Movers
- Gallery of 4 object types found by SPHEREx: Comets, Asteroids, Brown Dwarfs, Planet X
- Video backgrounds per card, hover-animated
- Rich descriptions and fun facts

### 7. 🌈 Wavelength Slider
- Drag a slider to change the infrared wavelength (102 bands)
- Sky scene reacts to show what SPHEREx sees at each wavelength
- Educational labels: Near-IR, Mid-IR, molecular ice absorption bands

### 8. 🎮 Hunt for Planet X (Mini-Game)
- Gamified blink-comparator: find the moving object within the time limit
- Multiple difficulty levels
- Score tracker and celebratory reveal animation
- Planet X video background

### 9. 🤖 SkyShift AI Guide (Chatbot)
- Powered by **Google Gemini AI** (multi-model failover)
- Knows everything about SPHEREx, comets, infrared astronomy, and the challenge
- Animated chat bubble interface
- Rate-limited server-side API endpoint

### 10. 🧭 Guided Tour
- Contextual step-by-step walkthrough of every section
- Keyboard accessible, escape to close

### 11. 🎵 Ambient Audio
- Optional space-ambient sound in the Navbar
- Toggled with a single button — off by default

### 12. ✨ Custom Cursor
- Glowing orbital cursor follows mouse
- Scales on hover over interactive elements

---

## 🏗️ Architecture

```
skyshift-spherex/
├── api/
│   └── chat.js              # Vercel serverless function — Gemini AI proxy
├── public/
│   ├── videos/              # 5 MP4 video backgrounds
│   │   ├── hero.mp4
│   │   ├── telescope.mp4
│   │   ├── comet.mp4
│   │   ├── asteroids.mp4
│   │   └── planet_x.mp4
│   └── images/              # Poster images + mover cards
├── src/
│   ├── components/
│   │   ├── Preloader.jsx    # All-video preloader
│   │   ├── Navbar.jsx       # Ambient audio + navigation
│   │   ├── Hero.jsx         # Full-screen hero + particles
│   │   ├── WhatIsSPHEREx.jsx
│   │   ├── SkyExplorer.jsx  # Canvas-based star map
│   │   ├── BlinkMode.jsx    # Canvas blink comparator
│   │   ├── MeetTheMovers.jsx
│   │   ├── WavelengthSlider.jsx
│   │   ├── HuntForPlanetX.jsx
│   │   ├── GuidedTour.jsx
│   │   ├── Chatbot.jsx      # Gemini AI chatbot
│   │   ├── CustomCursor.jsx
│   │   └── Footer.jsx
│   ├── App.jsx              # Root — conditional mount after preloader
│   ├── index.css            # Design system, animations, utilities
│   └── main.jsx
├── vercel.json              # Rewrites + serverless config
├── vite.config.js
└── .env.example             # Environment variable template
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite |
| **Animations** | GSAP 3 + ScrollTrigger |
| **AI** | Google Gemini API (multi-model failover) |
| **Deployment** | Vercel (Serverless Functions) |
| **Styling** | Vanilla CSS (custom design system) |
| **Canvas** | Native HTML5 Canvas API |
| **Video** | Native HTML5 `<video>` with blob preloading |

---

## 🔐 Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `GEMINI_API_KEY` | `api/chat.js` (server) | Gemini API key for the serverless chatbot endpoint |
| `VITE_GEMINI_API_KEY` | `Chatbot.jsx` (client fallback) | Same key exposed to client for direct fallback |

> **Note:** Never commit API keys. Add them in your Vercel dashboard under **Settings → Environment Variables**.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/sreenath1212/skyshift-spherex.git
cd skyshift-spherex

# Install dependencies
npm install

# Create env file
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start the dev server
npm run dev
```

Visit `http://localhost:5173`

---

## 📡 Deployment

The app is deployed on **Vercel** with automatic GitHub integration.

- **Production URL:** https://skyshift-spherex.vercel.app
- **Branch:** `main`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Serverless function:** `api/chat.js`

Every push to `main` automatically triggers a new deployment.

---

## 👨‍💻 Creator

**Sreenath Mohan**  
Robotics Trainer | Unique World Robotics  

This project was built as an entry for the **NASA Space Apps Challenge 2026**, with a mission to make space science accessible, interactive, and inspiring for the next generation of explorers.

---

## 📄 License

MIT — Open source and free to use.

---

*"The sky is changing. Can you spot it?"* 🌌
