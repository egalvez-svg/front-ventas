'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchActiveCultivos, fetchAllCultivos, deleteCultivo } from '@/lib/api/cultivos-service'
import { Cultivo } from '@/lib/types/api'
import { CropCard } from '@/components/cultivos/crop-card'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { Plus, Search, Filter, History, Sprout, Activity, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { CreateCultivoForm } from '@/components/forms/create-cultivo-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/providers/toast-provider'

export default function CultivosPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null)
    const [showActiveOnly, setShowActiveOnly] = useState(true)

    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: cultivos, isLoading, error } = useQuery({
        queryKey: ['cultivos', showActiveOnly],
        queryFn: () => showActiveOnly ? fetchActiveCultivos() : fetchAllCultivos()
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCultivo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivos'] })
            showToast('Ciclo de cultivo eliminado con éxito', 'success')
        },
        onError: () => {
            showToast('Error al eliminar el ciclo de cultivo', 'error')
        }
    })

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('¿Estás seguro de eliminar este ciclo de cultivo? Se eliminarán todas las plantas y registros asociados.')) {
            deleteMutation.mutate(id)
        }
    }

    const handleEdit = (cultivo: Cultivo, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedCultivo(cultivo)
        setIsEditModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <DashboardHeader title="Control de Cultivos" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ciclos de Cultivo</h1>
                        <p className="text-slate-500 mt-1">Supervisa y gestiona cada etapa de tus plantas.</p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-600/20 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Nuevo Cultivo
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar cultivo o variedad..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                        <button
                            onClick={() => setShowActiveOnly(true)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                showActiveOnly ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Activity className="w-4 h-4" />
                            Activos
                        </button>
                        <button
                            onClick={() => setShowActiveOnly(false)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                !showActiveOnly ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <History className="w-4 h-4" />
                            Todos
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" text="Cargando tus cultivos..." />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                            <Plus className="w-10 h-10 rotate-45" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-900 mb-2">Error de conexión</h3>
                        <p className="text-red-700">Ocurrió un problema al sincronizar tus cultivos. Por favor, verifica tu conexión.</p>
                        <button className="mt-8 px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                            Reintentar ahora
                        </button>
                    </div>
                ) : cultivos && cultivos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cultivos.map((cultivo) => (
                            <CropCard
                                key={cultivo.id}
                                cultivo={cultivo}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[2.5rem] p-20 text-center max-w-3xl mx-auto">
                        <div className="w-24 h-24 bg-sky-50 text-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-6 border border-sky-100">
                            <Sprout className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Tu jardín está vacío</h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                            No tienes {showActiveOnly ? 'cultivos activos' : 'ningún historial de cultivo'} en este momento.
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-10 px-10 py-4 bg-sky-600 text-white font-bold rounded-2xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-600/30 hover:scale-105 active:scale-95"
                        >
                            Empezar mi primer cultivo
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Iniciar Nuevo Ciclo de Cultivo"
                maxWidth="xl"
            >
                <CreateCultivoForm
                    onSuccess={() => setIsAddModalOpen(false)}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setSelectedCultivo(null)
                }}
                title="Editar Ciclo de Cultivo"
                maxWidth="xl"
            >
                {selectedCultivo && (
                    <CreateCultivoForm
                        initialData={selectedCultivo}
                        onSuccess={() => {
                            setIsEditModalOpen(false)
                            setSelectedCultivo(null)
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false)
                            setSelectedCultivo(null)
                        }}
                    />
                )}
            </Modal>
        </div>
    )
}
