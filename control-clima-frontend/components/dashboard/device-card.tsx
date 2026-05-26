'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { SensorChart } from './sensor-chart'
import type { Dispositivo } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'
import { fetchDeviceById } from '@/lib/api/devices-service'

interface DeviceCardProps {
    device: Dispositivo
    onToggleActuador: (actuadorId: number, currentState: boolean) => void
    onRefresh?: () => void
    isRefreshing?: boolean
    showDetailLink?: boolean
    detailLinkPath?: string
    timeRange?: TimeRange
    onTimeRangeChange?: (range: TimeRange) => void
}

export function DeviceCard({ device: initialDevice, onToggleActuador, onRefresh, isRefreshing: parentRefreshing, showDetailLink = true, detailLinkPath, timeRange = '24H', onTimeRangeChange }: DeviceCardProps) {
    // Use the device provided by parent - no need to fetch again
    const device = initialDevice
    const isRefreshing = parentRefreshing

    const sensores = device.gpios?.filter(gpio =>
        gpio.tipo === 'sensor' && gpio.sensores && gpio.sensores.length > 0
    ) || []
    const actuadores = device.gpios?.filter(gpio =>
        gpio.tipo === 'actuador' && gpio.actuadores && gpio.actuadores.length > 0
    ) || []

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 " title={device.nombre}>
                        {device.nombre}
                    </h3>
                    {device.sala ? (
                        <p className="text-[11px] text-sky-600 font-bold flex items-center gap-1 mt-1.5 bg-sky-50 w-fit px-2 py-0.5 rounded-lg border border-sky-100 max-w-full">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="truncate" title={device.sala.nombre}>{device.sala.nombre}</span>
                        </p>
                    ) : device.ubicacion && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5 max-w-full">
                            <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate" title={device.ubicacion}>{device.ubicacion}</span>
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {sensores.length > 0 && (
                        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                            {(['1H', '12H', '24H'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => onTimeRangeChange?.(range)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${timeRange === range
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => onRefresh?.()}
                        disabled={isRefreshing}
                        className={`p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-xl transition-all duration-200 ${isRefreshing ? 'cursor-not-allowed opacity-60' : ''
                            }`}
                        title={isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
                    >
                        <svg
                            className={`w-4.5 h-4.5 ${isRefreshing ? 'animate-spin' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    {showDetailLink && (
                        <Link
                            href={detailLinkPath || `/admin/dispositivos/${device.id}`}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
                            title="Ver detalle completo"
                        >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>

            {sensores.length > 0 && (
                <div className="mb-5">
                    <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3">Sensores</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {sensores.flatMap(gpio =>
                            (gpio.sensores || []).map(sensor => ({ ...sensor, gpioName: gpio.nombre }))
                        ).sort((a, b) => {
                            const typeA = a.tipo.toLowerCase()
                            const typeB = b.tipo.toLowerCase()

                            const priority: Record<string, number> = {
                                'temperatura': 1,
                                'humedad': 2,
                                'vpd': 3,
                                'co2': 4
                            }

                            const pA = Object.keys(priority).find(k => typeA.includes(k)) ? priority[Object.keys(priority).find(k => typeA.includes(k))!] : 99
                            const pB = Object.keys(priority).find(k => typeB.includes(k)) ? priority[Object.keys(priority).find(k => typeB.includes(k))!] : 99

                            return pA - pB
                        }).map(sensor => {
                            const sensorType = sensor.tipo.toLowerCase()
                            const supportsChart = sensorType.includes('temperatura') ||
                                sensorType.includes('humedad') ||
                                sensorType.includes('vpd') ||
                                sensorType.includes('co2')

                            let chartType: 'temperatura' | 'humedad' | 'vpd' | 'co2' | null = null
                            if (sensorType.includes('temperatura')) chartType = 'temperatura'
                            else if (sensorType.includes('humedad')) chartType = 'humedad'
                            else if (sensorType.includes('vpd')) chartType = 'vpd'
                            else if (sensorType.includes('co2')) chartType = 'co2'

                            const getCurrentValue = () => {
                                const lectura = (device as any).lecturasActuales?.find(
                                    (l: any) => l.sensorId === sensor.id
                                )
                                return lectura?.valor ?? 0
                            }

                            if (supportsChart && chartType) {
                                return (
                                    <div key={sensor.id} className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl">
                                        <SensorChart
                                            key={`${sensor.id}-${timeRange}`}
                                            sensorType={chartType}
                                            sensorId={sensor.id}
                                            deviceId={device.id}
                                            currentValue={getCurrentValue()}
                                            unit={sensor.unidad}
                                            label={sensor.gpioName || sensor.tipo}
                                            timeRange={timeRange}
                                        />
                                    </div>
                                )
                            }

                            return (
                                <div key={sensor.id} className="flex items-center justify-between p-3.5 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-700">
                                                {sensor.gpioName || `GPIO ${sensor.id}`}
                                            </span>
                                            <p className="text-xs text-slate-500">{sensor.tipo}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-cyan-600">{sensor.unidad}</p>
                                    </div>
                                </div>
                            )
                        })
                        }
                    </div>
                </div>
            )}

            {actuadores.length > 0 && (
                <div>
                    <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3">Actuadores</h4>
                    <div className="space-y-2">
                        {actuadores.flatMap(gpio =>
                            (gpio.actuadores || []).map(actuador => {
                                const currentState = actuador.estado ?? actuador.estadoDefault ?? false
                                return (
                                    <div key={actuador.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl shadow-sm transition-colors ${currentState ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-white'}`}>
                                                <svg className={`w-4 h-4 transition-colors ${currentState ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">
                                                {gpio.nombre || actuador.tipo}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onToggleActuador(actuador.id, currentState)
                                            }}
                                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentState
                                                ? 'bg-gradient-to-r from-orange-400 to-orange-500 focus:ring-orange-400'
                                                : 'bg-slate-200 focus:ring-slate-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${currentState ? 'translate-x-8' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {(!device.gpios || device.gpios.length === 0) && (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-sm text-slate-500">
                        No hay sensores ni actuadores configurados
                    </p>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        Actualizado: {(device as any).lecturasActuales?.length > 0
                            ? new Date(device.ultimaActualizacion)
                                .toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                            : 'Sin datos recientes'}
                    </span>
                </div>
            </div>
        </div>
    )
}
