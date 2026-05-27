import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
    fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        error,
        helperText,
        icon,
        iconPosition = 'left',
        fullWidth = false,
        className = '',
        type = 'text',
        disabled,
        ...props
    }, ref) => {
        const hasError = !!error

        const inputClasses = `
      w-full px-3 py-2 border rounded-lg
      bg-white text-gray-900
      focus:outline-none focus:ring-2 transition-colors
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
      ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
      ${className}
    `

        const wrapperClasses = fullWidth ? 'w-full' : ''

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={type}
                        className={inputClasses}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={
                            error ? `${props.id}-error` :
                                helperText ? `${props.id}-helper` :
                                    undefined
                        }
                        {...props}
                    />

                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                </div>

                {error && (
                    <p
                        id={`${props.id}-error`}
                        className="mt-1 text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p
                        id={`${props.id}-helper`}
                        className="mt-1 text-sm text-gray-500"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
