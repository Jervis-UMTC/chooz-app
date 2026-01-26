import React, { useState } from 'react'
import WheelGame from './components/Wheel/WheelGame'
import LandingPage from './components/LandingPage'
import './index.css'
import ChoozTextLogo from './assets/chooz-text-logo.svg'

function App() {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="app-container">
      <header style={{ marginBottom: '20px', marginTop: '40px' }}>
        <img src={ChoozTextLogo} alt="Chooz" style={{ height: '80px' }} />
      </header>
      <WheelGame />
    </div>
  )
}

export default App
