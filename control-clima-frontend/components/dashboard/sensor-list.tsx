import type { Sensor } from '@/lib/types/api'
import { Card, CardHeader, CardContent, LoadingSpinner, ErrorMessage, EmptyState } from '@/components/ui'
import { SensorCard } from './sensor-card'

interface SensorListProps {
    sensores?: Sensor[]
    isLoading?: boolean
    isError?: boolean
    error?: Error | unknown
    onRetry?: () => void
    onSensorClick?: (sensor: Sensor) => void
    className?: string
}

export function SensorList({
    sensores,
    isLoading = false,
    isError = false,
    error,
    onRetry,
    onSensorClick,
    className = ''
}: SensorListProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Sensores</h2>
            </CardHeader>

            <CardContent>
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" text="Cargando sensores..." />
                    </div>
                )}

                {isError && (
                    <ErrorMessage
                        title="Error al cargar sensores"
                        error={error}
                        onRetry={onRetry}
                    />
                )}

                {!isLoading && !isError && sensores && sensores.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sensores.map((sensor) => (
                            <SensorCard
                                key={sensor.id}
                                sensor={sensor}
                                onClick={onSensorClick ? () => onSensorClick(sensor) : undefined}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && !isError && (!sensores || sensores.length === 0) && (
                    <EmptyState
                        icon="📡"
                        title="No hay sensores configurados"
                        description="Crea sensores desde el API: POST /sensores"
                    />
                )}
            </CardContent>
        </Card>
    )
}
