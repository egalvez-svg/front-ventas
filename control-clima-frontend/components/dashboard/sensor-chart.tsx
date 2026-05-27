'use client'

import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatTimestamp, type SensorType, type TimeRange } from '@/lib/utils/mock-sensor-data'
import { fetchHistoricalData } from '@/lib/api/devices-service'

interface SensorChartProps {
    sensorType: SensorType
    sensorId: number
    deviceId: number
    currentValue: number
    unit: string
    label: string
    timeRange: TimeRange
}

export function SensorChart({ sensorType, sensorId, deviceId, currentValue, unit, label, timeRange }: SensorChartProps) {
    // Convert timeRange to hours
    const horasMap: Record<TimeRange, number> = {
        '1H': 1,
        '12H': 12,
        '24H': 24
    }
    const horas = horasMap[timeRange]

    // Fetch historical data from backend
    const { data: historicalData, isLoading } = useQuery({
        queryKey: ['historicalData', deviceId, sensorId, horas],
        queryFn: () => fetchHistoricalData(deviceId, horas),
        refetchInterval: 60000, // Refetch every minute
    })

    // Find data for this specific sensor
    const sensorData = historicalData?.sensores.find(s => s.sensorId === sensorId)

    // Format data for Recharts
    const chartData = sensorData?.datos.map(reading => ({
        time: formatTimestamp(reading.timestamp, timeRange),
        value: reading.valor,
        fullTimestamp: reading.timestamp
    })) || []

    const getColors = () => {
        switch (sensorType) {
            case 'temperatura':
                return {
                    stroke: '#d97706',
                    fill: 'url(#colorTemp)',
                    gradient1: '#fbbf24',
                    gradient2: '#92400e'
                }
            case 'humedad':
                return {
                    stroke: '#0891b2',
                    fill: 'url(#colorHum)',
                    gradient1: '#22d3ee',
                    gradient2: '#164e63'
                }
            case 'vpd':
                return {
                    stroke: '#7c3aed',
                    fill: 'url(#colorVpd)',
                    gradient1: '#a78bfa',
                    gradient2: '#4c1d95'
                }
            case 'co2':
                return {
                    stroke: '#059669',
                    fill: 'url(#colorCo2)',
                    gradient1: '#34d399',
                    gradient2: '#064e3b'
                }
        }
    }

    const colors = getColors()

    if (isLoading) {
        return (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-lg ${sensorType === 'temperatura' ? 'bg-amber-100' :
                            sensorType === 'humedad' ? 'bg-cyan-100' :
                                sensorType === 'vpd' ? 'bg-violet-100' :
                                    'bg-emerald-100'
                            }`}>
                            {sensorType === 'temperatura' && (
                                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            )}
                            {sensorType === 'humedad' && (
                                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                            )}
                            {sensorType === 'vpd' && (
                                <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                            {sensorType === 'co2' && (
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-700 capitalize">{sensorType}</h4>
                            <p className="text-[10px] text-slate-500">{label}</p>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-800">
                            {currentValue}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{unit}</span>
                    </div>
                </div>
            </div>

            <div className="h-20 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.gradient2} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.gradient2} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorVpd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.gradient2} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.gradient2} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 9, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />
                        <YAxis
                            tick={{ fontSize: 9, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            width={35}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: '#f1f5f9',
                                padding: '6px 10px'
                            }}
                            labelStyle={{ color: '#cbd5e1', fontSize: '10px' }}
                            formatter={(value: number) => [`${value} ${unit}`, label]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colors.stroke}
                            strokeWidth={2}
                            fill={colors.fill}
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
