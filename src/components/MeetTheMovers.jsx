import { useEffect, useRef } from 'react'

const MOVERS = [
  {
    emoji: '☄️',
    tag: 'Comet',
    name: 'Comet 3I/ATLAS',
    desc: 'An interstellar visitor! This comet flew into our solar system from another star. SPHEREx spotted it glowing in infrared as it warmed up near the Sun.',
    color: '#B4F224',
    label: 'Real SPHEREx data',
    labelClass: 'ir-label--real',
    bgGradient: 'linear-gradient(135deg, #1A0B1F, #2D1438)',
    textColor: 'var(--cream)',
    imgSrc: '/images/mover_comet.jpg',
  },
  {
    emoji: '🪨',
    tag: 'Asteroid',
    name: 'Near-Earth Asteroids',
    desc: 'Chunks of rock left over from when the solar system formed. SPHEREx finds thousands of them by catching their faint heat glow in infrared.',
    color: '#FF8C7A',
    label: 'Real SPHEREx data',
    labelClass: 'ir-label--real',
    bgGradient: 'linear-gradient(135deg, #2D1438, #1A0B1F)',
    textColor: 'var(--cream)',
    imgSrc: '/images/mover_asteroid.jpg',
  },
  {
    emoji: '🌑',
    tag: 'Brown Dwarf',
    name: 'Failed Stars',
    desc: 'Not big enough to be a star, too big to be a planet — brown dwarfs are dim and cold, invisible to normal telescopes. SPHEREx\'s infrared eyes see right through.',
    color: '#FF6B1A',
    label: 'Real SPHEREx data',
    labelClass: 'ir-label--real',
    bgGradient: 'linear-gradient(135deg, #1A0B1F, #2D1438)',
    textColor: 'var(--cream)',
    imgSrc: '/images/mover_browndwarf.jpg',
  },
  {
    emoji: '❓',
    tag: 'Hypothetical',
    name: 'Planet X',
    desc: 'A possible giant planet hiding in the far outer solar system. Scientists haven\'t found it yet — but SPHEREx\'s whole-sky view is the best chance anyone has had.',
    color: '#E8006E',
    label: 'Hypothetical — not confirmed',
    labelClass: 'ir-label--hypothetical',
    bgGradient: 'linear-gradient(135deg, #2D1438, #3D1250)',
    textColor: 'var(--cream)',
    imgSrc: '/images/mover_planetx.jpg',
  },
]

export default function MeetTheMovers() {
  const videoRef = useRef(null)
  const sectionRef = useRef(null)

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

  return (
    <section className="section section--plum movers-section grain" id="movers" aria-labelledby="movers-title" style={{ position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        className="movers-video-bg"
        src="/videos/asteroids.mp4"
        autoPlay
        muted loop playsInline
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.65,
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'contrast(1.2) brightness(0.9)'
        }}
      />

      <p className="section__label" style={{ position: 'relative', zIndex: 1 }}>05 · Meet the Movers</p>
      <h2 className="section__title" id="movers-title" style={{ position: 'relative', zIndex: 1 }}>
        Who's out <em>there?</em>
      </h2>

      <div className="movers-grid" ref={sectionRef} style={{ position: 'relative', zIndex: 2 }}>
        {MOVERS.map((m) => (
          <article
            key={m.name}
            className="mover-card"
            style={{
              background: m.bgGradient,
              color: m.textColor,
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(244,235,221,0.12)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              transition: 'transform 0.3s var(--spring)',
            }}
            aria-label={`${m.tag}: ${m.name}`}
          >
            <div
              style={{
                height: '210px',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: `3px solid ${m.color}`,
              }}
            >
              <img
                src={m.imgSrc}
                alt={m.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.5s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(26,11,31,0.95) 0%, transparent 60%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '1.8rem',
                  background: 'rgba(26,11,31,0.75)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {m.emoji}
              </span>
            </div>

            <div className="mover-card__body" style={{ padding: '1.5rem' }}>
              <p className="mover-card__tag" style={{ color: m.color, fontFamily: 'var(--ff-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.tag}</p>
              <h3 className="mover-card__name" style={{ color: m.textColor, fontFamily: 'var(--ff-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{m.name}</h3>
              <p className="mover-card__desc" style={{ color: 'rgba(244,235,221,0.75)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {m.desc}
              </p>
              <span className={`ir-label ${m.labelClass}`} style={{ marginTop: '1rem', display: 'inline-flex' }}>
                {m.tag === 'Hypothetical' ? '🔮' : '🔭'} {m.label}
              </span>
              {m.tag === 'Hypothetical' && (
                <span className="mover-card__hypothetical" style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--magenta)', fontFamily: 'var(--ff-mono)' }}>
                  Planet X: Not confirmed
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
