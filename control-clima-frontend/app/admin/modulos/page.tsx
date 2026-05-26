'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ModuloForm } from '@/components/admin/modulo-form'
import { Button, LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchModulos, createModulo, updateModulo, deleteModulo } from '@/lib/api/modulos-service'
import type { Modulo, CreateModuloDto, UpdateModuloDto } from '@/lib/types/api'
import { Plus, Pencil, Trash2, Box, Terminal, Shield, Zap, Circle } from 'lucide-react'

// Helper to map icon names to components based on name/slug
const getIconComponent = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('dispositivo')) return <Box className="w-5 h-5" />
    if (n.includes('analis') || n.includes('ia')) return <Zap className="w-5 h-5" />
    if (n.includes('segurid') || n.includes('permis')) return <Shield className="w-5 h-5" />
    return <Terminal className="w-5 h-5" />
}

export default function ModulosPage() {
    const queryClient = useQueryClient()
    const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Fetch modulos
    const { data: modulos = [], isLoading, isError, error } = useQuery<Modulo[]>({
        queryKey: ['modulos'],
        queryFn: fetchModulos,
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createModulo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modulos'] })
            setIsCreateModalOpen(false)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateModuloDto }) => updateModulo(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modulos'] })
            setIsEditModalOpen(false)
            setSelectedModulo(null)
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteModulo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modulos'] })
            setIsDeleteModalOpen(false)
            setSelectedModulo(null)
        },
    })

    const handleCreateSubmit = (data: CreateModuloDto | UpdateModuloDto) => {
        createMutation.mutate(data as CreateModuloDto)
    }

    const handleEditSubmit = (data: CreateModuloDto | UpdateModuloDto) => {
        if (selectedModulo) {
            updateMutation.mutate({ id: selectedModulo.id, data: data as UpdateModuloDto })
        }
    }

    const confirmDelete = () => {
        if (selectedModulo) {
            deleteMutation.mutate(selectedModulo.id)
        }
    }

    return (
        <>
            <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header Actions */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-800">Sistemas y Módulos</h2>
                            <p className="text-slate-600 mt-1.5">
                                Administra las extensiones y funcionalidades activas del sistema
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md rounded-2xl"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Módulo
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" text="Cargando módulos..." />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <ErrorMessage
                            title="Error al cargar módulos"
                            message={error instanceof Error ? error.message : 'Error desconocido'}
                            onRetry={() => queryClient.invalidateQueries({ queryKey: ['modulos'] })}
                        />
                    )}

                    {/* Modulos Table */}
                    {!isLoading && !isError && modulos && (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Módulo</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Slug</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                                            <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {modulos.map((modulo) => (
                                            <tr key={modulo.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${modulo.activo
                                                                ? 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white'
                                                                : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {getIconComponent(modulo.nombre)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">{modulo.nombre}</div>
                                                            <div className="text-xs text-slate-400 font-medium">ID: #{modulo.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-slate-500">
                                                    <code className="px-2 py-1 bg-slate-100 rounded-lg text-xs">{modulo.slug}</code>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm text-slate-600 line-clamp-1 max-w-md">
                                                        {modulo.descripcion || 'Sin descripción'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${modulo.activo
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-slate-100 text-slate-400'
                                                        }`}>
                                                        <Circle className={`w-2 h-2 fill-current ${modulo.activo ? 'animate-pulse' : ''}`} />
                                                        {modulo.activo ? 'Activo' : 'Inactivo'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedModulo(modulo)
                                                                setIsEditModalOpen(true)
                                                            }}
                                                            className="p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                                                            title="Editar Módulo"
                                                        >
                                                            <Pencil className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedModulo(modulo)
                                                                setIsDeleteModalOpen(true)
                                                            }}
                                                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Eliminar Módulo"
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {modulos.length === 0 && (
                                <div className="text-center py-24">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 text-slate-200 mb-6">
                                        <Box className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">No hay módulos registrados</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                        Comienza creando un nuevo módulo para extender las capacidades del sistema.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                                <Plus className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Nuevo Módulo</h3>
                                <p className="text-slate-500">Configura una nueva funcionalidad del sistema</p>
                            </div>
                        </div>
                        <ModuloForm
                            onSubmit={handleCreateSubmit}
                            onCancel={() => setIsCreateModalOpen(false)}
                            isLoading={createMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedModulo && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                                <Pencil className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Editar Módulo</h3>
                                <p className="text-slate-500">Personaliza el módulo <strong>{selectedModulo.nombre}</strong></p>
                            </div>
                        </div>
                        <ModuloForm
                            modulo={selectedModulo}
                            onSubmit={handleEditSubmit}
                            onCancel={() => {
                                setIsEditModalOpen(false)
                                setSelectedModulo(null)
                            }}
                            isLoading={updateMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedModulo && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-3">¿Eliminar Módulo?</h3>
                            <p className="text-slate-600 mb-10 leading-relaxed">
                                Estás a punto de eliminar <strong>{selectedModulo.nombre}</strong>.
                                Esta acción podría afectar a los usuarios que tengan este módulo asignado.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false)
                                        setSelectedModulo(null)
                                    }}
                                    className="flex-1 rounded-2xl py-6 font-bold"
                                    disabled={deleteMutation.isPending}
                                >
                                    No, Cancelar
                                </Button>
                                <Button
                                    onClick={confirmDelete}
                                    loading={deleteMutation.isPending}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-6 font-bold shadow-lg shadow-red-500/20"
                                >
                                    Sí, Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
