import { MainLayout } from './components/layout/MainLayout'
import { VerificationGate } from './components/VerificationGate'

function App() {
  return (
    <VerificationGate>
      <MainLayout />
    </VerificationGate>
  )
}

export default App
