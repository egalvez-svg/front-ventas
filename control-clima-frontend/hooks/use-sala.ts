import { useQuery } from '@tanstack/react-query'
import { fetchSalaById } from '@/lib/api/salas-service'
import { fetchCamasBySala } from '@/lib/api/camas-service'
import { fetchCultivosBySala } from '@/lib/api/cultivos-service'

export function useSala(salaId: number) {
    const { data: sala, isLoading: salaLoading, error: salaError } = useQuery({
        queryKey: ['sala', salaId],
        queryFn: () => fetchSalaById(salaId),
        enabled: !!salaId
    })

    const { data: camas, isLoading: camasLoading } = useQuery({
        queryKey: ['camas-sala', salaId],
        queryFn: () => fetchCamasBySala(salaId),
        enabled: !!salaId
    })

    const { data: cultivos, isLoading: cultivosLoading } = useQuery({
        queryKey: ['cultivos-sala', salaId],
        queryFn: () => fetchCultivosBySala(salaId),
        enabled: !!salaId
    })

    return {
        sala,
        camas,
        cultivos,
        isLoading: salaLoading || camasLoading || cultivosLoading,
        error: salaError
    }
}
