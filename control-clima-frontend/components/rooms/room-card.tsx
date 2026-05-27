'use client'

import { Sala } from '@/lib/types/api'
import { Home, Layers, ArrowRight, Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface RoomCardProps {
    sala: Sala
    onDelete?: (id: number, e: React.MouseEvent) => void
}

export function RoomCard({ sala, onDelete }: RoomCardProps) {
    const camaCount = sala.camas?.length || 0

    return (
        <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                        <Home className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                        {onDelete && (
                            <button
                                onClick={(e) => onDelete(sala.id, e)}
                                className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="Eliminar Sala"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <Link
                            href={`/salas/${sala.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors">
                    {sala.nombre}
                </h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                    {sala.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center gap-4 py-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{camaCount} Superficies</span>
                    </div>
                </div>

                <Link
                    href={`/salas/${sala.id}`}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-sky-500 hover:text-white transition-all duration-300 group/btn"
                >
                    Ver Detalles
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
