import React, { useState } from 'react'
import './SimulationView.css'

function SimulationView({ config, results, onReset }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1000) // ms per step
  const [eventFilter, setEventFilter] = useState('all') // 'all', 'request', 'dispatch', 'delivery', 'return'

  const currentData = results.steps[currentStep]
  
  // Collect all events from start to current step
  const allEvents = results.steps
    .slice(0, currentStep + 1)
    .flatMap((step, stepIdx) => 
      step.events.map(event => ({ ...event, stepIndex: stepIdx }))
    )
    .filter(event => {
      if (eventFilter === 'all') return true
      return event.type === eventFilter
    })

  // Kế hoạch di chuyển của từng xe theo bước thời gian
  const plan = results.plan || {}
  const steps = results.steps

  React.useEffect(() => {
    let interval
    if (isPlaying && currentStep < results.steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < results.steps.length - 1) {
            return prev + 1
          } else {
            setIsPlaying(false)
            return prev
          }
        })
      }, playSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, results.steps.length, playSpeed])

  const handlePlayPause = () => {
    if (currentStep >= results.steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleResetSim = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleStepChange = (step) => {
    setCurrentStep(step)
    setIsPlaying(false)
  }

  const getWaterColor = (percentage) => {
    if (percentage < 20) return '#dc3545'
    if (percentage < 40) return '#ffc107'
    return '#28a745'
  }

  return (
    <div className="simulation-view">
      <div className="simulation-controls">
        <div className="control-group">
          <button onClick={handlePlayPause} className="btn-control">
            {isPlaying ? '⏸️ Tạm dừng' : '▶️ Phát'}
          </button>
          <button onClick={handleResetSim} className="btn-control">
            ⏮️ Về đầu
          </button>
          <button onClick={onReset} className="btn-control btn-reset">
            🔄 Cấu hình lại
          </button>
        </div>
        <div className="control-group">
          <label>
            Tốc độ:
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
            >
              <option value={500}>Nhanh (0.5s)</option>
              <option value={1000}>Bình thường (1s)</option>
              <option value={2000}>Chậm (2s)</option>
            </select>
          </label>
        </div>
        <div className="time-display">
          <strong>
            Bước {currentStep + 1}/{results.steps.length} - Thời gian:{' '}
            {currentData.time.toFixed(1)}h
          </strong>
        </div>
      </div>

      <div className="timeline">
        <input
          type="range"
          min="0"
          max={results.steps.length - 1}
          value={currentStep}
          onChange={(e) => handleStepChange(Number(e.target.value))}
          className="timeline-slider"
        />
      </div>

      <div className="simulation-content">
        <div className="tanks-display">
          <h2>💧 Trạng thái Bồn chứa</h2>
          <div className="tanks-grid">
            {currentData.tanks.map((tank) => (
              <div key={tank.id} className="tank-display-card">
                <div className="tank-header">
                  <h3>Bồn #{tank.id}</h3>
                  {tank.needsWater && (
                    <span className="alert-badge">⚠️ Cần nước</span>
                  )}
                </div>
                <div className="water-bar-container">
                  <div
                    className="water-bar"
                    style={{
                      width: `${tank.percentage}%`,
                      backgroundColor: getWaterColor(tank.percentage),
                    }}
                  >
                    <span className="water-text">
                      {tank.currentWater.toFixed(1)}L / {tank.capacity}L
                    </span>
                  </div>
                </div>
                <div className="tank-info">
                  <div className="info-item">
                    <span>Tiêu thụ:</span>
                    <span>{tank.consumption}L/bước</span>
                  </div>
                  <div className="info-item">
                    <span>Mức duy trì:</span>
                    <span>{tank.maintenanceLevel}L</span>
                  </div>
                  <div className="info-item">
                    <span>Tỷ lệ:</span>
                    <span>{tank.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trucks-display">
          <h2>🚛 Trạng thái Xe bồn</h2>
          <div className="trucks-grid">
            {currentData.trucks.map((truck) => (
              <div key={truck.id} className="truck-display-card">
                <div className="truck-header">
                  <h3>Xe #{truck.id}</h3>
                  <span
                    className={`status-badge ${
                      truck.available ? 'available' : 'busy'
                    }`}
                  >
                    {truck.status}
                  </span>
                </div>
                <div className="truck-info">
                  <div className="info-item">
                    <span>Dung tích:</span>
                    <span>{config.trucks.find((t) => t.id === truck.id).capacity}L</span>
                  </div>
                  <div className="info-item">
                    <span>Nước hiện tại:</span>
                    <span>{truck.currentWater.toFixed(1)}L</span>
                  </div>
                  {truck.targetTank && (
                    <div className="info-item highlight">
                      <span>Đang đến:</span>
                      <span>Bồn #{truck.targetTank}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="events-display">
          <div className="events-header">
            <h2>📋 Sự kiện</h2>
            <div className="event-filters">
              <button
                className={eventFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setEventFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={eventFilter === 'request' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setEventFilter('request')}
              >
                Yêu cầu
              </button>
              <button
                className={eventFilter === 'dispatch' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setEventFilter('dispatch')}
              >
                Điều động
              </button>
              <button
                className={eventFilter === 'delivery' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setEventFilter('delivery')}
              >
                Cấp nước
              </button>
              <button
                className={eventFilter === 'return' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setEventFilter('return')}
              >
                Quay về
              </button>
            </div>
          </div>
          <div className="events-tabs">
            <div className="events-section">
              <h3>📌 Sự kiện bước hiện tại</h3>
              <div className="events-list current-events">
                {currentData.events.length > 0 ? (
                  currentData.events.map((event, idx) => (
                    <div key={idx} className={`event-item event-${event.type}`}>
                      <span className="event-time">{event.time.toFixed(1)}h</span>
                      <span className="event-message">{event.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="event-item">Không có sự kiện trong bước này</div>
                )}
              </div>
            </div>
            <div className="events-section">
              <h3>📜 Tất cả sự kiện ({allEvents.length})</h3>
              <div className="events-list all-events">
                {allEvents.length > 0 ? (
                  allEvents.reverse().map((event, idx) => (
                    <div 
                      key={idx} 
                      className={`event-item event-${event.type} ${
                        event.stepIndex === currentStep ? 'current-step-event' : ''
                      }`}
                    >
                      <span className="event-time">{event.time.toFixed(1)}h</span>
                      <span className="event-message">{event.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="event-item">Chưa có sự kiện nào</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <h2>📊 Tổng quan</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Tổng thời gian:</span>
            <span className="summary-value">{results.summary.totalTime}h</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Số bước:</span>
            <span className="summary-value">{results.summary.totalSteps}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Số bồn:</span>
            <span className="summary-value">{results.summary.tanks}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Số xe:</span>
            <span className="summary-value">{results.summary.trucks}</span>
          </div>
        </div>

        <div className="plan-table-container">
          <h3>🗺️ Bảng kế hoạch xe theo bước thời gian</h3>
          <div className="plan-table-wrapper">
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Xe / Bước</th>
                  {steps.map((step, index) => (
                    <th key={index}>
                      {index + 1}
                      <div className="plan-step-time">{step.time.toFixed(1)}h</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.trucks.map((truck) => {
                  const truckPlan = (plan && plan[truck.id]) || []
                  return (
                    <tr key={truck.id}>
                      <td className="plan-truck-cell">Xe #{truck.id}</td>
                      {steps.map((step, stepIdx) => {
                        const t = step.time
                        const ts = config.timeStep
                        // Tìm chuyến mà thời gian này nằm giữa đi và về
                        const trip = truckPlan.find(
                          (trip) =>
                            trip.departTime != null &&
                            trip.returnTime != null &&
                            t >= trip.departTime - ts / 2 &&
                            t <= trip.returnTime + ts / 2
                        )
                        if (!trip) {
                          return <td key={stepIdx}></td>
                        }

                        const isDepart =
                          Math.abs(t - trip.departTime) < ts / 2
                        const isReturn =
                          Math.abs(t - trip.returnTime) < ts / 2

                        return (
                          <td
                            key={stepIdx}
                            className={`plan-cell ${
                              isDepart
                                ? 'plan-depart'
                                : isReturn
                                ? 'plan-return'
                                : 'plan-travel'
                            }`}
                          >
                            {isDepart && (
                              <div>
                                <div>Đi</div>
                                <div className="plan-time">
                                  {trip.departTime.toFixed(1)}h →{' '}
                                  {trip.arrivalTime.toFixed(1)}h
                                </div>
                                <div className="plan-tank">
                                  Bồn #{trip.tankId}
                                </div>
                              </div>
                            )}
                            {isReturn && (
                              <div>
                                <div>Về</div>
                                <div className="plan-time">
                                  {trip.arrivalTime.toFixed(1)}h →{' '}
                                  {trip.returnTime.toFixed(1)}h
                                </div>
                                <div className="plan-tank">
                                  Bồn #{trip.tankId}
                                </div>
                              </div>
                            )}
                            {!isDepart && !isReturn && (
                              <div className="plan-tank plan-travel-label">
                                Bồn #{trip.tankId}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationView

