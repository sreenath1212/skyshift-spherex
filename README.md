# SkyShift: See the Invisible Sky 🌌

> **NASA International Space Apps Challenge 2026 Submission**  
> **Challenge:** Planet X and SPHEREx  
> **Created by:** **Sreenath Mohan** (Robotics Trainer, Unique World Robotics)  

---

## 🚀 Overview

**SkyShift: See the Invisible Sky** is an interactive, public-facing visual web experience designed to make NASA’s **SPHEREx** (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) mission accessible and engaging for everyone—regardless of prior scientific background.

SPHEREx maps the whole sky in invisible infrared light 4 times over its 2-year mission. Nearby celestial objects like comets, asteroids, brown dwarfs, and hypothetical planets reveal themselves by shifting position against the fixed backdrop of distant stars. SkyShift brings this science to life wrapped in a modern, art-exhibition web visual design.

---

## ✨ Key Features & Sections

- **01 · Hero Section**: Full-screen intro featuring letter-by-letter GSAP motion reveals, floating particle fields, and background video stream.
- **02 · What is SPHEREx?**: Plain-English 3-step breakdown explaining infrared "heat light" and celestial movement, complete with hover tooltips for astronomy terms.
- **03 · Interactive Sky Explorer**: Zoomable (0.5×–4×) and pannable canvas view of infrared sky patches with a Time Slider to observe shifted positions and animated trail rings.
- **04 · Blink Comparator Mode**: Authentic astronomical tool that rapidly alternates between two sky images taken months apart—making objects like **Comet 3I/ATLAS** visibly flicker.
- **05 · Meet the Cosmic Movers**: Rich visual cards featuring Comets, Near-Earth Asteroids, Brown Dwarfs (Failed Stars), and the hypothetical candidate **Planet X**.
- **06 · Wavelength Spectrum Slider**: Interactive slider exploring 102 infrared wavelength color bands (0.75 µm to 4.5 µm) with live canvas starfield color shifts and an emission spectrum graph.
- **07 · Hunt for Planet X Mini-Game**: Interactive side-by-side observer game with proximity click detection, score tracking, and celebratory confetti.
- **08 · SkyShift AI Guide (Gemini Chatbot)**: Floating mascot assistant powered by Google Gemini API (`gemini-3.5-flash` / `gemini-3-flash-preview`) with live streaming responses.
- **09 · Ambient Space Drone Synthesizer**: Web Audio API low-frequency ambient space audio with a header toggle button (`Sound: On / Off`).
- **10 · Guided Tour**: 7-step interactive guided walkthrough card navigating through every section.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, GSAP (GreenSock Animation Platform)
- **Styling**: Vanilla CSS (Tailored Design Tokens: Warm Cream `#F4EBDD`, Deep Plum `#1A0B1F`, Hot Magenta `#E8006E`, Acid Lime `#B4F224`, Molten Orange `#FF6B1A`)
- **Graphics & Sound**: HTML5 Canvas 2D API, Web Audio API Oscillator Synthesizer
- **AI Intelligence**: Google Gemini REST API / SSE Streaming with multi-model failover (`gemini-3.5-flash`, `gemini-3-flash-preview`, `gemini-3.1-flash-lite`)
- **Backend / Edge Functions**: Vercel Edge Runtime (`/api/chat`)
- **Data Acquisition**: `fetch_spherex_data.py` Python automation for downloading NASA IRSA FITS/PNG datasets

---

## 🏃 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Run
```bash
# Clone repository
git clone https://github.com/sreenath1212/skyshift-spherex.git
cd skyshift-spherex

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📐 Deploying to Vercel

```bash
# Using Vercel CLI
npx vercel
```
Or import `sreenath1212/skyshift-spherex` on [Vercel Dashboard](https://vercel.com/new).

### Required Environment Variable on Vercel:
- `GEMINI_API_KEY`: Your Google AI Studio API key

---

## 🛰️ Scientific Acknowledgements & Data Credits

- **SPHEREx Telescope Mission**: NASA / JPL-Caltech / IPAC
- **Data Archive**: NASA/IPAC Infrared Science Archive (IRSA)
- **Data Identifier (DOI)**: [10.26131/IRSA652](https://doi.org/10.26131/IRSA652)
- **Data Access URL**: [irsa.ipac.caltech.edu/Missions/spherex.html](https://irsa.ipac.caltech.edu/Missions/spherex.html)

---

## 🎓 Author

**Sreenath Mohan**  
Robotics Trainer · **Unique World Robotics**  
GitHub: [@sreenath1212](https://github.com/sreenath1212)  
Created for the **NASA International Space Apps Challenge 2026**.
