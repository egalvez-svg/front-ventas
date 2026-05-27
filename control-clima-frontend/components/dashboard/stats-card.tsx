import React from 'react'
import { Card, CardContent } from '@/components/ui'

export type StatsVariant = 'blue' | 'green' | 'red' | 'yellow' | 'gray'

interface StatsCardProps {
    title: string
    value: string | number
    variant?: StatsVariant
    loading?: boolean
    icon?: string
    className?: string
}

export function StatsCard({
    title,
    value,
    variant = 'blue',
    loading = false,
    icon,
    className = ''
}: StatsCardProps) {
    const variantStyles = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        gray: 'text-gray-600'
    }

    return (
        <Card className={className}>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">
                            {title}
                        </h3>
                        <p className={`text-3xl font-bold ${variantStyles[variant]}`}>
                            {loading ? '...' : value}
                        </p>
                    </div>
                    {icon && (
                        <div className="text-4xl opacity-50">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
