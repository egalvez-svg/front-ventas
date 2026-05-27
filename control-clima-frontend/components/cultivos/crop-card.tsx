'use client'

import { Cultivo, CropStatus } from '@/lib/types/api'
import { Sprout, Calendar, MapPin, ChevronRight, Activity, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CropCardProps {
    cultivo: Cultivo
    onEdit?: (cultivo: Cultivo, e: React.MouseEvent) => void
    onDelete?: (id: number, e: React.MouseEvent) => void
}

const statusConfig: Record<string, { color: string, bg: string, label: string }> = {
    'activo': { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Activo' },
    'esqueje': { color: 'text-teal-600', bg: 'bg-teal-50', label: 'Esqueje' },
    'vegetativo': { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Vegetativo' },
    'floracion': { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Floración' },
    'cosecha': { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Cosecha' },
    'finalizado': { color: 'text-slate-600', bg: 'bg-slate-50', label: 'Finalizado' },
    'cancelado': { color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelado' },
}

export function CropCard({ cultivo, onEdit, onDelete }: CropCardProps) {
    const status = statusConfig[cultivo.estado.toLowerCase()] || statusConfig['activo']
    const plantCount = cultivo.plantas?.length || 0

    return (
        <Link
            href={`/cultivos/${cultivo.id}`}
            className="group block bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                        <Sprout className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button
                                onClick={(e) => onEdit(cultivo, e)}
                                className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Editar Cultivo"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => onDelete(cultivo.id, e)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Eliminar Cultivo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm",
                            status.bg,
                            status.color
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.color.replace('text', 'bg'))} />
                            {status.label}
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors">
                    {cultivo.nombre}
                </h3>

                <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{cultivo.sala?.nombre || 'Sin sala asignada'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {cultivo.variedades && cultivo.variedades.length > 1 ? 'Variedades' : 'Variedad'}
                        </span>
                        <span
                            className="text-sm font-semibold text-slate-700 truncate"
                            title={
                                cultivo.variedades && cultivo.variedades.length > 0
                                    ? cultivo.variedades.map(v => v.nombre).join(', ')
                                    : cultivo.variedad?.nombre || 'N/A'
                            }
                        >
                            {cultivo.variedades && cultivo.variedades.length > 1 ? (
                                `${cultivo.variedades.length} Genéticas`
                            ) : cultivo.variedades && cultivo.variedades.length === 1 ? (
                                cultivo.variedades[0].nombre
                            ) : cultivo.variedad ? (
                                cultivo.variedad.nombre
                            ) : (
                                'N/A'
                            )}
                        </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plantas</span>
                        <span className="text-sm font-semibold text-slate-700">{plantCount} Unidades</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(cultivo.fecha_inicio).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                        Ver detalle
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
