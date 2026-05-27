'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Regla, Sensor, Actuador } from '@/lib/types/api'
import { fetchDeviceRules, createRule, updateRule, deleteRule, toggleRule } from '@/lib/api/rules-service'
import { RuleCard } from './rule-card'
import { RuleForm } from './rule-form'

interface RulesListProps {
    deviceId: number
    sensors: Sensor[]
    actuators: Actuador[]
}

export function RulesList({ deviceId, sensors, actuators }: RulesListProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingRule, setEditingRule] = useState<Regla | null>(null)
    const queryClient = useQueryClient()

    const { data: rules, isLoading } = useQuery<Regla[]>({
        queryKey: ['deviceRules', deviceId],
        queryFn: () => fetchDeviceRules(deviceId),
    })

    const createMutation = useMutation({
        mutationFn: createRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deviceRules', deviceId] })
            setShowForm(false)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Regla> }) => updateRule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deviceRules', deviceId] })
            setEditingRule(null)
            setShowForm(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deviceRules', deviceId] })
        },
    })

    const toggleMutation = useMutation({
        mutationFn: toggleRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deviceRules', deviceId] })
        },
    })

    const handleSubmit = (data: Partial<Regla>) => {
        if (editingRule) {
            updateMutation.mutate({ id: editingRule.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (rule: Regla) => {
        setEditingRule(rule)
        setShowForm(true)
    }

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingRule(null)
    }

    const sensorRules = rules?.filter(r => r.tipo === 'sensor') || []
    const scheduleRules = rules?.filter(r => r.tipo === 'horario') || []

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Reglas de Automatización</h3>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all text-sm font-medium"
                    >
                        + Nueva Regla
                    </button>
                )}
            </div>

            {showForm && (
                <div className="p-4 bg-white rounded-xl border-2 border-cyan-200">
                    <h4 className="text-md font-semibold text-slate-800 mb-4">
                        {editingRule ? 'Editar Regla' : 'Nueva Regla'}
                    </h4>
                    <RuleForm
                        deviceId={deviceId}
                        sensors={sensors}
                        actuators={actuators}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        initialData={editingRule || undefined}
                    />
                </div>
            )}

            {rules && rules.length > 0 ? (
                <div className="space-y-4">
                    {sensorRules.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-2">
                                Reglas Basadas en Sensores
                            </h4>
                            <div className="space-y-2">
                                {sensorRules.slice()
                                    .sort((a, b) => (a.actuador?.id ?? -1) - (b.actuador?.id ?? -1))
                                    .map((rule) => (
                                        <RuleCard
                                            key={rule.id}
                                            rule={rule}
                                            onToggle={toggleMutation.mutate}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {scheduleRules.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-2">
                                Reglas Basadas en Horarios
                            </h4>
                            <div className="space-y-2">
                                {scheduleRules.map((rule) => (
                                    <RuleCard
                                        key={rule.id}
                                        rule={rule}
                                        onToggle={toggleMutation.mutate}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                !showForm && (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <p className="text-slate-600 font-medium">No hay reglas configuradas</p>
                        <p className="text-slate-500 text-sm mt-1">Crea una regla para automatizar tus dispositivos</p>
                    </div>
                )
            )}
        </div>
    )
}
