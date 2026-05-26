import React from 'react'

interface EmptyStateProps {
    icon?: string
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({
    icon = '📭',
    title,
    description,
    action,
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`text-center py-12 ${className}`}>
            <div className="text-6xl mb-4">{icon}</div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
