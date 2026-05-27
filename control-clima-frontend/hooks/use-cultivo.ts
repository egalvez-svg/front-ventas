import { useQuery } from '@tanstack/react-query'
import { fetchCultivoById, fetchNutricionHistorial } from '@/lib/api/cultivos-service'

export function useCultivo(cultivoId: number) {
    const { data: cultivo, isLoading: cultivoLoading, error: cultivoError, refetch: refetchCultivo } = useQuery({
        queryKey: ['cultivo', cultivoId],
        queryFn: () => fetchCultivoById(cultivoId),
        enabled: !!cultivoId
    })

    const { data: historialNutricion = [], isLoading: nutricionLoading } = useQuery({
        queryKey: ['nutricion', cultivoId],
        queryFn: () => fetchNutricionHistorial(cultivoId),
        enabled: !!cultivoId
    })

    return {
        cultivo,
        historialNutricion,
        isLoading: cultivoLoading || nutricionLoading,
        error: cultivoError,
        refetchCultivo
    }
}
