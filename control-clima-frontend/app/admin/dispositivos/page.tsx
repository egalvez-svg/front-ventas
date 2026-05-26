'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DeviceForm } from '@/components/admin'
import { Button, LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchDispositivos, createDispositivo, updateDispositivo, deleteDispositivo } from '@/lib/api/devices-service'
import { fetchUsers } from '@/lib/api/users-service'
import type { Dispositivo, CreateDispositivoDto, UpdateDispositivoDto, User } from '@/lib/types/api'

export default function DispositivosPage() {
    const queryClient = useQueryClient()
    const [selectedDevice, setSelectedDevice] = useState<Dispositivo | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [mutationError, setMutationError] = useState<string | null>(null)

    // Fetch devices
    const { data: devices, isLoading, isError, error } = useQuery<Dispositivo[]>({
        queryKey: ['dispositivos'],
        queryFn: fetchDispositivos,
    })

    // Fetch users for dropdown
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createDispositivo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] })
            setIsCreateModalOpen(false)
            setMutationError(null)
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear dispositivo'
            setMutationError(errorMessage)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDispositivoDto }) => updateDispositivo(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] })
            setIsEditModalOpen(false)
            setSelectedDevice(null)
            setMutationError(null)
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar dispositivo'
            setMutationError(errorMessage)
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteDispositivo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] })
            setIsDeleteModalOpen(false)
            setSelectedDevice(null)
            setMutationError(null)
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar dispositivo'
            setMutationError(errorMessage)
        },
    })

    const handleEdit = (device: Dispositivo) => {
        setSelectedDevice(device)
        setIsEditModalOpen(true)
        setMutationError(null)
    }

    const handleDelete = (device: Dispositivo) => {
        setSelectedDevice(device)
        setIsDeleteModalOpen(true)
        setMutationError(null)
    }

    const confirmDelete = () => {
        if (selectedDevice) {
            deleteMutation.mutate(selectedDevice.id)
        }
    }

    const handleCreateSubmit = (data: CreateDispositivoDto | UpdateDispositivoDto) => {
        createMutation.mutate(data as CreateDispositivoDto)
    }

    const handleEditSubmit = (data: CreateDispositivoDto | UpdateDispositivoDto) => {
        if (selectedDevice) {
            updateMutation.mutate({ id: selectedDevice.id, data: data as UpdateDispositivoDto })
        }
    }

    return (
        <>
            <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-800">Dispositivos del Sistema</h2>
                            <p className="text-slate-600 mt-1.5">Gestiona todos los dispositivos de control de clima</p>
                        </div>
                        <Button
                            onClick={() => { setIsCreateModalOpen(true); setMutationError(null); }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Dispositivo
                        </Button>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" text="Cargando dispositivos..." />
                        </div>
                    )}

                    {isError && (
                        <ErrorMessage
                            message={error instanceof Error ? error.message : 'Error al cargar dispositivos'}
                            onRetry={() => queryClient.invalidateQueries({ queryKey: ['dispositivos'] })}
                        />
                    )}

                    {!isLoading && !isError && devices && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Ubicación
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            IP
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {devices.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-500">No hay dispositivos registrados</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        devices.map((device) => (
                                            <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-800">{device.nombre}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600">{device.ubicacion || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600 font-mono">{device.ip || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600 truncate max-w-xs">
                                                        {device.descripcion || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(device)}
                                                        className="text-cyan-600 hover:text-cyan-800 mr-4 transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(device)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Dispositivo</h3>

                        {/* Error Message */}
                        {mutationError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{mutationError}</p>
                            </div>
                        )}

                        <DeviceForm
                            users={users}
                            onSubmit={handleCreateSubmit}
                            onCancel={() => { setIsCreateModalOpen(false); setMutationError(null); }}
                            isLoading={createMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Dispositivo</h3>

                        {/* Error Message */}
                        {mutationError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{mutationError}</p>
                            </div>
                        )}

                        <DeviceForm
                            initialData={selectedDevice}
                            users={users}
                            onSubmit={handleEditSubmit}
                            onCancel={() => {
                                setIsEditModalOpen(false)
                                setSelectedDevice(null)
                                setMutationError(null)
                            }}
                            isLoading={updateMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>

                        {/* Error Message */}
                        {mutationError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{mutationError}</p>
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar el dispositivo <strong>{selectedDevice.nombre}</strong>?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsDeleteModalOpen(false)
                                    setSelectedDevice(null)
                                    setMutationError(null)
                                }}
                                disabled={deleteMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
