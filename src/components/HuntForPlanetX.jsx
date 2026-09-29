import { useEffect, useRef, useState, useCallback } from 'react'

// Generates a pair of sky images with a moving object at slightly different positions
function makeGamePair(roundSeed) {
  const movers = [
    { label: 'Asteroid 2025 XR4', hint: 'Look for a faint dot that shifted slightly to the left.' },
    { label: 'Comet fragment', hint: 'Something near the center has a tiny tail. Did it move?' },
    { label: 'Brown dwarf candidate', hint: 'A warm reddish dot moved up and to the right.' },
    { label: 'Unknown moving object', hint: 'One of these dots doesn\'t belong to the background stars.' },
  ]

  const mover = movers[roundSeed % movers.length]
  let seed1 = roundSeed * 137 + 42
  let seed2 = roundSeed * 137 + 999

  const rand1 = () => { seed1 = (seed1 * 1664525 + 1013904223) & 0xffffffff; return (seed1 >>> 0) / 0xffffffff }
  const rand2 = () => { seed2 = (seed2 * 1664525 + 1013904223) & 0xffffffff; return (seed2 >>> 0) / 0xffffffff }

  // Moving object true position in image A and B (normalized 0-1)
  const mx = 0.3 + rand1() * 0.4
  const my = 0.3 + rand1() * 0.4
  const dx = (rand1() - 0.5) * 0.15
  const dy = (rand1() - 0.5) * 0.1

  return {
    mover,
    img1: { movers: [{ x: mx, y: my }] },
    img2: { movers: [{ x: mx + dx, y: my + dy }] },
    answer: { x2: mx + dx, y2: my + dy },
  }
}

function renderGameCanvas(canvas, config, seed) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas

  const bg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7)
  bg.addColorStop(0, '#3D1250')
  bg.addColorStop(1, '#1A0B1F')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  const colors = ['#E8006E', '#FF6B1A', '#B4F224', '#FF8C7A', '#FAF7F2']

  for (let i = 0; i < 500; i++) {
    const x = rand() * width
    const y = rand() * height
    const r = rand() * 2 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)]
    ctx.globalAlpha = rand() * 0.6 + 0.3
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Draw moving object
  if (config?.movers) {
    config.movers.forEach(m => {
      const cx = m.x * width
      const cy = m.y * height
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14)
      glow.addColorStop(0, '#B4F224')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#FAF7F2'
      ctx.fill()
    })
  }
}

export default function HuntForPlanetX() {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [clickedPos, setClickedPos] = useState(null)
  const [result, setResult] = useState(null) // 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false)
  const canvas1Ref = useRef(null)
  const canvas2Ref = useRef(null)
  const videoRef = useRef(null)

  const game = makeGamePair(round)

  useEffect(() => {
    const setup = (canvas, config, seed) => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      renderGameCanvas(canvas, config, seed)
    }
    setup(canvas1Ref.current, game.img1, round * 2 + 1)
    setup(canvas2Ref.current, game.img2, round * 2 + 2)
    setClickedPos(null)
    setResult(null)
  }, [round])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) vid.play().catch(() => {})
      else vid.pause()
    }, { threshold: 0.1 })
    obs.observe(vid)
    return () => obs.disconnect()
  }, [])

  const handleCanvasClick = useCallback((e) => {
    if (result) return
    const canvas = canvas2Ref.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height

    const { x2, y2 } = game.answer
    const dist = Math.sqrt((cx - x2) ** 2 + (cy - y2) ** 2)
    const isCorrect = dist < 0.12

    setClickedPos({ x: cx, y: cy })
    setAttempts(a => a + 1)
    if (isCorrect) {
      setScore(s => s + 1)
      setResult('correct')
    } else {
      setResult('wrong')
    }
  }, [result, game])

  const nextRound = () => setRound(r => r + 1)

  return (
    <section className="section section--plum hunt-section grain" id="game" aria-labelledby="hunt-title" style={{ position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        className="hunt-video-bg"
        src="/videos/planet_x.mp4"
        autoPlay
        muted loop playsInline
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.6,
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'contrast(1.2) brightness(0.85)'
        }}
      />

      <div className="hunt-content">
        <p className="section__label">07 · Hunt for Planet X</p>
        <h2 className="section__title" id="hunt-title">
          Did something <em>move?</em>
        </h2>
        <p style={{ maxWidth: '500px', marginBottom: '0.5rem', color: 'rgba(26,11,31,0.65)', lineHeight: '1.6' }}>
          Real astronomers find moving objects by comparing two images taken months apart.
          Click on the object that shifted position in image B.
        </p>
        <span className="ir-label ir-label--sample">Sample / illustration</span>
        <span className="ir-label ir-label--hypothetical" style={{ marginLeft: '0.5rem' }}>
          Planet X: hypothetical — not confirmed
        </span>

        <div className="hunt-game" style={{ marginTop: '2rem' }}>
          <div className="hunt-game__score">
            <div>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.7rem', color: 'rgba(244,235,221,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Score</span>
              <div className="hunt-score-badge">{score}/{attempts || '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.7rem', color: 'rgba(244,235,221,0.4)', letterSpacing: '0.1em' }}>Round {round + 1}</span>
              <div style={{ color: 'var(--orange)', fontFamily: 'var(--ff-display)', fontSize: '1.1rem', fontWeight: '700' }}>
                {game.mover.label}
              </div>
            </div>
          </div>

          <div className="hunt-question">
            🔭 Compare these two sky images. Something moved between them.
          </div>

          <div className="hunt-game__images">
            {/* Image A */}
            <div className="hunt-img-wrap" aria-label="Sky image A — earlier observation">
              <canvas
                ref={canvas1Ref}
                style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '12px', background: '#1A0B1F' }}
              />
              <div className="hunt-img-label">Image A — Earlier</div>
            </div>

            {/* Image B — clickable */}
            <div
              className="hunt-img-wrap"
              style={{ cursor: result ? 'default' : 'none' }}
              onClick={handleCanvasClick}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleCanvasClick(e)}
              aria-label="Sky image B — later observation. Click on the object that moved."
            >
              <canvas
                ref={canvas2Ref}
                style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '12px', background: '#1A0B1F' }}
              />
              <div className="hunt-img-label">Image B — Click the mover! →</div>
              {clickedPos && (
                <div
                  className="hunt-marker"
                  style={{
                    left: `${clickedPos.x * 100}%`,
                    top: `${clickedPos.y * 100}%`,
                    borderColor: result === 'correct' ? 'var(--lime)' : 'var(--coral)',
                    boxShadow: `0 0 16px ${result === 'correct' ? 'var(--lime)' : 'var(--coral)'}`,
                  }}
                />
              )}
            </div>
          </div>

          <p className="hunt-hint">
            {showHint ? game.mover.hint : (
              <button
                style={{ color: 'var(--orange)', textDecoration: 'underline', fontSize: '0.8rem', cursor: 'none' }}
                onClick={() => setShowHint(true)}
              >
                Need a hint?
              </button>
            )}
          </p>

          <div className={`hunt-feedback${result ? ` ${result}` : ''}`} aria-live="polite">
            {result === 'correct' && <><span>✓</span> Found it! That's {game.mover.label}.</>}
            {result === 'wrong' && <><span>✕</span> Not quite — the mover is the lime-glowing dot.</>}
          </div>

          {result && (
            <button className="hunt-next-btn" onClick={nextRound}>
              Next round →
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
