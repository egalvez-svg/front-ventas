'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { Sensor } from '@/lib/types/api'

export function useSensores() {
    const query = useQuery<Sensor[]>({
        queryKey: ['sensores'],
        queryFn: async () => {
            const response = await apiClient.get('/sensores')
            console.log('Sensores:', response.data)
            return response.data
        },
        refetchInterval: 5000, // Actualizar cada 5 segundos
        retry: 3, // Reintentar 3 veces si falla
        staleTime: 1000 // Los datos son frescos por 1 segundo
    })

    const sensoresActivos = query.data?.filter(s => s.activo).length || 0

    return {
        sensores: query.data,

        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,

        refetch: query.refetch,

        sensoresActivos
    }
}
