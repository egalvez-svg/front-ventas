import React from 'react'

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'gray'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    size?: BadgeSize
    className?: string
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}: BadgeProps) {
    const variantStyles = {
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800',
        gray: 'bg-gray-100 text-gray-800'
    }

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1 text-sm'
    }

    return (
        <span
            className={`
        inline-flex items-center rounded font-medium
        ${variantStyles[variant]} 
        ${sizeStyles[size]}
        ${className}
      `}
        >
            {children}
        </span>
    )
}
