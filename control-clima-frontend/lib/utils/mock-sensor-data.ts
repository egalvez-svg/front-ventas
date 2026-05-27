// Mock data generator for sensor historical readings
// This will be replaced with real API calls when backend is ready

export interface SensorReading {
    timestamp: string
    value: number
}

export type SensorType = 'temperatura' | 'humedad' | 'vpd' | 'co2'
export type TimeRange = '1H' | '12H' | '24H'

/**
 * Generate mock historical data for sensors
 * @param sensorType - Type of sensor (temperatura, humedad, vpd, co2)
 * @param timeRange - Time range for data (1H, 12H, 24H)
 * @param currentValue - Current sensor value to base the data on
 * @returns Array of sensor readings with timestamps
 */
export function generateMockSensorData(
    sensorType: SensorType,
    timeRange: TimeRange,
    currentValue?: number
): SensorReading[] {
    const now = new Date()
    const readings: SensorReading[] = []

    // Determine number of data points and interval based on time range
    let dataPoints: number
    let intervalMinutes: number

    switch (timeRange) {
        case '1H':
            dataPoints = 60 // 1 point per minute
            intervalMinutes = 1
            break
        case '12H':
            dataPoints = 144 // 1 point per 5 minutes
            intervalMinutes = 5
            break
        case '24H':
            dataPoints = 288 // 1 point per 5 minutes
            intervalMinutes = 5
            break
    }

    // Base values and ranges for different sensor types
    const config = {
        temperatura: { base: currentValue || 23, variation: 3, min: 18, max: 28 },
        humedad: { base: currentValue || 60, variation: 8, min: 40, max: 75 },
        vpd: { base: currentValue || 1.2, variation: 0.3, min: 0.8, max: 1.8 },
        co2: { base: currentValue || 750, variation: 150, min: 400, max: 1200 }
    }[sensorType]

    // Generate data points with realistic variations
    for (let i = dataPoints - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000)

        // Create natural-looking variations using sine wave + random noise
        const timeProgress = (dataPoints - i) / dataPoints
        const sineWave = Math.sin(timeProgress * Math.PI * 2) * config.variation * 0.5
        const randomNoise = (Math.random() - 0.5) * config.variation * 0.5

        let value = config.base + sineWave + randomNoise

        // Clamp to min/max
        value = Math.max(config.min, Math.min(config.max, value))

        // Round based on sensor type
        if (sensorType === 'vpd') {
            value = Math.round(value * 100) / 100 // 2 decimal places
        } else if (sensorType === 'co2') {
            value = Math.round(value) // whole numbers for CO2
        } else {
            value = Math.round(value * 10) / 10 // 1 decimal place
        }

        readings.push({
            timestamp: timestamp.toISOString(),
            value
        })
    }

    return readings
}

/**
 * Format timestamp for display based on time range
 */
export function formatTimestamp(timestamp: string, timeRange: TimeRange): string {
    const date = new Date(timestamp)

    if (timeRange === '1H') {
        // Show only time for 1 hour range
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } else {
        // Show date and time for longer ranges
        return date.toLocaleString('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}
