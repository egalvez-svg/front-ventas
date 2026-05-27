import React from 'react'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'primary' | 'white' | 'gray'

interface LoadingSpinnerProps {
    size?: SpinnerSize
    variant?: SpinnerVariant
    text?: string
    className?: string
}

export function LoadingSpinner({
    size = 'md',
    variant = 'primary',
    text,
    className = ''
}: LoadingSpinnerProps) {
    const sizeStyles = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3',
        xl: 'h-12 w-12 border-3'
    }

    const variantStyles = {
        primary: 'border-blue-600 border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-400 border-t-transparent'
    }

    const textColorStyles = {
        primary: 'text-blue-600',
        white: 'text-white',
        gray: 'text-gray-600'
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div
                className={`
          animate-spin rounded-full
          ${sizeStyles[size]}
          ${variantStyles[variant]}
        `}
                role="status"
                aria-label="Loading"
            />
            {text && (
                <span className={`text-sm font-medium ${textColorStyles[variant]}`}>
                    {text}
                </span>
            )}
        </div>
    )
}
