import { useState, useEffect } from 'react'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Preloader from './components/Preloader'
import Hero from './components/Hero'
import WhatIsSPHEREx from './components/WhatIsSPHEREx'
import SkyExplorer from './components/SkyExplorer'
import BlinkMode from './components/BlinkMode'
import MeetTheMovers from './components/MeetTheMovers'
import WavelengthSlider from './components/WavelengthSlider'
import HuntForPlanetX from './components/HuntForPlanetX'
import GuidedTour from './components/GuidedTour'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [manifest, setManifest] = useState(null)

  useEffect(() => {
    // Try fetching real spherex_manifest.json if available from Python script
    fetch('/data/spherex_manifest.json')
      .then(res => res.json())
      .then(data => setManifest(data))
      .catch(() => {
        // Fall back to built-in placeholder data seamlessly
      })
  }, [])

  const handleComplete = () => {
    setLoaded(true)
    // Small delay so preloader exit animation finishes before showing content
    setTimeout(() => setVisible(true), 100)
  }

  return (
    <>
      <CustomCursor />

      {!loaded && <Preloader onComplete={handleComplete} />}

      {loaded && (
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <Navbar onStartTour={() => setTourOpen(true)} />

          <main>
            <Hero />
            <WhatIsSPHEREx />
            <SkyExplorer manifest={manifest} />
            <BlinkMode />
            <MeetTheMovers />
            <WavelengthSlider />
            <HuntForPlanetX />
          </main>

          <Footer />

          <GuidedTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
          <Chatbot />
        </div>
      )}
    </>
  )
}
