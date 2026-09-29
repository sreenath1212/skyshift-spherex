export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--plum)',
        color: 'var(--cream)',
        padding: '5rem 2rem 3rem',
        borderTop: '1px solid rgba(244,235,221,0.1)',
        position: 'relative',
        zIndex: 10,
      }}
      className="grain"
    >
      {/* Creator Highlight Banner */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto 3.5rem',
          padding: '1.5rem 2rem',
          background: 'linear-gradient(135deg, rgba(232,0,110,0.15), rgba(255,107,26,0.15))',
          borderRadius: '20px',
          border: '1.5px solid rgba(232,0,110,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2.2rem' }}>🎓</span>
          <div>
            <h4 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.2rem' }}>
              Created by Sreenath Mohan
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
              Robotics Trainer · Unique World Robotics
            </p>
          </div>
        </div>
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            background: 'rgba(255,107,26,0.15)',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            border: '1px solid rgba(255,107,26,0.3)',
          }}
        >
          NASA Space Apps Challenge 2026
        </span>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--magenta)', boxShadow: '0 0 14px var(--magenta)' }} />
            <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--cream)' }}>
              SkyShift
            </h3>
          </div>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(244,235,221,0.7)', maxWidth: '360px', marginBottom: '1.5rem' }}>
            A public-facing visual experience enabling anyone to observe how our infrared sky changes over time through NASA's SPHEREx mission.
          </p>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.75rem', color: 'var(--lime)', padding: '0.3rem 0.8rem', background: 'rgba(180,242,36,0.12)', borderRadius: '50px', border: '1px solid rgba(180,242,36,0.25)' }}>
            🚀 NASA Space Apps Challenge 2026
          </span>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '1.25rem' }}>
            Mission & Data Credits
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', lineHeight: '1.8', color: 'rgba(244,235,221,0.75)' }}>
            <li><strong>SPHEREx Telescope:</strong> NASA / JPL-Caltech / IPAC</li>
            <li><strong>Data Archive:</strong> NASA/IPAC Infrared Science Archive (IRSA)</li>
            <li><strong>Data Identifier (DOI):</strong> <a href="https://doi.org/10.26131/IRSA652" target="_blank" rel="noreferrer" style={{ color: 'var(--lime)', textDecoration: 'underline' }}>10.26131/IRSA652</a></li>
            <li><strong>Wavelength Coverage:</strong> 0.75 µm – 5.0 µm (102 bands)</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '1.25rem' }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', lineHeight: '2' }}>
            <li><a href="#hero" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>↑ Back to Top</a></li>
            <li><a href="#what-is-spherex" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>01 · What is SPHEREx?</a></li>
            <li><a href="#explorer" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>02 · Interactive Sky Explorer</a></li>
            <li><a href="#blink" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>03 · Blink Comparator Mode</a></li>
            <li><a href="#movers" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>04 · Meet the Cosmic Movers</a></li>
            <li><a href="#wavelength" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>05 · Wavelength Spectrum</a></li>
            <li><a href="#game" style={{ color: 'rgba(244,235,221,0.7)', textDecoration: 'none' }}>06 · Hunt for Planet X Mini-Game</a></li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(244,235,221,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'rgba(244,235,221,0.6)',
          fontFamily: 'var(--ff-mono)',
        }}
      >
        <p>© 2026 SkyShift. Created by <strong>Sreenath Mohan</strong>, Robotics Trainer at <strong>Unique World Robotics</strong>.</p>
        <p>Built for the NASA International Space Apps Challenge.</p>
      </div>
    </footer>
  )
}
