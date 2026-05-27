import React from 'react'

interface ErrorMessageProps {
    title?: string
    message?: string
    error?: Error | unknown
    onRetry?: () => void
    variant?: 'error' | 'warning'
    className?: string
}

export function ErrorMessage({
    title = 'Error',
    message,
    error,
    onRetry,
    variant = 'error',
    className = ''
}: ErrorMessageProps) {
    const variantStyles = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            titleColor: 'text-red-600',
            textColor: 'text-red-700',
            buttonBg: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            titleColor: 'text-yellow-600',
            textColor: 'text-yellow-700',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
        }
    }

    const styles = variantStyles[variant]

    // Extraer mensaje del error si existe
    let errorMessage = 'Ha ocurrido un error inesperado'

    if (error instanceof Error) {
        errorMessage = error.message
    } else if (typeof error === 'string') {
        errorMessage = error
    } else if (error && typeof error === 'object') {
        // Si es un objeto, intentar extraer 'message' o serializar
        const anyError = error as any
        if (anyError.message) {
            errorMessage = Array.isArray(anyError.message) ? anyError.message.join(', ') : anyError.message
        } else {
            errorMessage = JSON.stringify(error)
        }
    } else if (message) {
        errorMessage = message
    }

    return (
        <div className={`${styles.bg} border ${styles.border} rounded-lg p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className={`font-semibold ${styles.titleColor}`}>{title}</h3>
            </div>

            <p className={`text-sm ${styles.textColor} mb-4`}>
                {errorMessage}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className={`${styles.buttonBg} text-white font-medium py-2 px-4 rounded transition-colors`}
                >
                    🔄 Reintentar
                </button>
            )}
        </div>
    )
}
