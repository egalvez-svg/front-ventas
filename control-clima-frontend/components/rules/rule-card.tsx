'use client'

import type { Regla } from '@/lib/types/api'

interface RuleCardProps {
    rule: Regla
    onToggle: (id: number) => void
    onEdit: (rule: Regla) => void
    onDelete: (id: number) => void
}

const DIAS_SEMANA_LABELS: Record<number, string> = {
    0: 'Dom',
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb',
}

export function RuleCard({ rule, onToggle, onEdit, onDelete }: RuleCardProps) {
    const getRuleDescription = () => {
        if (rule.tipo === 'sensor') {
            const sensorName = rule.sensor?.tipo || 'Sensor'
            const comparadorSymbol = rule.comparador || '>'
            const valor = rule.valor_trigger || 0
            const accion = rule.accion || 'encender'

            return `${sensorName} ${comparadorSymbol} ${valor} → ${accion}`
        } else {
            const inicio = rule.hora_inicio || '00:00'
            const fin = rule.hora_fin || '23:59'
            const dias = rule.diasSemana && rule.diasSemana.length > 0
                ? rule.diasSemana.map(d => DIAS_SEMANA_LABELS[d]).join(', ')
                : 'Todos los días'

            return `${inicio} - ${fin} (${dias})`
        }
    }

    return (
        <div className={`p-4 rounded-xl border-2 transition-all ${rule.habilitada
            ? 'border-cyan-200 bg-cyan-50'
            : 'border-slate-200 bg-slate-50 opacity-60'
            }`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{rule.nombre}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rule.tipo === 'sensor'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                            }`}>
                            {rule.tipo === 'sensor' ? 'Sensor' : 'Horario'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600">{getRuleDescription()}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        Actuador: {rule.actuador?.tipo || 'N/A'}
                        {rule.delay_segundos > 0 && ` • Delay: ${rule.delay_segundos}s`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggle(rule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${rule.habilitada
                            ? 'bg-cyan-600'
                            : 'bg-slate-300'
                            }`}
                        title={rule.habilitada ? 'Deshabilitar' : 'Habilitar'}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.habilitada ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>

                    <button
                        onClick={() => onEdit(rule)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>

                    <button
                        onClick={() => onDelete(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
