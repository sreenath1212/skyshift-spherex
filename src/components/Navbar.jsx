import { useState, useEffect, useRef } from 'react'

export default function Navbar({ onStartTour }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const audioCtxRef = useRef(null)
  const osc1Ref = useRef(null)
  const osc2Ref = useRef(null)
  const gainRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Web Audio ambient synthesizer
  const toggleAudio = () => {
    if (isMuted) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx()
        }
        const ctx = audioCtxRef.current
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        // Ambient deep space drone (55Hz and 110Hz harmonics with lowpass filter)
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const filter = ctx.createBiquadFilter()
        const gain = ctx.createGain()

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(55, ctx.currentTime) // A1 note
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(110.5, ctx.currentTime) // Slight detune for warmth

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(180, ctx.currentTime)

        gain.gain.setValueAtTime(0.01, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3)

        osc1.connect(filter)
        osc2.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc1.start()
        osc2.start()

        osc1Ref.current = osc1
        osc2Ref.current = osc2
        gainRef.current = gain
        setIsMuted(false)
      } catch (e) {
        console.warn('Audio context init error:', e)
      }
    } else {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1)
        setTimeout(() => {
          try {
            osc1Ref.current?.stop()
            osc2Ref.current?.stop()
          } catch {}
          setIsMuted(true)
        }, 1000)
      } else {
        setIsMuted(true)
      }
    }
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 4000,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s, padding 0.3s',
        background: scrolled ? 'rgba(26,11,31,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(244,235,221,0.1)' : '1px solid transparent',
      }}
    >
      <a
        href="#hero"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
          color: 'var(--cream)',
          fontFamily: 'var(--ff-display)',
          fontSize: '1.4rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'var(--magenta)',
            boxShadow: '0 0 12px var(--magenta)',
            display: 'inline-block',
          }}
        />
        SkyShift
        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--ff-mono)',
            color: 'var(--lime)',
            padding: '0.2rem 0.5rem',
            background: 'rgba(180,242,36,0.15)',
            borderRadius: '50px',
            border: '1px solid rgba(180,242,36,0.3)',
            marginLeft: '0.2rem',
          }}
        >
          SPHEREx
        </span>
      </a>

      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.8rem',
        }}
        className={menuOpen ? 'nav-open' : ''}
      >
        <a href="#what-is-spherex" className="nav-link">About</a>
        <a href="#explorer" className="nav-link">Sky Explorer</a>
        <a href="#blink" className="nav-link">Blink Mode</a>
        <a href="#movers" className="nav-link">Movers</a>
        <a href="#wavelength" className="nav-link">Spectrum</a>
        <a href="#game" className="nav-link highlight">Planet X Hunt</a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
          <button
            onClick={toggleAudio}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '50px',
              border: '1px solid rgba(244,235,221,0.2)',
              background: isMuted ? 'rgba(255,255,255,0.05)' : 'var(--magenta)',
              color: 'var(--cream)',
              fontSize: '0.8rem',
              fontFamily: 'var(--ff-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
            }}
            title={isMuted ? 'Turn ambient space sound ON' : 'Turn ambient space sound OFF'}
            aria-label="Toggle ambient space sound"
          >
            {isMuted ? '🔇 Sound: Off' : '🔊 Sound: On'}
          </button>

          <button
            onClick={onStartTour}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '50px',
              background: 'var(--orange)',
              color: 'var(--plum)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(255,107,26,0.3)',
              transition: 'transform 0.2s var(--spring)',
            }}
            aria-label="Start guided tour"
          >
            🧭 Start Tour
          </button>
        </div>
      </nav>
    </header>
  )
}
