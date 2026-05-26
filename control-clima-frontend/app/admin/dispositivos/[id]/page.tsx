'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { DeviceCard } from '@/components/dashboard'
import { RulesList } from '@/components/rules'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchDeviceById } from '@/lib/api/devices-service'
import { useToggleActuador } from '@/hooks/use-actuadores'
import type { Dispositivo } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'

export default function DeviceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)
    const [timeRange, setTimeRange] = useState<TimeRange>('24H')

    // Convert timeRange to hours
    const horasMap: Record<TimeRange, number> = {
        '1H': 1,
        '12H': 12,
        '24H': 24
    }
    const horas = horasMap[timeRange]

    const { data: device, isLoading, isError, error, refetch } = useQuery<Dispositivo>({
        queryKey: ['device', id, horas],
        queryFn: () => fetchDeviceById(id, horas),
        enabled: !!id,
        refetchInterval: 5000, // Refrescar cada 5 segundos
    })

    const toggleActuadorMutation = useToggleActuador()

    const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
        const accion = currentState ? 'apagar' : 'encender'
        toggleActuadorMutation.mutate({ actuadorId, accion }, {
            onError: (error) => {
                console.error('Error toggling actuador:', error)
                const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
                alert(errorMessage)
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <LoadingSpinner size="lg" text="Cargando dispositivo..." />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex-1 p-8 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <ErrorMessage
                        message={error instanceof Error ? error.message : 'Error al cargar el dispositivo'}
                    />
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    if (!device) return null

    return (
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50 px-4 py-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-200 text-slate-700 font-medium group"
                >
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="group-hover:text-cyan-700 transition-colors">Volver</span>
                </button>

                <h1 className="text-2xl font-bold text-slate-800 mb-6">Detalle del Dispositivo</h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 lg:order-1">
                        <DeviceCard
                            device={device}
                            onToggleActuador={handleToggleActuador}
                            onRefresh={refetch}
                            isRefreshing={isLoading}
                            showDetailLink={false}
                            timeRange={timeRange}
                            onTimeRangeChange={setTimeRange}
                        />
                    </div>

                    <div className="lg:col-span-2 lg:order-2">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Automatización</h2>
                            <p className="text-sm text-slate-600">Reglas de este dispositivo</p>
                        </div>
                        <RulesList
                            deviceId={device.id}
                            sensors={device.gpios?.flatMap(gpio => gpio.sensores || []) || []}
                            actuators={device.gpios?.flatMap(gpio => gpio.actuadores || []) || []}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
