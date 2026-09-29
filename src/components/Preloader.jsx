import { useEffect, useRef, useState } from 'react'

// All videos used across every section of the site
const VIDEOS = [
  { src: '/videos/hero.mp4',      label: 'Hero' },
  { src: '/videos/telescope.mp4', label: 'Telescope' },
  { src: '/videos/comet.mp4',     label: 'Comet' },
  { src: '/videos/asteroids.mp4', label: 'Asteroids' },
  { src: '/videos/planet_x.mp4',  label: 'Planet X' },
]

const MESSAGES = [
  'Warming up the telescope… just a few seconds.',
  'Pulling in live sky data from SPHEREx…',
  'Loading infrared footage — almost there.',
  'Thank you for your patience! The cosmos is worth the wait.',
]

export default function Preloader({ onComplete }) {
  const [readyCount, setReadyCount] = useState(0)
  const [percent, setPercent] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [exiting, setExiting] = useState(false)
  const completedRef = useRef(false)
  const total = VIDEOS.length

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const complete = () => {
    if (completedRef.current) return
    completedRef.current = true
    setPercent(100)
    setExiting(true)
    document.body.classList.remove('loading')
    setTimeout(onComplete, reducedMotion ? 100 : 900)
  }

  // Message rotation
  useEffect(() => {
    const timers = [
      setTimeout(() => setMsgIndex(1), 5000),
      setTimeout(() => setMsgIndex(2), 10000),
      setTimeout(() => setMsgIndex(3), 15000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Safety timeout: if videos take > 25s on slow connections, proceed anyway
  useEffect(() => {
    const t = setTimeout(complete, 25000)
    return () => clearTimeout(t)
  }, [])

  // Preload all videos by creating hidden <video> elements and waiting for canplay
  useEffect(() => {
    const videoEls = []
    let ready = 0

    const onReady = () => {
      ready++
      setReadyCount(ready)
      setPercent(Math.round((ready / total) * 100))
      if (ready >= total) {
        // All videos ready — small pause then reveal the site
        setTimeout(complete, 400)
      }
    }

    VIDEOS.forEach(({ src }) => {
      const vid = document.createElement('video')
      vid.src = src
      vid.muted = true
      vid.playsInline = true
      vid.preload = 'auto'
      vid.style.display = 'none'
      document.body.appendChild(vid)
      videoEls.push(vid)

      const handleReady = () => {
        onReady()
        vid.removeEventListener('canplay', handleReady)
        vid.removeEventListener('error', handleError)
      }
      const handleError = () => {
        // On error still count as "done" so we don't block forever
        console.warn(`Failed to preload: ${src}`)
        onReady()
        vid.removeEventListener('canplay', handleReady)
        vid.removeEventListener('error', handleError)
      }

      vid.addEventListener('canplay', handleReady)
      vid.addEventListener('error', handleError)
      vid.load()
    })

    return () => {
      videoEls.forEach(vid => {
        vid.pause()
        vid.src = ''
        if (vid.parentNode) vid.parentNode.removeChild(vid)
      })
    }
  }, [])

  if (reducedMotion) {
    return (
      <div className="preloader" style={{ transition: 'opacity 0.3s' }}>
        <div className="preloader__percent">{percent}%</div>
        <p style={{ color: 'var(--lime)', fontSize: '0.9rem', textAlign: 'center' }}>
          {readyCount} / {total} videos ready
        </p>
      </div>
    )
  }

  return (
    <div
      className={`preloader grain${exiting ? ' preloader--exit' : ''}`}
      role="status"
      aria-label="Loading SkyShift"
    >
      {/* Orbit ring */}
      <div className="preloader__orbit">
        <div className="preloader__ring" />
        <div
          className="preloader__ring-fill"
          style={{
            transform: `rotate(${percent * 3.6}deg)`,
            transition: 'transform 0.5s ease',
          }}
        />
        <div className="preloader__dot preloader__dot--1" />
        <div className="preloader__dot preloader__dot--2" />
        <div className="preloader__dot preloader__dot--3" />
        <div className="preloader__comet" />
      </div>

      <div className="preloader__percent" aria-live="polite">{percent}%</div>

      {/* Per-video progress dots */}
      <div className="preloader__details" style={{ gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
        {VIDEOS.map((v, i) => (
          <span
            key={v.src}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.7rem',
              color: i < readyCount ? 'var(--lime)' : 'rgba(255,255,255,0.4)',
              transition: 'color 0.4s',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < readyCount ? 'var(--lime)' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.4s',
              display: 'inline-block',
            }} />
            {v.label}
          </span>
        ))}
      </div>

      <p className="preloader__message" aria-live="polite">{MESSAGES[msgIndex]}</p>

      <button
        className="preloader__skip"
        onClick={complete}
        aria-label="Skip loading and enter the site"
      >
        Skip and enter →
      </button>
    </div>
  )
}
