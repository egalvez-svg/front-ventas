'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchVariedades, deleteVariedad } from '@/lib/api/catalogos-service'
import { Variedad } from '@/lib/types/api'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { Plus, Dna, Search, Bookmark, Tag, Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { CreateVariedadForm } from '@/components/forms/create-variedad-form'
import { useToast } from '@/providers/toast-provider'

export default function VariedadesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedVariedad, setSelectedVariedad] = useState<Variedad | null>(null)
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: variedades, isLoading } = useQuery({
        queryKey: ['variedades'],
        queryFn: fetchVariedades
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteVariedad(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['variedades'] })
            showToast('Variedad eliminada correctamente', 'success')
        },
        onError: () => {
            showToast('Error al eliminar la variedad. Asegúrate de que no esté en uso.', 'error')
        }
    })

    const handleEdit = (v: Variedad) => {
        setSelectedVariedad(v)
        setIsModalOpen(true)
    }

    const handleDelete = (v: Variedad) => {
        if (window.confirm(`¿Estás seguro de eliminar la variedad "${v.nombre}"?`)) {
            deleteMutation.mutate(v.id)
        }
    }

    const handleAdd = () => {
        setSelectedVariedad(null)
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <DashboardHeader title="Catálogo de Variedades" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Variedades Genéticas</h1>
                        <p className="text-slate-500 mt-1">Biblioteca de semillas y clones disponibles para tus cultivos.</p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-slate-900/10 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Nueva Variedad
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-8 max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, banco o tipo..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" text="Explorando genética..." />
                    </div>
                ) : variedades && variedades.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {variedades.map((v) => (
                            <div key={v.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 hover:shadow-xl hover:border-sky-200 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <Dna className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(v)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{v.nombre}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                                    <Bookmark className="w-3 h-3" />
                                    {v.banco || 'Banco General'}
                                </div>

                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                    {v.descripcion || 'Sin descripción genética detallada.'}
                                </p>

                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" />
                                        {v.tipo || 'Híbrida'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[3rem] p-20 text-center max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-100">
                            <Dna className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3">Tu catálogo está vacío</h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                            Registra las variedades que tienes disponibles para empezar a crear ciclos de cultivo.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-10 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                        >
                            Registrar primera variedad
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedVariedad(null)
                }}
                title={selectedVariedad ? "Editar Variedad" : "Registrar Nueva Variedad"}
            >
                <CreateVariedadForm
                    onSuccess={() => {
                        setIsModalOpen(false)
                        setSelectedVariedad(null)
                    }}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedVariedad(null)
                    }}
                    initialData={selectedVariedad}
                />
            </Modal>
        </div>
    )
}
