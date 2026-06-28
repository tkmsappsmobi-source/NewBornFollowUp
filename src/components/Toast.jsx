import { useState } from 'react'

const DURATION = 2500

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, closing: false }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 350)
    }, DURATION - 350)
  }

  const dismiss = (id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350)
  }

  return { toasts, showToast, dismiss }
}

export function ToastContainer({ toasts, dismiss }) {
  if (toasts.length === 0) return null

  const latest = toasts[toasts.length - 1]

  return (
    <>
      <style>{`
        @keyframes popupIn {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          60%  { transform: translate(-50%, -50%) scale(1.06); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes popupOut {
          0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        .popup-in  { animation: popupIn  0.35s cubic-bezier(.34,1.56,.64,1) forwards; }
        .popup-out { animation: popupOut 0.35s ease forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${latest.closing ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'rgba(0,0,0,0.25)' }}
      />

      {/* Popup */}
      <div
        key={latest.id}
        className={`fixed z-50 pointer-events-auto ${latest.closing ? 'popup-out' : 'popup-in'}`}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={() => dismiss(latest.id)}
      >
        <div className="bg-white rounded-3xl shadow-2xl px-8 py-7 flex flex-col items-center gap-3 min-w-[220px] max-w-[300px] text-center"
          dir="rtl"
        >
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${
            latest.type === 'error' ? 'bg-red-100' : 'bg-[#EDE5FF]'
          }`}>
            {latest.type === 'error' ? '❌' : extractEmoji(latest.message)}
          </div>

          {/* Message */}
          <p className="text-[16px] font-bold text-[#1A0F3C] leading-snug">
            {stripEmoji(latest.message)}
          </p>

          {latest.type !== 'error' && (
            <p className="text-[12px] text-[#9090B0]">נרשם בהצלחה ✓</p>
          )}

          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${latest.type === 'error' ? 'bg-red-400' : 'bg-[#7B3FDB]'}`}
              style={{
                width: latest.closing ? '0%' : '100%',
                transition: latest.closing ? 'none' : `width ${DURATION - 350}ms linear`,
                transitionDelay: '50ms',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function extractEmoji(text) {
  const m = text.match(/^\p{Emoji}/u)
  return m ? m[0] : '✅'
}

function stripEmoji(text) {
  return text.replace(/^\p{Emoji}\s*/u, '').trim()
}
