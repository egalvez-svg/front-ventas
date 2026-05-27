'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchUserSalas } from '@/lib/api/salas-service'
import { RoomCard } from '@/components/rooms/room-card'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { Plus, Home as HomeIcon } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/ui/modal'
import { CreateSalaForm } from '@/components/forms/create-sala-form'
import { deleteSala } from '@/lib/api/salas-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/providers/toast-provider'

export default function SalasPage() {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { data: salas, isLoading, error } = useQuery({
        queryKey: ['salas'],
        queryFn: fetchUserSalas
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteSala(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salas'] })
            showToast('Sala eliminada correctamente', 'success')
        },
        onError: () => {
            showToast('Error al eliminar la sala', 'error')
        }
    })

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('¿Estás seguro de eliminar esta sala? Esta acción no se puede deshacer.')) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title="Mis Salas" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Salas</h1>
                        <p className="text-slate-500 mt-1">Administra tus espacios de cultivo y sus configuraciones.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-600/20 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Nueva Sala
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" text="Cargando tus salas..." />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 rotate-45" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900">Error al cargar datos</h3>
                        <p className="text-red-600 mt-1">No pudimos obtener la información de las salas. Por favor intenta de nuevo.</p>
                    </div>
                ) : salas && salas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {salas.map((sala) => (
                            <RoomCard
                                key={sala.id}
                                sala={sala}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HomeIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No tienes salas registradas</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            Comienza creando tu primera sala para organizar tus camas y dispositivos de control.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-8 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-sky-500 hover:text-sky-600 transition-all"
                        >
                            Crear mi primera sala
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Crear Nueva Sala"
                maxWidth="5xl"
            >
                <CreateSalaForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    )
}
