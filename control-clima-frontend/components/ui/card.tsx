import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    variant?: 'default' | 'bordered' | 'elevated'
    onClick?: () => void
}

interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

interface CardContentProps {
    children: React.ReactNode
    className?: string
}

interface CardFooterProps {
    children: React.ReactNode
    className?: string
}

export function Card({
    children,
    className = '',
    variant = 'default',
    onClick
}: CardProps) {
    const baseStyles = 'bg-white rounded-lg'

    const variantStyles = {
        default: 'shadow',
        bordered: 'border border-gray-200',
        elevated: 'shadow-lg'
    }

    const clickableStyles = onClick ? 'cursor-pointer transition-shadow hover:shadow-lg' : ''

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${clickableStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    )
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    )
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    )
}
