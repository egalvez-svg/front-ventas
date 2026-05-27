import React from 'react'
import type { Sensor } from '@/lib/types/api'
import { Card, CardContent, Badge } from '@/components/ui'

interface SensorCardProps {
    sensor: Sensor
    className?: string
    onClick?: () => void
}

export function SensorCard({ sensor, className = '', onClick }: SensorCardProps) {
    return (
        <Card
            className={`hover:shadow-md transition-shadow ${className}`}
            onClick={onClick}
        >
            <CardContent>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                        {sensor.tipo}
                    </h3>
                    <Badge variant={sensor.activo ? 'success' : 'gray'}>
                        {sensor.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Unidad:</span> {sensor.unidad}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">GPIO ID:</span> {sensor.gpioId}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
