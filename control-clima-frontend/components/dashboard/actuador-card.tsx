import React from 'react'
import type { Actuador } from '@/lib/types/api'
import { Card, CardContent, CardFooter, Badge, Button } from '@/components/ui'

interface ActuadorCardProps {
    actuador: Actuador
    onControl?: (actuador: Actuador) => void
    className?: string
}

export function ActuadorCard({ actuador, onControl, className = '' }: ActuadorCardProps) {
    return (
        <Card className={`hover:shadow-md transition-shadow ${className}`}>
            <CardContent>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                        {actuador.tipo}
                    </h3>
                    <Badge variant={actuador.activo ? 'success' : 'gray'}>
                        {actuador.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Estado default:</span>{' '}
                        <span className={actuador.estadoDefault ? 'text-green-600' : 'text-gray-600'}>
                            {actuador.estadoDefault ? 'ON' : 'OFF'}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">GPIO ID:</span> {actuador.gpioId}
                    </p>
                </div>
            </CardContent>

            {onControl && (
                <CardFooter className="pt-0">
                    <Button
                        fullWidth
                        variant="primary"
                        onClick={() => onControl(actuador)}
                    >
                        Controlar
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
