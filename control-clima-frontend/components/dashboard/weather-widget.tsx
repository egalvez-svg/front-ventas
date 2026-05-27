'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchWeather } from '@/lib/api/weather-service'
import { getWeatherIcon } from '@/lib/utils/weather-icons'

export function WeatherWidget() {
    const { data: weather, isLoading, isError } = useQuery({
        queryKey: ['weather'],
        queryFn: fetchWeather,
        refetchInterval: 60000,
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-center items-center min-h-[120px]">
                    <LoadingSpinner size="md" text="Cargando clima..." />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-6">
                <ErrorMessage
                    message="No se pudo cargar la información del clima"
                    className="text-sm"
                />
            </div>
        )
    }

    if (!weather) return null

    return (
        <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 rounded-2xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <svg className="w-3.5 h-3.5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-cyan-100 font-medium text-xs">
                            {weather.ubicacion.city}, {weather.ubicacion.region}
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-semibold">
                            {weather.temperatura}
                            <span className="text-xl font-normal text-blue-100">{weather.unidad_temp}</span>
                        </span>
                    </div>
                    <p className="text-cyan-100 text-sm font-medium mb-2">{weather.condicion}</p>
                    <div className="flex items-center gap-2 text-cyan-100">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="text-xs">
                                Humedad: {weather.humedad}{weather.unidad_hum}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="ml-4">
                    {getWeatherIcon(weather.codigo_clima)}
                </div>
            </div>
        </div>
    )
}
