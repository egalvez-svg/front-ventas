'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { DeviceCard, DashboardHeader } from '@/components/dashboard'
import { RulesList } from '@/components/rules'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchDeviceById } from '@/lib/api/devices-service'
import { fetchCultivosBySala } from '@/lib/api/cultivos-service'
import { useToggleActuador } from '@/hooks/use-actuadores'
import type { Dispositivo, Cultivo } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'

export default function UserDeviceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isLoading: authLoading, isAuthenticated } = useAuthContext()
    const id = Number(params.id)
    const [timeRange, setTimeRange] = useState<TimeRange>('24H')

    // Convert timeRange to hours
    const horasMap: Record<TimeRange, number> = {
        '1H': 1,
        '12H': 12,
        '24H': 24
    }
    const horas = horasMap[timeRange]

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router])

    const { data: device, isLoading, isError, error, refetch } = useQuery<Dispositivo>({
        queryKey: ['device', id, horas],
        queryFn: () => fetchDeviceById(id, horas),
        enabled: !!id && !!user?.id,
        refetchInterval: 5000,
    })

    const { data: cultivos } = useQuery({
        queryKey: ['cultivos', device?.sala?.id],
        queryFn: () => device?.sala?.id ? fetchCultivosBySala(device.sala.id) : Promise.resolve([]),
        enabled: !!device?.sala?.id
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

    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LoadingSpinner size="xl" text="Verificando autenticación..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8">
                <LoadingSpinner size="lg" text="Cargando dispositivo..." />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-white p-8">
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
        <div className="min-h-screen bg-white">
            <DashboardHeader title="Detalle del Dispositivo" />
            <div className="max-w-7xl mx-auto px-4 py-6">
                <button
                    onClick={() => router.back()}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-200 text-slate-700 font-medium group"
                >
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="group-hover:text-cyan-700 transition-colors"></span>
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

                    <div className="lg:col-span-2 lg:order-2 space-y-6">
                        {/* Sala Info */}
                        {device.sala && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Sala Asignada
                                </h2>

                                <div className="space-y-4">
                                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                                        <p className="text-sky-900 font-bold mb-1">{device.sala.nombre}</p>
                                        <p className="text-xs text-sky-600 font-medium line-clamp-2">
                                            {device.sala.descripcion || 'Sin descripción adicional'}
                                        </p>
                                    </div>

                                    {device.sala.camas && device.sala.camas.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Camas y Cultivos</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {device.sala.camas.map(cama => {
                                                    const cultivoActivo = cultivos?.find((c: Cultivo) => c.camaId === cama.id && c.estado !== 'finalizado' && c.estado !== 'cancelado')

                                                    return (
                                                        <div key={cama.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-bold text-slate-700">{cama.nombre}</span>
                                                                <span className="text-[10px] font-bold text-slate-400">{cama.filas}x{cama.columnas}</span>
                                                            </div>
                                                            {cultivoActivo ? (
                                                                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black uppercase">{cultivoActivo.nombre}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg border border-slate-200">
                                                                    <span className="text-[10px] font-bold uppercase">Sin cultivo activo</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => router.push(`/salas/${device.sala?.id}`)}
                                        className="w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                    >
                                        Ver Panel de Sala
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
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
        </div>
    )
}
