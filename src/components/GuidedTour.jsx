import { useState, useEffect } from 'react'

const TOUR_STEPS = [
  {
    target: '#hero',
    title: 'Welcome to SkyShift! ✨',
    content: "NASA's SPHEREx telescope maps the sky in invisible infrared light 4 times over 2 years. Moving objects like comets, asteroids, and hidden planets reveal themselves between images. Let's explore!",
  },
  {
    target: '#what-is-spherex',
    title: '01 · How SPHEREx Works 🔭',
    content: 'Learn how SPHEREx captures infrared "heat light" and why stars stay still while nearby moving objects leave a trail. Hover over dotted words for instant plain-English explanations!',
  },
  {
    target: '#explorer',
    title: '02 · Interactive Sky Explorer 🌌',
    content: 'View real SPHEREx infrared sky patches! Drag to pan, zoom in/out, and drag the Time Slider at the bottom to watch how objects shift position between observation dates.',
  },
  {
    target: '#blink',
    title: '03 · Blink Comparator Mode 💡',
    content: 'Experience an authentic astronomical discovery tool! Rapidly toggle between two images taken months apart — moving objects like Comet 3I/ATLAS will flicker right before your eyes.',
  },
  {
    target: '#movers',
    title: '04 · Meet the Cosmic Movers ☄️',
    content: 'Discover the 4 main types of celestial wanderers: Comets, Near-Earth Asteroids, Brown Dwarfs, and the mysterious, hypothetical Planet X.',
  },
  {
    target: '#wavelength',
    title: '05 · Wavelength Spectrum 🌈',
    content: 'SPHEREx measures 102 distinct infrared color bands! Drag the slider to see how the night sky looks across different infrared wavelengths.',
  },
  {
    target: '#game',
    title: '06 · Hunt for Planet X Mini-Game 🎮',
    content: 'Test your own observer skills! Compare two sky photos side by side, spot what moved, and click on it. Can you get a high score?',
  },
  {
    target: '#chatbot',
    title: '07 · Ask SkyShift AI Assistant 🤖',
    content: 'Have questions about space or SPHEREx? Click the telescope mascot button at the bottom right to chat anytime with our friendly AI guide.',
  }
]

export default function GuidedTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      const step = TOUR_STEPS[currentStep]
      if (step?.target) {
        const el = document.querySelector(step.target)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStep]

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      onClose()
      setCurrentStep(0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(26,11,31,0.6)',
          backdropFilter: 'blur(3px)',
          pointerEvents: 'all',
        }}
      />

      {/* Tour Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 9501,
          pointerEvents: 'all',
          background: 'var(--plum)',
          color: 'var(--cream)',
          border: '2px solid var(--magenta)',
          borderRadius: '24px',
          padding: '1.75rem',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(232,0,110,0.3)',
          animation: 'fadeUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.75rem', color: 'var(--lime)', letterSpacing: '0.1em' }}>
            STEP {currentStep + 1} OF {TOUR_STEPS.length}
          </span>
          <button
            onClick={onClose}
            style={{ color: 'rgba(244,235,221,0.5)', fontSize: '1.2rem', cursor: 'none' }}
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>

        <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--cream)' }}>
          {step.title}
        </h3>

        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(244,235,221,0.85)', marginBottom: '1.5rem' }}>
          {step.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              border: '1px solid rgba(244,235,221,0.2)',
              color: currentStep === 0 ? 'rgba(244,235,221,0.2)' : 'var(--cream)',
              fontSize: '0.85rem',
              cursor: currentStep === 0 ? 'default' : 'none',
            }}
          >
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === currentStep ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '50px',
                  background: i === currentStep ? 'var(--magenta)' : 'rgba(244,235,221,0.2)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '50px',
              background: 'var(--magenta)',
              color: 'var(--cream)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(232,0,110,0.4)',
              cursor: 'none',
            }}
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish Tour 🎉' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
