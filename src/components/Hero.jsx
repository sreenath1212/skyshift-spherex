import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero({ videoSrc }) {
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const videoRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
    // Letter-by-letter headline reveal
    const title = titleRef.current
    if (!title) return
    const lines = title.querySelectorAll('.hero__title-line')
    const allLetters = []
    lines.forEach(line => {
      const text = line.textContent
      line.innerHTML = ''
      text.split('').forEach(ch => {
        const span = document.createElement('span')
        span.textContent = ch === ' ' ? '\u00A0' : ch
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        span.style.transform = 'translateY(60px) rotate(4deg)'
        line.appendChild(span)
        allLetters.push(span)
      })
    })

    gsap.to(allLetters, {
      opacity: 1,
      y: 0,
      rotation: 0,
      duration: 0.6,
      stagger: 0.025,
      ease: 'back.out(1.7)',
      delay: 0.3,
    })

    gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.8, delay: 1.6, ease: 'power2.out'
    })

    // Spawn floating particles
    const container = particlesRef.current
    if (!container) return
    const colors = ['#E8006E', '#FF6B1A', '#B4F224', '#FF8C7A']
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      const size = Math.random() * 4 + 2
      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        --dur: ${8 + Math.random() * 12}s;
        --op: ${0.2 + Math.random() * 0.5};
        animation-delay: ${Math.random() * 8}s;
        box-shadow: 0 0 ${size * 2}px currentColor;
      `
      container.appendChild(p)
    }

    // IntersectionObserver for video play
    const vid = videoRef.current
    if (vid) {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) vid.play().catch(() => {})
        else vid.pause()
      }, { threshold: 0.2 })
      obs.observe(vid)
      return () => obs.disconnect()
    }
  }, [])

  return (
    <section className="hero grain" id="hero" aria-label="Hero: The sky is changing">
      {/* Poster background */}
      <div className="hero__poster" aria-hidden="true" />

      {/* Video background */}
      <video
        ref={videoRef}
        className="hero__video"
        src={videoSrc || '/videos/hero.mp4'}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{ opacity: 1 }}
      />

      <div className="hero__overlay" aria-hidden="true" style={{ background: 'linear-gradient(to top, rgba(26,11,31,0.88) 0%, rgba(26,11,31,0.15) 50%, rgba(26,11,31,0.3) 100%)' }} />

      {/* Floating particles */}
      <div className="hero__particles" ref={particlesRef} aria-hidden="true" />

      <div className="hero__content">
        <p className="hero__eyebrow">NASA Space Apps Challenge 2026 · SPHEREx</p>

        <h1 className="hero__title" ref={titleRef}>
          <span className="hero__title-line">The sky is</span>
          <span className="hero__title-line"><em className="highlight">changing.</em></span>
          <span className="hero__title-line">Can you spot it?</span>
        </h1>

        <div ref={contentRef}>
          <p className="hero__subtitle">
            NASA's SPHEREx telescope maps the entire sky in invisible infrared light.
            Comets, asteroids, and mysterious objects reveal themselves by moving
            between images. Now you can watch.
          </p>

          <a href="#explorer" className="hero__cta">
            Explore the sky
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
