import { useState } from 'react'

const DURATION = 4000

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, closing: false }])
    setTimeout(() => {
      // mark as closing to trigger fade-out
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
  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: translateY(-24px) scale(0.92); }
          60%  { transform: translateY(4px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.88); }
        }
        .toast-in  { animation: popIn  0.32s cubic-bezier(.34,1.56,.64,1) forwards; }
        .toast-out { animation: popOut 0.32s ease forwards; }
      `}</style>

      <div className="fixed top-5 right-0 left-0 flex flex-col items-center gap-3 z-50 px-5 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${t.closing ? 'toast-out' : 'toast-in'}`}
          >
            {/* progress bar */}
            <div
              className="h-1 bg-indigo-500 rounded-full"
              style={{
                width: t.closing ? '0%' : '100%',
                transition: t.closing ? 'none' : `width ${DURATION - 350}ms linear`,
                transitionDelay: '50ms',
              }}
            />

            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl shrink-0">{extractEmoji(t.message)}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">{stripEmoji(t.message)}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0"
                aria-label="סגור"
              >
                ×
              </button>
            </div>
          </div>
        ))}
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
