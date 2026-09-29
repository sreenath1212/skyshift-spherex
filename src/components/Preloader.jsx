import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  'Warming up the telescope… just a few seconds.',
  'Your connection seems a little slow right now. Hang tight, the sky is worth the wait.',
  'Thank you for your patience! Slow internet can take a moment to bring in these big sky images.',
  'Almost there. A stronger Wi-Fi or mobile signal will make this much faster.',
]

export default function Preloader({ onComplete }) {
  const [percent, setPercent] = useState(0)
  const [bytes, setBytes] = useState({ received: 0, total: 0 })
  const [speed, setSpeed] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [slowMode, setSlowMode] = useState(false)
  const videoRef = useRef(null)
  const blobUrlRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Check connection quality
  useEffect(() => {
    const conn = navigator.connection
    if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) {
      setSlowMode(true)
      setPercent(100)
      setTimeout(complete, 1500)
    }
  }, [])

  // Message rotation
  useEffect(() => {
    const timers = [
      setTimeout(() => setMsgIndex(1), 4000),
      setTimeout(() => setMsgIndex(2), 8000),
      setTimeout(() => setMsgIndex(3), 12000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Safety timeout: 15s
  useEffect(() => {
    const t = setTimeout(() => { if (percent < 100) complete() }, 15000)
    return () => clearTimeout(t)
  }, [])

  const complete = () => {
    setPercent(100)
    setExiting(true)
    document.body.classList.remove('loading')
    setTimeout(onComplete, reducedMotion ? 100 : 900)
  }

  // Streaming fetch of hero.mp4
  useEffect(() => {
    if (slowMode) return

    let cancelled = false
    const speedInterval = setRef => clearInterval(setRef)

    ;(async () => {
      try {
        const res = await fetch('/videos/hero.mp4')
        const contentLength = res.headers.get('Content-Length')
        const total = contentLength ? parseInt(contentLength) : 0
        setBytes(b => ({ ...b, total }))

        const reader = res.body.getReader()
        const chunks = []
        let received = 0
        let lastReceived = 0
        let lastTime = Date.now()

        const speedTimer = setInterval(() => {
          const now = Date.now()
          const elapsed = (now - lastTime) / 1000
          const delta = received - lastReceived
          setSpeed(delta / elapsed)
          lastReceived = received
          lastTime = now
        }, 1000)

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          chunks.push(value)
          received += value.byteLength
          setBytes({ received, total: total || received })

          const videoProgress = total
            ? (received / total) * 80
            : Math.min(received / (10 * 1024 * 1024) * 80, 75)

          setPercent(p => Math.max(p, Math.round(videoProgress)))
        }

        clearInterval(speedTimer)
        if (cancelled) return

        // Image preload = remaining 20%
        const imgProgress = (progress) => {
          setPercent(p => Math.max(p, Math.round(80 + progress * 20)))
        }

        // Assemble blob and set video src
        const blob = new Blob(chunks, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url

        const video = videoRef.current
        if (video) {
          imgProgress(0.5)
          video.src = url
          video.load()
          video.oncanplaythrough = () => {
            imgProgress(1)
            setTimeout(complete, 400)
          }
          video.onerror = () => {
            imgProgress(1)
            complete()
          }
          setTimeout(() => { if (percent < 95) complete() }, 5000)
        } else {
          complete()
        }
      } catch (e) {
        console.warn('Hero video fetch failed:', e)
        complete()
      }
    })()

    return () => { cancelled = true }
  }, [slowMode])

  const fmt = (b) => {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  if (reducedMotion) {
    return (
      <div className="preloader" style={{ transition: 'opacity 0.3s' }}>
        <div className="preloader__percent">{percent}%</div>
        {slowMode && <p style={{ color: 'var(--lime)', fontSize: '0.9rem', textAlign: 'center' }}>
          We've switched to a lighter version for your connection.
        </p>}
      </div>
    )
  }

  return (
    <div className={`preloader grain${exiting ? ' preloader--exit' : ''}`} role="status" aria-label="Loading SkyShift">
      <div className="preloader__orbit">
        <div className="preloader__ring" />
        <div className="preloader__ring-fill" style={{
          transform: `rotate(${percent * 3.6}deg)`,
          transition: 'transform 0.4s'
        }} />
        <div className="preloader__dot preloader__dot--1" />
        <div className="preloader__dot preloader__dot--2" />
        <div className="preloader__dot preloader__dot--3" />
        <div className="preloader__comet" />
      </div>

      <div className="preloader__percent" aria-live="polite">{percent}%</div>

      <div className="preloader__details">
        {bytes.total > 0 && (
          <span className="preloader__bytes">
            {fmt(bytes.received)} of {fmt(bytes.total)}
          </span>
        )}
        {speed > 0 && (
          <span className="preloader__speed">{fmt(speed)}/s</span>
        )}
        {slowMode && (
          <span style={{ color: 'var(--lime)' }}>
            Lighter version loaded for your connection
          </span>
        )}
      </div>

      <p className="preloader__message" aria-live="polite">
        {MESSAGES[msgIndex]}
      </p>

      <button
        className="preloader__skip"
        onClick={complete}
        aria-label="Skip loading and enter the site"
      >
        Skip and enter →
      </button>

      {/* Hidden video element to trigger canplaythrough */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        playsInline
        preload="auto"
      />
    </div>
  )
}
