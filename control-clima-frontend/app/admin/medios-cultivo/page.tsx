'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MedioCultivoForm } from '@/components/admin/medio-cultivo-form'
import { Button, LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchMediosCultivo, createMedioCultivo, updateMedioCultivo, deleteMedioCultivo } from '@/lib/api/medio-cultivo-service'
import type { MedioCultivo, CreateMedioCultivoDto, UpdateMedioCultivoDto } from '@/lib/types/api'
import { Plus, Pencil, Trash2, Sprout } from 'lucide-react'

export default function MediosCultivoPage() {
    const queryClient = useQueryClient()
    const [selectedMedio, setSelectedMedio] = useState<MedioCultivo | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Fetch medios
    const { data: medios = [], isLoading, isError, error } = useQuery<MedioCultivo[]>({
        queryKey: ['medios-cultivo'],
        queryFn: fetchMediosCultivo,
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createMedioCultivo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medios-cultivo'] })
            setIsCreateModalOpen(false)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateMedioCultivoDto }) => updateMedioCultivo(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medios-cultivo'] })
            setIsEditModalOpen(false)
            setSelectedMedio(null)
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteMedioCultivo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medios-cultivo'] })
            setIsDeleteModalOpen(false)
            setSelectedMedio(null)
        },
    })

    const handleCreateSubmit = (data: CreateMedioCultivoDto | UpdateMedioCultivoDto) => {
        createMutation.mutate(data as CreateMedioCultivoDto)
    }

    const handleEditSubmit = (data: CreateMedioCultivoDto | UpdateMedioCultivoDto) => {
        if (selectedMedio) {
            updateMutation.mutate({ id: selectedMedio.id, data: data as UpdateMedioCultivoDto })
        }
    }

    const confirmDelete = () => {
        if (selectedMedio) {
            deleteMutation.mutate(selectedMedio.id)
        }
    }

    return (
        <>
            <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header Actions */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-800">Medios de Cultivo</h2>
                            <p className="text-slate-600 mt-1.5">
                                Define los diferentes medios y sustratos disponibles para tus cultivos
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Medio
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" text="Cargando medios de cultivo..." />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <ErrorMessage
                            title="Error al cargar medios de cultivo"
                            message={error instanceof Error ? error.message : 'Error desconocido'}
                            onRetry={() => queryClient.invalidateQueries({ queryKey: ['medios-cultivo'] })}
                        />
                    )}

                    {/* Medios Table */}
                    {!isLoading && !isError && medios && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Nombre
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
                                        {medios.map((medio) => (
                                            <tr key={medio.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600 font-bold">#{medio.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                            <Sprout className="w-4 h-4" />
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-800">
                                                            {medio.nombre}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600 line-clamp-1 max-w-md">
                                                        {medio.descripcion || 'Sin descripción'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMedio(medio)
                                                                setIsEditModalOpen(true)
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMedio(medio)
                                                                setIsDeleteModalOpen(true)
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {medios.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-300">
                                        <Sprout className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No hay medios de cultivo registrados</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Plus className="w-6 h-6" />
                            </span>
                            Nuevo Medio de Cultivo
                        </h3>
                        <MedioCultivoForm
                            onSubmit={handleCreateSubmit}
                            onCancel={() => setIsCreateModalOpen(false)}
                            isLoading={createMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedMedio && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Pencil className="w-6 h-6" />
                            </span>
                            Editar Medio: {selectedMedio.nombre}
                        </h3>
                        <MedioCultivoForm
                            medio={selectedMedio}
                            onSubmit={handleEditSubmit}
                            onCancel={() => {
                                setIsEditModalOpen(false)
                                setSelectedMedio(null)
                            }}
                            isLoading={updateMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedMedio && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Eliminar Medio</h3>
                            <p className="text-slate-600 mb-8">
                                ¿Estás seguro de que quieres eliminar <strong>{selectedMedio.nombre}</strong>?
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false)
                                        setSelectedMedio(null)
                                    }}
                                    className="flex-1"
                                    disabled={deleteMutation.isPending}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={confirmDelete}
                                    loading={deleteMutation.isPending}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
