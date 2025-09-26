import React from 'react'

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Cargando...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-gray-50 bg-opacity-80 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        {/* Spinner SVG */}
        <div className="relative">
          <div className={`${sizeClasses[size]} animate-spin mx-auto`}>
            <svg 
              className="w-full h-full text-primary-600" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          
          {/* Efecto de glow opcional */}
          <div className={`${sizeClasses[size]} absolute inset-0 animate-ping mx-auto opacity-20`}>
            <svg 
              className="w-full h-full text-primary-400" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        </div>
        
        {/* Mensaje */}
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
            {message}
          </p>
        )}
        
        {/* Puntos animados */}
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Variantes especializadas
export const FullScreenLoader = ({ message = 'Cargando aplicación...' }) => (
  <LoadingSpinner fullScreen size="large" message={message} />
)

export const InlineLoader = ({ message = 'Cargando...', size = 'small' }) => (
  <LoadingSpinner size={size} message={message} className="py-2" />
)

export const ButtonLoader = () => (
  <div className="w-4 h-4 animate-spin">
    <svg className="w-full h-full text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  </div>
)

export default LoadingSpinner