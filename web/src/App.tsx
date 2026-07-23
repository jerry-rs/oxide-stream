import { Toaster } from '@/components/ui/sonner'
import { MainLayout } from './components/layout/MainLayout'
import { VerificationGate } from './components/VerificationGate'

function App() {
  return (
    <>
      <VerificationGate>
        <MainLayout />
      </VerificationGate>
      <Toaster />
    </>
  )
}

export default App
