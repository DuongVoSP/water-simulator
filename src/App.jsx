import React, { useState } from 'react'
import './App.css'
import InputForm from './components/InputForm'
import SimulationView from './components/SimulationView'
import { runSimulation } from './utils/simulation'

function App() {
  const [config, setConfig] = useState(null)
  const [simulationResults, setSimulationResults] = useState(null)

  const handleStartSimulation = (simConfig) => {
    setConfig(simConfig)
    const results = runSimulation(simConfig)
    setSimulationResults(results)
  }

  const handleReset = () => {
    setConfig(null)
    setSimulationResults(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚛 Hệ thống Quản lý Cấp nước</h1>
        <p>Mô phỏng điều động xe bồn cấp nước tự động</p>
      </header>

      {!config ? (
        <InputForm onStart={handleStartSimulation} />
      ) : (
        <SimulationView
          config={config}
          results={simulationResults}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App

