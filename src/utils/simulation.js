export function runSimulation(config) {
  const { timeStep, simulationHours, tanks, trucks } = config
  const steps = Math.ceil(simulationHours / timeStep)
  const results = []

  // Trạng thái xe bồn
  const truckStates = trucks.map((t) => ({
    ...t,
    available: true,
    currentWater: 0,
    targetTank: null,
  }))

  // Trạng thái bồn chứa
  const tankStates = tanks.map((t) => ({
    ...t,
    currentWater: t.currentWater,
    needsWater: false,
    requestedTime: null,
    truckAssigned: false,
  }))

  // Event queue (điều phối bởi timeStep)
  // Các event nội bộ: truck-arrive, truck-return
  // Các event cho UI: request, dispatch, delivery, return
  const eventQueue = []
  const uiEvents = []
  // Kế hoạch di chuyển của từng xe: danh sách các chuyến đi (depart/arrive/return)
  const truckPlans = {}
  trucks.forEach((t) => {
    truckPlans[t.id] = []
  })

  const scheduleEvent = (time, type, payload) => {
    eventQueue.push({ time, type, ...payload, processed: false })
  }

  const logUiEvent = (time, type, payload) => {
    uiEvents.push({ time, type, ...payload })
  }

  for (let step = 0; step < steps; step++) {
    const currentTime = step * timeStep
    const stepResult = {
      time: currentTime,
      tanks: [],
      trucks: [],
      events: [],
    }

    // 1. Xử lý các event đến hạn trong khoảng [currentTime, currentTime + timeStep)
    let found = true
    while (found) {
      found = false
      const idx = eventQueue.findIndex(
        (e) => !e.processed && e.time >= currentTime && e.time < currentTime + timeStep
      )
      if (idx !== -1) {
        found = true
        const event = eventQueue[idx]
        event.processed = true

        if (event.type === 'truck-arrive') {
          const truck = truckStates.find((tr) => tr.id === event.truckId)
          const tank = tankStates.find((tk) => tk.id === event.tankId)
          if (truck && tank) {
            // Truck mang đầy nước đến bồn
            const waterCanAdd = tank.capacity - tank.currentWater
            const waterDelivered = Math.min(truck.currentWater, waterCanAdd)

            tank.currentWater += waterDelivered
            truck.currentWater -= waterDelivered

            logUiEvent(event.time, 'delivery', {
              message: `Xe #${truck.id} đã cấp ${waterDelivered.toFixed(
                1
              )}L nước cho Bồn #${tank.id}`,
              truckId: truck.id,
              tankId: tank.id,
              amount: waterDelivered,
            })

            if (tank.currentWater >= tank.maintenanceLevel) {
              tank.needsWater = false
            }
            tank.truckAssigned = false

            // Cập nhật kế hoạch: arrivalTime cho chuyến hiện tại và lên lịch quay về
            const plans = truckPlans[truck.id] || []
            const lastTrip = plans[plans.length - 1]
            if (lastTrip && lastTrip.returnTime == null) {
              lastTrip.arrivalTime = event.time
              lastTrip.returnTime = event.time + tank.travelTime
            }

            // Sau khi giao nước xong, xe cần thêm travelTime để quay về điểm xuất phát
            // -> chỉ khi xử lý event 'truck-return' thì xe mới available
            scheduleEvent(event.time + tank.travelTime, 'truck-return', {
              truckId: truck.id,
            })
          }
        } else if (event.type === 'truck-return') {
          const truck = truckStates.find((tr) => tr.id === event.truckId)
          if (truck) {
            truck.available = true
            truck.currentWater = 0
            truck.targetTank = null

            logUiEvent(event.time, 'return', {
              message: `Xe #${truck.id} đã quay về điểm xuất phát và sẵn sàng`,
              truckId: truck.id,
            })
          }
        }
      }
    }

    // 2. Cập nhật bồn: tiêu thụ nước và tạo request nếu cần
    tankStates.forEach((tank) => {
      // Tiêu thụ nước theo bước thời gian (giả sử consumption là L/bước)
      tank.currentWater = Math.max(0, tank.currentWater - tank.consumption)

      const nextWaterLevel = tank.currentWater - tank.consumption
      const willBeBelow = nextWaterLevel < tank.maintenanceLevel
      const alreadyBelow = tank.currentWater < tank.maintenanceLevel

      if ((willBeBelow || alreadyBelow) && !tank.needsWater) {
        tank.needsWater = true
        tank.requestedTime = currentTime
        tank.truckAssigned = false

        logUiEvent(currentTime, 'request', {
          message: `Bồn #${tank.id} yêu cầu cấp nước (${Math.max(
            nextWaterLevel,
            tank.currentWater
          ).toFixed(1)}L < ${tank.maintenanceLevel}L)`,
          tankId: tank.id,
        })
      }

      stepResult.tanks.push({
        id: tank.id,
        currentWater: tank.currentWater,
        capacity: tank.capacity,
        consumption: tank.consumption,
        maintenanceLevel: tank.maintenanceLevel,
        needsWater: tank.needsWater,
        percentage: (tank.currentWater / tank.capacity) * 100,
      })
    })

    // 3. Điều động xe cho các bồn cần nước (publish/subscribe theo state)
    // Lưu ý: truckResult được tạo SAU KHI xử lý events để có trạng thái mới nhất
    truckStates.forEach((truck) => {
      if (truck.available) {
        const needyTank = tankStates.find(
          (t) => t.needsWater && !t.truckAssigned
        )

        if (needyTank) {
          // Assign truck -> tank
          truck.available = false
          truck.currentWater = truck.capacity
          truck.targetTank = needyTank.id
          needyTank.truckAssigned = true

          // Ghi lại kế hoạch: giờ xuất phát và giờ đến (tạm tính), giờ về sẽ cập nhật khi xe đến
          const departTime = currentTime
          const arriveTime = currentTime + needyTank.travelTime
          truckPlans[truck.id].push({
            truckId: truck.id,
            tankId: needyTank.id,
            departTime,
            arrivalTime: arriveTime,
            returnTime: null,
          })

          // Lên lịch event xe tới bồn sau travelTime
          scheduleEvent(currentTime + needyTank.travelTime, 'truck-arrive', {
            truckId: truck.id,
            tankId: needyTank.id,
          })

          logUiEvent(currentTime, 'dispatch', {
            message: `Xe #${truck.id} được điều động đến Bồn #${needyTank.id} (đến sau ${needyTank.travelTime}h)`,
            truckId: truck.id,
            tankId: needyTank.id,
          })
        }
      }

      // Tạo truckResult SAU KHI xử lý events và điều động để có trạng thái mới nhất
      const truckResult = {
        id: truck.id,
        available: truck.available,
        currentWater: truck.currentWater,
        targetTank: truck.targetTank,
        status: truck.available ? 'Sẵn sàng' : 'Đang vận chuyển',
      }

      stepResult.trucks.push(truckResult)
    })

    // 4. Gom các UI events thuộc bước thời gian hiện tại
    stepResult.events = uiEvents.filter(
      (e) => e.time >= currentTime && e.time < currentTime + timeStep
    )

    results.push(stepResult)
  }

  return {
    steps: results,
    summary: {
      totalSteps: steps,
      totalTime: simulationHours,
      tanks: tankStates.length,
      trucks: truckStates.length,
      totalEvents: uiEvents.length,
    },
    plan: truckPlans,
  }
}

