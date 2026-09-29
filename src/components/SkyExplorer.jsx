import { useEffect, useRef, useState, useCallback } from 'react'

const PLACEHOLDER_PATCHES = [
  {
    id: 'comet_3i_atlas',
    name: 'Comet 3I/ATLAS',
    observations: [
      { date: '2025-07-01', file: null, sample: true, label: 'Sample / illustration' },
      { date: '2025-08-15', file: null, sample: true, label: 'Sample / illustration' },
      { date: '2025-09-28', file: null, sample: true, label: 'Sample / illustration' },
    ],
    movingObject: { x: 0.35, y: 0.45, label: '3I/ATLAS' }
  },
  {
    id: 'orion_nebula_region',
    name: 'Orion Nebula Region',
    observations: [
      { date: '2025-05-10', file: null, sample: true, label: 'Sample / illustration' },
      { date: '2025-08-01', file: null, sample: true, label: 'Sample / illustration' },
    ],
    movingObject: { x: 0.6, y: 0.3, label: 'Asteroid' }
  },
  {
    id: 'galactic_center_region',
    name: 'Galactic Center Region',
    observations: [
      { date: '2025-04-20', file: null, sample: true, label: 'Sample / illustration' },
      { date: '2025-07-20', file: null, sample: true, label: 'Sample / illustration' },
    ],
    movingObject: { x: 0.5, y: 0.6, label: 'Brown Dwarf' }
  }
]

// Renders an infrared false-color starfield on a canvas (placeholder)
function renderStarfield(canvas, patchId, dateIndex, options = {}) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  // Background gradient
  const bg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7)
  bg.addColorStop(0, '#3D1250')
  bg.addColorStop(1, '#1A0B1F')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // Seed random per patch+date for consistency
  let seed = patchId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + dateIndex * 137
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }

  const colors = ['#E8006E', '#FF6B1A', '#B4F224', '#FF8C7A', '#FAF7F2']

  // Stars
  for (let i = 0; i < 600; i++) {
    const x = rand() * width
    const y = rand() * height
    const r = rand() * 2.5 + 0.5
    const c = colors[Math.floor(rand() * colors.length)]
    const alpha = rand() * 0.7 + 0.3
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = c
    ctx.globalAlpha = alpha
    ctx.fill()

    // Glow
    if (r > 1.5) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 6)
      glow.addColorStop(0, c)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.globalAlpha = alpha * 0.2
      ctx.beginPath()
      ctx.arc(x, y, r * 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // Nebula smears
  for (let n = 0; n < 5; n++) {
    const nx = rand() * width
    const ny = rand() * height
    const nr = rand() * 60 + 30
    const nc = colors[Math.floor(rand() * colors.length)]
    const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
    nebGrad.addColorStop(0, nc)
    nebGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = nebGrad
    ctx.globalAlpha = rand() * 0.08 + 0.02
    ctx.fillRect(0, 0, width, height)
    ctx.globalAlpha = 1
  }

  // Moving object ring (position shifts by dateIndex)
  if (options.movingObject) {
    const mx = (options.movingObject.x + dateIndex * 0.06) * width
    const my = (options.movingObject.y - dateIndex * 0.03) * height
    // Trail
    if (dateIndex > 0) {
      const px = options.movingObject.x * width
      const py = options.movingObject.y * height
      ctx.setLineDash([4, 6])
      ctx.strokeStyle = '#B4F224'
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(mx, my)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }
    ctx.beginPath()
    ctx.arc(mx, my, 10, 0, Math.PI * 2)
    ctx.strokeStyle = '#B4F224'
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.9
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // Grain
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 20
    data[i]   = Math.max(0, Math.min(255, data[i] + noise))
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise))
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise))
  }
  ctx.putImageData(imgData, 0, 0)
}

export default function SkyExplorer({ manifest }) {
  const canvasRef = useRef(null)
  const [patches] = useState(manifest?.patches || PLACEHOLDER_PATCHES)
  const [activePatch, setActivePatch] = useState(0)
  const [timeIdx, setTimeIdx] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const patch = patches[activePatch]
  const obs = patch?.observations || []
  const currentObs = obs[timeIdx] || obs[0]

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.translate(W/2 + pan.x, H/2 + pan.y)
    ctx.scale(zoom, zoom)
    ctx.translate(-W/2, -H/2)
    renderStarfield(canvas, patch.id, timeIdx, { movingObject: patch.movingObject })
    ctx.restore()
  }, [patch, timeIdx, zoom, pan])

  // Pan handlers
  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }, [pan])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y })
  }, [])

  const onMouseUp = useCallback(() => { dragRef.current = null }, [])

  return (
    <section className="section section--plum grain" id="explorer" aria-labelledby="explorer-title" style={{ position: 'relative', overflow: 'hidden' }}>
      <video
        className="section-video-bg"
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
          opacity: 0.35,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p className="section__label">03 · Sky Explorer</p>

      <div className="explorer-header">
        <h2 className="section__title" id="explorer-title">
          Watch the sky <em>shift</em>
        </h2>

        {/* Patch selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {patches.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setActivePatch(i); setTimeIdx(0) }}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '50px',
                background: i === activePatch ? 'var(--magenta)' : 'rgba(255,255,255,0.08)',
                color: 'var(--cream)',
                fontSize: '0.8rem',
                fontWeight: i === activePatch ? '700' : '400',
                transition: 'all 0.2s',
              }}
              aria-pressed={i === activePatch}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="explorer-viewport">
        <canvas
          ref={canvasRef}
          className="explorer-canvas"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          aria-label={`SPHEREx sky view: ${patch?.name}, ${currentObs?.date}`}
          tabIndex={0}
        />

        {/* Data label */}
        <div className="explorer-overlay-label">
          <span className={`ir-label ${currentObs?.sample ? 'ir-label--sample' : 'ir-label--real'}`}>
            {currentObs?.sample ? '📊 Sample / illustration' : '🔭 Real SPHEREx data'}
          </span>
        </div>

        {/* Moving object ring overlay */}
        {patch?.movingObject && (
          <div
            className="moving-object-ring"
            style={{
              left: `${(patch.movingObject.x + timeIdx * 0.06) * 100}%`,
              top: `${(patch.movingObject.y - timeIdx * 0.03) * 100}%`,
              width: '40px', height: '40px',
              marginLeft: '-20px', marginTop: '-20px',
            }}
            aria-label={`Moving object: ${patch.movingObject.label}`}
          />
        )}
      </div>

      <div className="explorer-controls">
        <div className="time-slider-container">
          <div className="time-slider-label">
            <span>{obs[0]?.date}</span>
            <span style={{ color: 'var(--magenta)', fontWeight: '700' }}>
              {currentObs?.date}
              {currentObs?.sample && <span style={{ color: 'var(--orange)', marginLeft: '0.5rem' }}>(illustration)</span>}
            </span>
            <span>{obs[obs.length - 1]?.date}</span>
          </div>
          <input
            type="range"
            className="time-slider"
            min={0}
            max={obs.length - 1}
            value={timeIdx}
            onChange={e => setTimeIdx(Number(e.target.value))}
            aria-label="Time slider — move between observation dates"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="explorer-zoom-controls">
            <button className="btn-icon" onClick={() => setZoom(z => Math.min(z + 0.25, 4))} aria-label="Zoom in">＋</button>
            <button className="btn-icon" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} aria-label="Zoom out">－</button>
            <button className="btn-icon" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} aria-label="Reset view">⊙</button>
          </div>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.7rem', color: 'rgba(244,235,221,0.4)' }}>
            Zoom: {zoom.toFixed(2)}× · Drag to pan · Moving object: glowing ring
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(244,235,221,0.35)',
          fontFamily: 'var(--ff-mono)',
          lineHeight: '1.6',
        }}>
          ⚠️ Real SPHEREx images load after running <code>python fetch_spherex_data.py</code> — see README.
          Illustrations shown until real data is downloaded. DOI: 10.26131/IRSA652
        </p>
      </div>
      </div>
    </section>
  )
}
