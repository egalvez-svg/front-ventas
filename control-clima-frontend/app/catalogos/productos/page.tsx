'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProductos, deleteProducto } from '@/lib/api/catalogos-service'
import { Producto } from '@/lib/types/api'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { Plus, PackageSearch, Search, ShoppingBag, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { CreateProductoForm } from '@/components/forms/create-producto-form'
import { useToast } from '@/providers/toast-provider'

export default function ProductosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
    const [soloActivos, setSoloActivos] = useState(true)
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: productos, isLoading } = useQuery({
        queryKey: ['productos', soloActivos],
        queryFn: () => fetchProductos(soloActivos)
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteProducto(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] })
            showToast('Producto eliminado correctamente', 'success')
        },
        onError: () => {
            showToast('Error al eliminar el producto. Asegúrate de que no esté vinculado a un plan.', 'error')
        }
    })

    const handleEdit = (p: Producto) => {
        setSelectedProducto(p)
        setIsModalOpen(true)
    }

    const handleDelete = (p: Producto) => {
        if (window.confirm(`¿Estás seguro de eliminar el producto "${p.nombre}"?`)) {
            deleteMutation.mutate(p.id)
        }
    }

    const handleAdd = () => {
        setSelectedProducto(null)
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <DashboardHeader title="Insumos y Productos" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Catálogo de Productos</h1>
                        <p className="text-slate-500 mt-1">Gestiona los fertilizantes y suplementos nutricionales.</p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Nuevo Producto
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o marca..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                        <button
                            onClick={() => setSoloActivos(true)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                soloActivos ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Activos
                        </button>
                        <button
                            onClick={() => setSoloActivos(false)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                !soloActivos ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <XCircle className="w-4 h-4" />
                            Todos
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" text="Inventariando productos..." />
                    </div>
                ) : productos && productos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productos.map((p) => (
                            <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <ShoppingBag className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {!p.activo && (
                                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                                            Inactivo
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{p.nombre}</h3>
                                <span className="text-sm font-bold text-slate-400 mb-4">{p.fabricante || 'Genérico'}</span>

                                <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed">
                                    {p.descripcion || 'Sin descripción de aplicación.'}
                                </p>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[3rem] p-20 text-center max-w-4xl mx-auto shadow-sm">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 rotate-3">
                            <PackageSearch className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3">No hay productos suficientes</h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                            Registra los fertilizantes y productos que usas para poder armar tus planes de nutrición.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-10 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
                        >
                            Agregar primer producto
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedProducto(null)
                }}
                title={selectedProducto ? "Editar Producto" : "Agregar Nuevo Producto"}
            >
                <CreateProductoForm
                    onSuccess={() => {
                        setIsModalOpen(false)
                        setSelectedProducto(null)
                    }}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedProducto(null)
                    }}
                    initialData={selectedProducto}
                />
            </Modal>
        </div>
    )
}
