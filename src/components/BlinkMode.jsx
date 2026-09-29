import { useEffect, useRef, useState, useCallback } from 'react'

// Renders the blinking canvas for blink mode
function renderBlinkFrame(canvas, dateIndex, isCometPatch) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas

  const bg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7)
  bg.addColorStop(0, '#3D1250')
  bg.addColorStop(1, '#1A0B1F')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  let seed = 42 + dateIndex * 99
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }

  const colors = ['#E8006E', '#FF6B1A', '#B4F224']
  for (let i = 0; i < 700; i++) {
    const x = rand() * width
    const y = rand() * height
    const r = rand() * 2 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors[Math.floor(rand() * 3)]
    ctx.globalAlpha = rand() * 0.6 + 0.3
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Comet position shifts between frames
  if (isCometPatch) {
    const cometX = 0.4 * width + dateIndex * 0.1 * width
    const cometY = 0.45 * height - dateIndex * 0.05 * height

    // Tail
    const tailLen = 80 + Math.random() * 20
    const tailGrad = ctx.createLinearGradient(cometX, cometY, cometX - tailLen, cometY + 20)
    tailGrad.addColorStop(0, 'rgba(180,242,36,0.8)')
    tailGrad.addColorStop(1, 'rgba(180,242,36,0)')
    ctx.strokeStyle = tailGrad
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cometX, cometY)
    ctx.lineTo(cometX - tailLen, cometY + 20)
    ctx.stroke()

    // Nucleus
    const glow = ctx.createRadialGradient(cometX, cometY, 0, cometX, cometY, 18)
    glow.addColorStop(0, '#FAF7F2')
    glow.addColorStop(0.4, '#B4F224')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(cometX, cometY, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

export default function BlinkMode() {
  const canvas1Ref = useRef(null)
  const canvas2Ref = useRef(null)
  const videoRef = useRef(null)
  const [blinking, setBlinking] = useState(false)
  const [showFrame, setShowFrame] = useState(0)
  const [speed, setSpeed] = useState(500)
  const [revealed, setRevealed] = useState(false)
  const intervalRef = useRef(null)

  const dates = ['2025-07-01', '2025-09-28']

  // Render both frames
  useEffect(() => {
    const setup = (canvas, idx) => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      renderBlinkFrame(canvas, idx, true)
    }
    setup(canvas1Ref.current, 0)
    setup(canvas2Ref.current, 1)
  }, [])

  // Blink interval
  useEffect(() => {
    if (blinking) {
      intervalRef.current = setInterval(() => {
        setShowFrame(f => {
          if (f === 1) setRevealed(true)
          return f === 0 ? 1 : 0
        })
      }, speed)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [blinking, speed])

  // Video IntersectionObserver
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) vid.play().catch(() => {})
      else vid.pause()
    }, { threshold: 0.2 })
    obs.observe(vid)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="section section--mid blink-section grain" id="blink" aria-labelledby="blink-title" style={{ position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        className="blink-video-bg"
        src="/videos/comet.mp4"
        autoPlay
        muted loop playsInline
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.75,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div className="blink-content">
        <p className="section__label">04 · Blink Mode</p>
        <h2 className="section__title" id="blink-title" style={{ color: 'var(--cream)', textAlign: 'center' }}>
          Watch it <em>flicker</em>
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(244,235,221,0.6)', maxWidth: '480px', margin: '0 auto 1rem', fontSize: '1rem', lineHeight: '1.6' }}>
          Rapidly flipping between two sky images taken months apart — moving objects like{' '}
          <strong style={{ color: 'var(--lime)' }}>Comet 3I/ATLAS</strong> visibly flicker.
        </p>

        <span className="ir-label ir-label--sample" style={{ display: 'block', width: 'fit-content', margin: '0 auto 1.5rem' }}>
          Sample / illustration — pending real IRSA data
        </span>

        {/* Circular blink viewport */}
        <div className="blink-viewport" aria-label="Blink mode: alternating sky images to reveal moving comet 3I/ATLAS">
          <canvas
            ref={canvas1Ref}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: showFrame === 0 ? 1 : 0, transition: `opacity ${speed * 0.04}ms` }}
            aria-label={`Sky image: ${dates[0]}`}
          />
          <canvas
            ref={canvas2Ref}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: showFrame === 1 ? 1 : 0, transition: `opacity ${speed * 0.04}ms` }}
            aria-label={`Sky image: ${dates[1]}`}
          />
          {/* Date label */}
          <div style={{
            position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--ff-mono)', fontSize: '0.7rem', letterSpacing: '0.1em',
            background: 'rgba(26,11,31,0.85)', color: showFrame === 0 ? 'var(--orange)' : 'var(--lime)',
            padding: '0.35rem 0.75rem', borderRadius: '50px',
            transition: 'color 0.15s',
          }}>
            {dates[showFrame]}
          </div>
        </div>

        <div className="blink-controls">
          <button
            className={`blink-btn${blinking ? ' active' : ''}`}
            onClick={() => setBlinking(b => !b)}
            aria-pressed={blinking}
          >
            {blinking ? '⏸ Stop blinking' : '▶ Start blinking'}
          </button>

          <div className="speed-slider">
            <span>Slow</span>
            <input
              type="range"
              min={150}
              max={1200}
              value={1350 - speed}
              onChange={e => setSpeed(1350 - Number(e.target.value))}
              aria-label="Blink speed control"
            />
            <span>Fast</span>
          </div>
        </div>

        <div className={`blink-reveal${revealed ? ' visible' : ''}`} aria-live="polite">
          🌟 <strong style={{ color: 'var(--lime)' }}>You spotted it!</strong> The glowing green dot near the center
          is <strong>Comet 3I/ATLAS</strong> — an interstellar visitor from beyond our solar system.
          It moved position between July and September 2025.
        </div>
      </div>
    </section>
  )
}
