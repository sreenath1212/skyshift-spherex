import { useState, useRef, useEffect } from 'react'

const STARTER_QUESTIONS = [
  'What is SPHEREx?',
  'What is Planet X?',
  'How do I spot moving objects?',
  'What is Comet 3I/ATLAS?'
]

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""
const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
]

const SYSTEM_PROMPT = `You are SkyShift Guide, an enthusiastic, friendly AI guide inside an interactive web exhibition about NASA's SPHEREx telescope created by Sreenath Mohan (Robotics Trainer at Unique World Robotics).

RULES & PERSONALITY:
- Explain everything in clear, simple, short English — no jargon. If you must use a science term, immediately explain it in plain language in parentheses.
- Be warm, encouraging, and engaging for audiences of all ages.
- NEVER claim Planet X is confirmed. Always refer to it as "hypothetical", "possible", or "not yet discovered".
- Answer ANY questions about space, astronomy, robotics, SPHEREx, moving objects, planet X, or the website author nicely.
- Clearly distinguish between real SPHEREx infrared data and artist's illustrations.`

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your SkyShift Guide 🔭. Ask me any question about SPHEREx, infrared astronomy, or how to spot moving objects!" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const fetchDirectGemini = async (text, history) => {
    const contents = [
      ...history.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text }] }
    ]

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
          })
        })

        if (!res.ok) continue
        const data = await res.json()
        const textResp = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (textResp) return textResp.trim()
      } catch (e) {
        console.warn(`Direct model ${modelName} attempt failed:`, e)
      }
    }
    return "SPHEREx maps the whole sky in 102 infrared colors! Moving objects like comets and asteroids reveal themselves by shifting position between images taken months apart. What would you like to explore next?"
  }

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim() || isLoading) return

    const userMsg = { role: 'user', text }
    const currentHistory = [...messages]
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)

    // Try Edge Serverless Endpoint first
    let success = false
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: currentHistory.slice(-4)
        })
      })

      if (response.ok) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let botText = ''
        setMessages(prev => [...prev, { role: 'bot', text: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.text) {
                  botText += data.text
                  setMessages(prev => {
                    const newArr = [...prev]
                    newArr[newArr.length - 1] = { role: 'bot', text: botText }
                    return newArr
                  })
                  success = true
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      // Fall through to Direct Gemini AI Fetcher
    }

    // Direct Gemini Client-Side AI Response if serverless endpoint is offline in local dev server
    if (!success) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Thinking… 🔭' }])
      const aiResponse = await fetchDirectGemini(text, currentHistory.slice(-4))
      setMessages(prev => {
        const newArr = [...prev]
        newArr[newArr.length - 1] = { role: 'bot', text: aiResponse }
        return newArr
      })
    }

    setIsLoading(false)
  }

  return (
    <div id="chatbot">
      {/* Floating Trigger Button */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 5000 }}>
        <button
          onClick={() => setIsOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--magenta)',
            color: 'var(--cream)',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '0.7rem 1.25rem',
            borderRadius: '50px',
            boxShadow: '0 6px 20px rgba(232,0,110,0.45)',
            transition: 'transform 0.3s var(--spring)',
            cursor: 'none',
          }}
          aria-label="Toggle SkyShift AI Assistant"
        >
          <span style={{ fontSize: '1.2rem' }}>🔭</span>
          Ask SkyShift
        </button>
      </div>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <span className="chatbot-mascot">🔭</span>
          <div>
            <h3>SkyShift Guide</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
              ● Gemini AI Powered
            </span>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chatbot-msg chatbot-msg--${m.role}`}>
              {m.text}
            </div>
          ))}

          {isLoading && (
            <div className="chatbot-typing">
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters */}
        <div className="chatbot-starters">
          {STARTER_QUESTIONS.map(q => (
            <button
              key={q}
              className="chatbot-starter"
              onClick={() => handleSend(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          className="chatbot-input-row"
          onSubmit={e => { e.preventDefault(); handleSend() }}
        >
          <input
            type="text"
            className="chatbot-input"
            placeholder="Ask any question about space, SPHEREx, etc…"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chatbot-send"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            ➔
          </button>
        </form>
      </div>
    </div>
  )
}
