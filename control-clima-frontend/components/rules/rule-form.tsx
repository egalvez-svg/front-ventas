'use client'

import { useState } from 'react'
import type { Regla, Sensor, Actuador } from '@/lib/types/api'

interface RuleFormProps {
    deviceId: number
    sensors: Sensor[]
    actuators: Actuador[]
    onSubmit: (data: Partial<Regla>) => void
    onCancel: () => void
    initialData?: Regla
}

const DIAS_SEMANA = [
    { value: 0, label: 'D' },
    { value: 1, label: 'L' },
    { value: 2, label: 'M' },
    { value: 3, label: 'X' },
    { value: 4, label: 'J' },
    { value: 5, label: 'V' },
    { value: 6, label: 'S' },
]

export function RuleForm({ deviceId, sensors, actuators, onSubmit, onCancel, initialData }: RuleFormProps) {
    const [tipo, setTipo] = useState<'sensor' | 'horario'>(initialData?.tipo || 'sensor')
    const [nombre, setNombre] = useState(initialData?.nombre || '')
    const [actuadorId, setActuadorId] = useState(initialData?.actuadorId || '')

    // Campos para reglas de sensor
    const [sensorId, setSensorId] = useState(initialData?.sensorId || '')
    const [comparador, setComparador] = useState<'>' | '<' | '>=' | '<=' | '='>(initialData?.comparador || '>')
    const [valorTrigger, setValorTrigger] = useState(initialData?.valor_trigger?.toString() || '')
    const [accion, setAccion] = useState<'encender' | 'apagar' | 'toggle'>(initialData?.accion || 'encender')
    const [delay_segundos, setdelay_segundos] = useState(initialData?.delay_segundos?.toString() || '0')

    // Campos para reglas de horario
    const [hora_inicio, sethora_inicio] = useState(initialData?.hora_inicio || '')
    const [hora_fin, sethora_fin] = useState(initialData?.hora_fin || '')
    const [diasSemana, setDiasSemana] = useState<number[]>(initialData?.diasSemana || [])
    const [accion_inicio, setaccion_inicio] = useState<'encender' | 'apagar'>(initialData?.accion_inicio || 'encender')
    const [accion_fin, setaccion_fin] = useState<'encender' | 'apagar'>(initialData?.accion_fin || 'apagar')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const baseData = {
            nombre,
            tipo,
            dispositivoId: deviceId,
            actuadorId: Number(actuadorId),
            habilitada: true,
        }

        if (tipo === 'sensor') {
            onSubmit({
                ...baseData,
                sensorId: Number(sensorId),
                comparador,
                valor_trigger: Number(valorTrigger),
                accion,
                delay_segundos: Number(delay_segundos),
            })
        } else {
            onSubmit({
                ...baseData,
                hora_inicio,
                hora_fin,
                diasSemana: diasSemana.length > 0 ? diasSemana : undefined,
                accion_inicio,
                accion_fin,
                delay_segundos: 0,
            })
        }
    }

    const toggleDia = (dia: number) => {
        setDiasSemana(prev =>
            prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia].sort()
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de la Regla
                </label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                    placeholder="Ej: Encender ventilador cuando hace calor"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Regla
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setTipo('sensor')}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${tipo === 'sensor'
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                    >
                        Basada en Sensor
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipo('horario')}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${tipo === 'horario'
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                    >
                        Basada en Horario
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Actuador
                </label>
                <select
                    value={actuadorId}
                    onChange={(e) => setActuadorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                >
                    <option value="">Seleccionar actuador</option>
                    {actuators.map((actuador) => (
                        <option key={actuador.id} value={actuador.id}>
                            {actuador.tipo}
                        </option>
                    ))}
                </select>
            </div>

            {tipo === 'sensor' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Sensor
                        </label>
                        <select
                            value={sensorId}
                            onChange={(e) => setSensorId(e.target.value)}
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        >
                            <option value="">Seleccionar sensor</option>
                            {sensors.map((sensor) => (
                                <option key={sensor.id} value={sensor.id}>
                                    {sensor.tipo} ({sensor.unidad})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Comparador
                            </label>
                            <select
                                value={comparador}
                                onChange={(e) => setComparador(e.target.value as any)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option value=">">Mayor que (&gt;)</option>
                                <option value="<">Menor que (&lt;)</option>
                                <option value=">=">Mayor o igual (≥)</option>
                                <option value="<=">Menor o igual (≤)</option>
                                <option value="=">Igual (=)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Valor
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={valorTrigger}
                                onChange={(e) => setValorTrigger(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                required
                                placeholder="25"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Acción
                            </label>
                            <select
                                value={accion}
                                onChange={(e) => setAccion(e.target.value as any)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option value="encender">Encender</option>
                                <option value="apagar">Apagar</option>
                                <option value="toggle">Alternar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Delay (segundos)
                            </label>
                            <input
                                type="number"
                                value={delay_segundos}
                                onChange={(e) => setdelay_segundos(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Hora Inicio
                            </label>
                            <input
                                type="time"
                                value={hora_inicio}
                                onChange={(e) => sethora_inicio(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Acción Inicio
                            </label>
                            <select
                                value={accion_inicio}
                                onChange={(e) => setaccion_inicio(e.target.value as any)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option value="encender">Encender</option>
                                <option value="apagar">Apagar</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Hora Fin
                            </label>
                            <input
                                type="time"
                                value={hora_fin}
                                onChange={(e) => sethora_fin(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Acción Fin
                            </label>
                            <select
                                value={accion_fin}
                                onChange={(e) => setaccion_fin(e.target.value as any)}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option value="encender">Encender</option>
                                <option value="apagar">Apagar</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Días de la Semana
                        </label>
                        <p className="text-xs text-slate-500 mb-2">Si no marcas se toma todos los días</p>
                        <div className="grid grid-cols-7 gap-1">
                            {DIAS_SEMANA.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleDia(value)}
                                    className={`aspect-square flex items-center justify-center rounded-lg border-2 transition-all text-xs font-semibold ${diasSemana.includes(value)
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                        }`}
                                    title={['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][value]}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                >
                    {initialData ? 'Actualizar Regla' : 'Crear Regla'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
