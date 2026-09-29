import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    title: 'SPHEREx scans the whole sky',
    body: (
      <>
        Every few months, SPHEREx photographs every part of the sky using{' '}
        <span className="tooltip-word" data-tip="Infrared light is invisible to human eyes — it's 'heat light'. Your TV remote uses it!">
          infrared light
        </span>
        {' '}— light too red for our eyes to see. Over 2 years it maps{' '}
        <span className="tooltip-word" data-tip="One billion = 1,000,000,000. That's a LOT of stars, galaxies and comets.">
          over a billion objects
        </span>
        .
      </>
    )
  },
  {
    num: '02',
    title: 'Moving objects leave a trail',
    body: (
      <>
        Comets, asteroids, and maybe a hidden planet move against the fixed backdrop of{' '}
        <span className="tooltip-word" data-tip="Stars are so far away they look completely still even over thousands of years. Moving objects nearby look different!">
          distant stars
        </span>
        . Compare two images taken months apart and anything that shifted position{' '}
        <em>doesn't belong to the background</em>.
      </>
    )
  },
  {
    num: '03',
    title: 'You can find them too',
    body: (
      <>
        SkyShift shows you real SPHEREx images side by side. Use the{' '}
        <span className="tooltip-word" data-tip="Blink Mode rapidly flips between two images like an old-school astronomy trick — moving objects 'flicker' and stand out.">
          Blink Mode
        </span>{' '}
        to make movers flicker. Try the mini-game to hunt for{' '}
        <span className="tooltip-word" data-tip="Planet X is a hypothetical planet — scientists think it might exist far beyond Neptune, but it hasn't been confirmed yet.">
          Planet X
        </span>
        . No science degree needed.
      </>
    )
  }
]

export default function WhatIsSPHEREx() {
  const sectionRef = useRef(null)
  const stepsRef = useRef([])
  const videoRef = useRef(null)

  useEffect(() => {
    // IntersectionObserver for video
    const vid = videoRef.current
    if (vid) {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) vid.play().catch(() => {})
        else vid.pause()
      }, { threshold: 0.3 })
      obs.observe(vid)
    }

    // Scroll-triggered step reveal
    stepsRef.current.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(el,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          delay: i * 0.1,
        }
      )
    })
  }, [])

  return (
    <section className="section section--plum grain" id="what-is-spherex" aria-labelledby="spherex-title" style={{ position: 'relative', overflow: 'hidden' }}>
      <video
        className="section-video-bg"
        src="/videos/telescope.mp4"
        autoPlay
        muted loop playsInline
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p className="section__label">02 · What is SPHEREx?</p>

      <div className="spherex-section">
        <div>
          <h2 className="section__title" id="spherex-title">
            Seeing the <em>invisible</em> sky
          </h2>

          <div className="spherex-steps">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="spherex-step"
                ref={el => stepsRef.current[i] = el}
              >
                <span className="spherex-step__num" aria-hidden="true">{step.num}</span>
                <div className="spherex-step__body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="spherex-visual grain">
          <video
            ref={videoRef}
            className="spherex-visual__img"
            src="/videos/telescope.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-label="SPHEREx telescope illustration video"
            style={{
              borderRadius: '24px',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              background: '#1A0B1F',
              position: 'relative',
              zIndex: 1
            }}
          />
          <span className="spherex-visual__badge" role="img" aria-label="Artist's illustration">
            🎨 Artist's illustration
          </span>
        </div>
      </div>
      </div>
    </section>
  )
}
