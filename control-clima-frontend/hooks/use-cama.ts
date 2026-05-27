import { useQuery } from '@tanstack/react-query'
import { fetchCamaById } from '@/lib/api/camas-service'
import { fetchSalaById } from '@/lib/api/salas-service'
import { fetchCultivosBySala } from '@/lib/api/cultivos-service'
import { useQueryClient } from '@tanstack/react-query'

export function useCama(camaId: number) {
    const queryClient = useQueryClient()

    // 1. Fetch Cama
    const { data: cama, isLoading: camaLoading, error: camaError } = useQuery({
        queryKey: ['cama', camaId],
        queryFn: () => fetchCamaById(camaId),
        enabled: !!camaId
    })

    // 2. Fetch Cultivos de la Sala
    const { data: cultivosSala, isLoading: cultivosLoading } = useQuery({
        queryKey: ['cultivos-sala', cama?.salaId],
        queryFn: () => fetchCultivosBySala(cama!.salaId),
        enabled: !!cama?.salaId
    })

    // 3. Fetch Sala (para asegurar que tenemos los dispositivos completos)
    const { data: sala, isLoading: salaLoading } = useQuery({
        queryKey: ['sala', cama?.salaId],
        queryFn: () => fetchSalaById(cama!.salaId),
        enabled: !!cama?.salaId
    })

    const cultivoActivo = (cultivosSala || []).find((c: any) =>
        c.camaId === camaId && ['activo', 'esqueje', 'vegetativo', 'floracion', 'cosecha'].includes(c.estado)
    )

    // Agregación de dispositivos con varias fuentes de respaldo
    const dispositivos = sala?.dispositivos ||
        cama?.sala?.dispositivos ||
        cultivoActivo?.sala?.dispositivos ||
        []

    return {
        cama,
        cultivoActivo,
        dispositivos,
        isLoading: camaLoading || cultivosLoading || salaLoading,
        error: camaError,
        salaId: cama?.salaId
    }
}
