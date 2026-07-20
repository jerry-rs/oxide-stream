import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { Video, ShieldCheck } from 'lucide-react'

const CORRECT_CODE = '369630'

type VerificationGateProps = {
  children: React.ReactNode
}

export function VerificationGate({ children }: VerificationGateProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState(false)
  const [verified, setVerified] = useState(() => sessionStorage.getItem('verified') === 'true')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    setError(false)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    const code = newDigits.join('')
    if (code.length === 6) {
      if (code === CORRECT_CODE) {
        sessionStorage.setItem('verified', 'true')
        setVerified(true)
      } else {
        setError(true)
        setDigits(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length !== 6) return

    const newDigits = pasted.split('')
    setDigits(newDigits)
    setError(false)

    if (pasted === CORRECT_CODE) {
      sessionStorage.setItem('verified', 'true')
      setVerified(true)
    } else {
      setError(true)
      setDigits(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  if (verified) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-black/5">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 shadow-lg">
            <Video size={24} className="text-white" />
          </div>

          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900">Oxide Stream</h1>
            <p className="mt-1 text-sm text-slate-500">Enter verification code to continue</p>
          </div>

          <div className="flex gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`h-12 w-10 rounded-lg border text-center text-lg font-semibold outline-none transition-all duration-150 focus:ring-2 focus:ring-violet-500 ${
                  error
                    ? 'border-rose-300 bg-rose-50 text-rose-600 animate-shake'
                    : digit
                      ? 'border-violet-300 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-900'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-sm text-rose-500">
              <ShieldCheck size={14} />
              <span>Invalid code. Please try again.</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}