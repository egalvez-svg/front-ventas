'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { DeviceCard, WeatherWidget } from '@/components/dashboard'
import { fetchUsers } from '@/lib/api/users-service'
import { fetchUserDevices, ejecutarAccionActuador } from '@/lib/api/devices-service'
import type { User, Dispositivo } from '@/lib/types/api'

export default function AdminDashboardPage() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Fetch all users
    const { data: users, isLoading: usersLoading, isError: usersError, error: usersErrorObj } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    // Fetch selected user's devices
    const { data: devices, isLoading: devicesLoading, refetch } = useQuery<Dispositivo[]>({
        queryKey: ['userDevices', selectedUser?.id],
        queryFn: () => fetchUserDevices(selectedUser!.id),
        enabled: !!selectedUser?.id,
    })

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
        try {
            const accion = currentState ? 'apagar' : 'encender'
            await ejecutarAccionActuador(actuadorId, accion)
            await handleRefresh()
        } catch (error) {
            console.error('Error toggling actuador:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
            alert(errorMessage)
        }
    }

    // User Selection View
    if (!selectedUser) {
        return (
            <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-semibold text-slate-800">Dashboard de Administrador</h2>
                        <p className="text-slate-600 mt-1.5">
                            Selecciona un usuario para ver su dashboard
                        </p>
                    </div>

                    {usersLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" text="Cargando usuarios..." />
                        </div>
                    )}

                    {usersError && (
                        <ErrorMessage
                            message={usersErrorObj instanceof Error ? usersErrorObj.message : 'Error al cargar usuarios'}
                        />
                    )}

                    {!usersLoading && !usersError && users && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-cyan-200 transition-all duration-200 text-left group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate">
                                                {user.nombre} {user.apellido_paterno}
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-2 truncate">{user.email}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-slate-500">@{user.usuario}</span>
                                                {user.roles && user.roles.length > 0 && (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                                                            >
                                                                {role.nombre}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!usersLoading && !usersError && users && users.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-500">No hay usuarios registrados</p>
                        </div>
                    )}
                </div>
            </main>
        )
    }

    // User Dashboard View
    return (
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-200 text-slate-700 font-medium group"
                >
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="group-hover:text-cyan-700 transition-colors">Volver a selección de usuarios</span>
                </button>

                {/* User Info Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-800">
                                Dashboard de {selectedUser.nombre} {selectedUser.apellido_paterno}
                            </h2>
                            <p className="text-slate-600 mt-1">
                                {selectedUser.email} • @{selectedUser.usuario}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Weather Widget */}
                <div className="mb-8">
                    <WeatherWidget />
                </div>

                {/* Devices */}
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
                            Este usuario no tiene dispositivos
                        </h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Asigna dispositivos a este usuario desde la sección de dispositivos.
                        </p>
                    </div>
                )}
            </div>
        </main>
    )
}
