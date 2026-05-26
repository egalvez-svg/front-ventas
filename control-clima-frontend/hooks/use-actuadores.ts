'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { Actuador, Dispositivo } from '@/lib/types/api'
import { ejecutarAccionActuador } from '@/lib/api/devices-service'

export function useActuadores() {
    const query = useQuery<Actuador[]>({
        queryKey: ['actuadores'],
        queryFn: async () => {
            const response = await apiClient.get('/actuadores')
            console.log('Actuadores:', response.data)
            return response.data
        },
        refetchInterval: 5000, // Actualizar cada 5 segundos
        retry: 3, // Reintentar 3 veces si falla
        staleTime: 1000 // Los datos son frescos por 1 segundo
    })

    // Cálculos derivados
    const actuadoresActivos = query.data?.filter(a => a.activo).length || 0

    return {
        // Datos
        actuadores: query.data,

        // Estados
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,

        // Funciones
        refetch: query.refetch,

        // Datos derivados
        actuadoresActivos
    }
}

export function useToggleActuador() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ actuadorId, accion }: { actuadorId: number, accion: 'encender' | 'apagar' }) =>
            ejecutarAccionActuador(actuadorId, accion),

        onMutate: async ({ actuadorId, accion }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['device'] })
            await queryClient.cancelQueries({ queryKey: ['dispositivo'] })
            await queryClient.cancelQueries({ queryKey: ['userDevices'] })
            await queryClient.cancelQueries({ queryKey: ['cama'] })

            // Snapshot the previous values
            const previousQueries = queryClient.getQueriesData({ queryKey: [] })

            const newState = accion === 'encender'

            // Optimistically update all relevant queries
            // 1. Update individual device queries
            queryClient.setQueriesData<Dispositivo>({ queryKey: ['device'] }, (old) => {
                if (!old) return old
                return {
                    ...old,
                    gpios: old.gpios?.map(gpio => ({
                        ...gpio,
                        actuadores: gpio.actuadores?.map(act =>
                            act.id === actuadorId ? { ...act, estado: newState } : act
                        )
                    }))
                }
            })

            queryClient.setQueriesData<Dispositivo>({ queryKey: ['dispositivo'] }, (old) => {
                if (!old) return old
                return {
                    ...old,
                    gpios: old.gpios?.map(gpio => ({
                        ...gpio,
                        actuadores: gpio.actuadores?.map(act =>
                            act.id === actuadorId ? { ...act, estado: newState } : act
                        )
                    }))
                }
            })

            // 2. Update user devices list
            queryClient.setQueriesData<Dispositivo[]>({ queryKey: ['userDevices'] }, (old) => {
                if (!old) return old
                return old.map(dev => ({
                    ...dev,
                    gpios: dev.gpios?.map(gpio => ({
                        ...gpio,
                        actuadores: gpio.actuadores?.map(act =>
                            act.id === actuadorId ? { ...act, estado: newState } : act
                        )
                    }))
                }))
            })

            // 3. Update cama queries (which might contain devices)
            queryClient.setQueriesData<any>({ queryKey: ['cama'] }, (old: any) => {
                if (!old || !old.sala?.dispositivos) return old
                return {
                    ...old,
                    sala: {
                        ...old.sala,
                        dispositivos: old.sala.dispositivos.map((dev: Dispositivo) => ({
                            ...dev,
                            gpios: dev.gpios?.map(gpio => ({
                                ...gpio,
                                actuadores: gpio.actuadores?.map(act =>
                                    act.id === actuadorId ? { ...act, estado: newState } : act
                                )
                            }))
                        }))
                    }
                }
            })

            return { previousQueries }
        },

        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data)
                })
            }
        },

        onSettled: () => {
            // Always refetch after error or success to make sure the server state is in sync
            queryClient.invalidateQueries({ queryKey: ['device'] })
            queryClient.invalidateQueries({ queryKey: ['dispositivo'] })
            queryClient.invalidateQueries({ queryKey: ['userDevices'] })
            queryClient.invalidateQueries({ queryKey: ['cama'] })
        },
    })
}
