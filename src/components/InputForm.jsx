import React, { useState } from 'react'
import './InputForm.css'

function InputForm({ onStart }) {
  const [timeStep, setTimeStep] = useState(1)
  const [tanks, setTanks] = useState([
    {
      id: 1,
      capacity: 1000,
      currentWater: 800,
      consumption: 50,
      travelTime: 2,
      maintenanceLevel: 200,
    },
  ])
  const [trucks, setTrucks] = useState([{ id: 1, capacity: 500 }])
  const [simulationHours, setSimulationHours] = useState(24)

  const addTank = () => {
    const newId = Math.max(...tanks.map((t) => t.id), 0) + 1
    setTanks([
      ...tanks,
      {
        id: newId,
        capacity: 1000,
        currentWater: 800,
        consumption: 50,
        travelTime: 2,
        maintenanceLevel: 200,
      },
    ])
  }

  const removeTank = (id) => {
    setTanks(tanks.filter((t) => t.id !== id))
  }

  const updateTank = (id, field, value) => {
    setTanks(
      tanks.map((t) =>
        t.id === id ? { ...t, [field]: parseFloat(value) || 0 } : t
      )
    )
  }

  const addTruck = () => {
    const newId = Math.max(...trucks.map((t) => t.id), 0) + 1
    setTrucks([...trucks, { id: newId, capacity: 500 }])
  }

  const removeTruck = (id) => {
    setTrucks(trucks.filter((t) => t.id !== id))
  }

  const updateTruck = (id, field, value) => {
    setTrucks(
      trucks.map((t) =>
        t.id === id ? { ...t, [field]: parseFloat(value) || 0 } : t
      )
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onStart({
      timeStep,
      simulationHours,
      tanks: tanks.map((t) => ({ ...t })),
      trucks: trucks.map((t) => ({ ...t })),
    })
  }

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-section">
          <h2>⚙️ Cấu hình Mô phỏng</h2>
          <div className="form-group">
            <label>
              Bước thời gian (giờ):
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={timeStep}
                onChange={(e) => setTimeStep(parseFloat(e.target.value) || 0.1)}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Thời gian mô phỏng (giờ):
              <input
                type="number"
                min="1"
                value={simulationHours}
                onChange={(e) =>
                  setSimulationHours(parseInt(e.target.value) || 1)
                }
                required
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>💧 Bồn chứa nước</h2>
            <button type="button" onClick={addTank} className="btn-add">
              + Thêm bồn
            </button>
          </div>
          {tanks.map((tank) => (
            <div key={tank.id} className="tank-card">
              <div className="card-header">
                <h3>Bồn #{tank.id}</h3>
                {tanks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTank(tank.id)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Dung tích chứa (L):
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={tank.capacity}
                      onChange={(e) =>
                        updateTank(tank.id, 'capacity', e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Lượng nước hiện tại (L):
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={tank.currentWater}
                      onChange={(e) =>
                        updateTank(tank.id, 'currentWater', e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Tiêu thụ mỗi bước (L):
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={tank.consumption}
                      onChange={(e) =>
                        updateTank(tank.id, 'consumption', e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Thời gian di chuyển (giờ):
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={tank.travelTime}
                      onChange={(e) =>
                        updateTank(tank.id, 'travelTime', e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Mức duy trì (L):
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={tank.maintenanceLevel}
                      onChange={(e) =>
                        updateTank(tank.id, 'maintenanceLevel', e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>🚛 Xe bồn</h2>
            <button type="button" onClick={addTruck} className="btn-add">
              + Thêm xe
            </button>
          </div>
          {trucks.map((truck) => (
            <div key={truck.id} className="truck-card">
              <div className="card-header">
                <h3>Xe #{truck.id}</h3>
                {trucks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTruck(truck.id)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="form-group">
                <label>
                  Dung tích chứa (L):
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={truck.capacity}
                    onChange={(e) =>
                      updateTruck(truck.id, 'capacity', e.target.value)
                    }
                    required
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-submit">
          ▶️ Bắt đầu Mô phỏng
        </button>
      </form>
    </div>
  )
}

export default InputForm

