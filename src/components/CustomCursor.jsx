import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
      return
    }

    const onMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useEffect(() => {
    if (isTouch) return
    let animId
    const follow = () => {
      setRingPos(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.18,
        y: prev.y + (pos.y - prev.y) * 0.18,
      }))
      animId = requestAnimationFrame(follow)
    }
    animId = requestAnimationFrame(follow)
    return () => cancelAnimationFrame(animId)
  }, [pos, isTouch])

  if (isTouch) return null

  return (
    <>
      <div
        className="cursor"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        aria-hidden="true"
      />
      <div
        className="cursor-ring"
        style={{ left: `${ringPos.x}px`, top: `${ringPos.y}px` }}
        aria-hidden="true"
      />
    </>
  )
}
