'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/lib/auth/auth-context'
import { DashboardHeader, DeviceCard, WeatherWidget } from '@/components/dashboard'
import { LoadingSpinner } from '@/components/ui'
import { fetchUserDevices } from '@/lib/api/devices-service'
import { useToggleActuador } from '@/hooks/use-actuadores'
import type { Dispositivo } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deviceTimeRanges, setDeviceTimeRanges] = useState<Record<number, TimeRange>>({})

  const { data: devices, isLoading: devicesLoading, refetch } = useQuery<Dispositivo[]>({
    queryKey: ['userDevices', user?.id],
    queryFn: () => fetchUserDevices(user!.id),
    enabled: !!user?.id,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const toggleActuadorMutation = useToggleActuador()

  const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
    const accion = currentState ? 'apagar' : 'encender'
    console.log('Sending action:', { actuadorId, currentState, accion })

    toggleActuadorMutation.mutate({ actuadorId, accion }, {
      onError: (error) => {
        console.error('Error toggling actuador:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
        alert(errorMessage)
      }
    })
  }

  const handleTimeRangeChange = (deviceId: number, range: TimeRange) => {
    setDeviceTimeRanges(prev => ({
      ...prev,
      [deviceId]: range
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader title="Dispositivos" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-slate-800 mb-2">
            Mis Dispositivos
          </h2>
          <p className="text-slate-600">
            {user?.nombre} - Gestión remota de hardware de clima
          </p>
        </div>

        <div className="mb-8">
          <WeatherWidget />
        </div>

        {devicesLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Cargando dispositivos..." />
          </div>
        ) : devices && devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggleActuador={handleToggleActuador}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                detailLinkPath={`/dispositivos/${device.id}`}
                timeRange={deviceTimeRanges[device.id] || '24H'}
                onTimeRangeChange={(range) => handleTimeRangeChange(device.id, range)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No tienes dispositivos
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Contacta a tu administrador para asignar dispositivos de control de clima a tu cuenta.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
