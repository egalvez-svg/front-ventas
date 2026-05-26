import React from 'react'
import type { Actuador } from '@/lib/types/api'
import { Card, CardHeader, CardContent, LoadingSpinner, ErrorMessage, EmptyState } from '@/components/ui'
import { ActuadorCard } from './actuador-card'

interface ActuadorListProps {
    actuadores?: Actuador[]
    isLoading?: boolean
    isError?: boolean
    error?: Error | unknown
    onRetry?: () => void
    onControl?: (actuador: Actuador) => void
    className?: string
}

export function ActuadorList({
    actuadores,
    isLoading = false,
    isError = false,
    error,
    onRetry,
    onControl,
    className = ''
}: ActuadorListProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Actuadores</h2>
            </CardHeader>

            <CardContent>
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" text="Cargando actuadores..." />
                    </div>
                )}

                {isError && (
                    <ErrorMessage
                        title="Error al cargar actuadores"
                        error={error}
                        onRetry={onRetry}
                    />
                )}

                {!isLoading && !isError && actuadores && actuadores.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {actuadores.map((actuador) => (
                            <ActuadorCard
                                key={actuador.id}
                                actuador={actuador}
                                onControl={onControl}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && !isError && (!actuadores || actuadores.length === 0) && (
                    <EmptyState
                        icon="⚙️"
                        title="No hay actuadores configurados"
                        description="Crea actuadores desde el API: POST /actuadores"
                    />
                )}
            </CardContent>
        </Card>
    )
}
