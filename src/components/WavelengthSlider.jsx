import { useEffect, useRef, useState } from 'react'

const WAVELENGTH_BANDS = [
  { idx: 0, label: '0.75 µm', name: 'Near-infrared edge', desc: 'Just beyond visible red light. Stars glow here in peachy warm tones. Cool stars and warm dust light up.', color: '#FF8C7A' },
  { idx: 1, label: '1.05 µm', name: 'Near-infrared', desc: 'This is where most stars shine brightest in SPHEREx. Galaxies start to look like smeared fuzzy blobs of light.', color: '#FF6B1A' },
  { idx: 2, label: '1.65 µm', name: 'H-band', desc: 'Warm dust clouds emerge. Regions where new stars are being born glow strongly here.', color: '#E8006E' },
  { idx: 3, label: '2.5 µm', name: 'K-band', desc: 'Molecules of water ice on asteroids and comets absorb light at this wavelength, making them dim.', color: '#E8006E' },
  { idx: 4, label: '3.55 µm', name: 'Mid-infrared', desc: 'Comets and asteroids glow from their own heat. This is where 3I/ATLAS was brightest.', color: '#B4F224' },
  { idx: 5, label: '4.5 µm', name: 'Long-wave IR', desc: 'The coolest objects — brown dwarfs, very distant galaxies — glow here. The whole sky looks different!', color: '#B4F224' },
]

function drawSpectrum(canvas, activeIdx) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  // Spectrum gradient bar
  const grad = ctx.createLinearGradient(0, 0, width, 0)
  grad.addColorStop(0, '#FF8C7A')
  grad.addColorStop(0.3, '#FF6B1A')
  grad.addColorStop(0.6, '#E8006E')
  grad.addColorStop(1, '#B4F224')
  ctx.fillStyle = grad
  ctx.fillRect(0, height - 12, width, 12)

  // Gaussian emission lines
  const peaks = [0.15, 0.3, 0.5, 0.65, 0.8, 0.95]
  peaks.forEach((px, i) => {
    const x = px * width
    const peakH = i === activeIdx ? height - 18 : (20 + Math.random() * 30)
    const lineGrad = ctx.createLinearGradient(0, height - 12, 0, height - 12 - peakH)
    lineGrad.addColorStop(0, WAVELENGTH_BANDS[i].color)
    lineGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = lineGrad
    ctx.beginPath()
    const w = i === activeIdx ? 12 : 6
    ctx.roundRect(x - w/2, height - 12 - peakH, w, peakH, 3)
    ctx.fill()
  })

  // Active marker
  const ax = peaks[activeIdx] * width
  ctx.strokeStyle = '#FAF7F2'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(ax, 0)
  ctx.lineTo(ax, height - 14)
  ctx.stroke()
  ctx.setLineDash([])
}

// Renders a wavelength-colored starfield
function renderWavelengthField(canvas, bandIdx) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const band = WAVELENGTH_BANDS[bandIdx]
  const darkColors = ['#1A0B1F', '#2D1438', '#0D0510']
  const bg = darkColors[bandIdx % 3]
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  let seed = 555 + bandIdx * 73
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }

  // Stars in band color
  for (let i = 0; i < 500; i++) {
    const x = rand() * width
    const y = rand() * height
    const r = rand() * 2 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = band.color
    ctx.globalAlpha = rand() * 0.7 + 0.2
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Add grain
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 18
    data[i]   = Math.max(0, Math.min(255, data[i] + n))
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + n))
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + n))
  }
  ctx.putImageData(imgData, 0, 0)
}

export default function WavelengthSlider() {
  const [bandIdx, setBandIdx] = useState(2)
  const viewerCanvas = useRef(null)
  const spectrumCanvas = useRef(null)

  useEffect(() => {
    const vc = viewerCanvas.current
    if (vc) {
      vc.width = vc.offsetWidth
      vc.height = vc.offsetHeight
      renderWavelengthField(vc, bandIdx)
    }
    const sc = spectrumCanvas.current
    if (sc) {
      sc.width = sc.offsetWidth
      sc.height = sc.offsetHeight
      drawSpectrum(sc, bandIdx)
    }
  }, [bandIdx])

  const band = WAVELENGTH_BANDS[bandIdx]

  return (
    <section className="section section--plum grain" id="wavelength" aria-labelledby="wavelength-title" style={{ position: 'relative', overflow: 'hidden' }}>
      <video
        className="section-video-bg"
        src="/videos/hero.mp4"
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
          pointerEvents: 'none',
          filter: 'contrast(1.2) saturate(1.4)'
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p className="section__label">06 · Wavelength Slider</p>

      <div className="wavelength-section">
        <div className="wavelength-viewer">
          <canvas
            ref={viewerCanvas}
            style={{ width: '100%', height: '100%', borderRadius: '20px', display: 'block', background: '#1A0B1F' }}
            aria-label={`Sky view in ${band.label} infrared light`}
          />
          <div style={{
            position: 'absolute', bottom: '1rem', left: '1rem',
            fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', letterSpacing: '0.1em',
            background: 'rgba(26,11,31,0.85)', color: 'var(--lime)',
            padding: '0.4rem 0.8rem', borderRadius: '50px',
          }}>
            🎨 Artist's illustration · {band.label}
          </div>
        </div>

        <div className="wavelength-controls">
          <h2 className="section__title" id="wavelength-title">
            Shift the <em>spectrum</em>
          </h2>

          <div className="wavelength-slider-wrap">
            <input
              type="range"
              className="wavelength-slider"
              min={0}
              max={WAVELENGTH_BANDS.length - 1}
              value={bandIdx}
              onChange={e => setBandIdx(Number(e.target.value))}
              aria-label="Wavelength slider — change infrared color band"
            />
            <div className="wavelength-labels">
              <span>Near-IR</span>
              <span>Mid-IR</span>
              <span>Far-IR</span>
            </div>
          </div>

          <div className="spectrum-graph" aria-label="SPHEREx wavelength spectrum graph">
            <canvas ref={spectrumCanvas} style={{ width: '100%', height: '80px', display: 'block' }} />
          </div>

          <div className="wavelength-info">
            <h4 style={{ color: band.color }}>{band.label} — {band.name}</h4>
            <p>{band.desc}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(244,235,221,0.4)', fontFamily: 'var(--ff-mono)' }}>
              SPHEREx uses 102 infrared wavelength bands. This is band {bandIdx + 1} of 6 shown.
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
