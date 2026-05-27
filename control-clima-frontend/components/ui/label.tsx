import React from 'react'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean
    disabled?: boolean
}

export function Label({
    children,
    required = false,
    disabled = false,
    className = '',
    ...props
}: LabelProps) {
    return (
        <label
            className={`
        block text-sm font-medium text-gray-700
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    )
}
