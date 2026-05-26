import apiClient from '@/lib/api/client'
import type { AnalisisIA, AnalisisIAActual } from '@/lib/types/api'


export async function fetchAnalisisIAActual(cultivoId: number): Promise<AnalisisIAActual> {
    console.log('[IA Service] Fetching current analysis for cultivoId:', cultivoId)
    const response = await apiClient.get<AnalisisIAActual>(`/ia/analisis/${cultivoId}`, {
        timeout: 60000
    })
    console.log('[IA Service] Current analysis received:', response.data)
    return response.data
}

export async function fetchHistorialAnalisisIA(cultivoId: number): Promise<AnalisisIA[]> {
    console.log('[IA Service] Fetching analysis history for cultivoId:', cultivoId)
    const response = await apiClient.get<AnalisisIA[]>(`/ia/historial/${cultivoId}`, {
        timeout: 30000
    })
    console.log('[IA Service] History received:', response.data)
    return response.data
}

export async function generarAnalisisManual(cultivoId: number, data: any): Promise<AnalisisIAActual> {
    console.log('[IA Service] Generating manual analysis for cultivoId:', cultivoId)
    const response = await apiClient.post<AnalisisIAActual>(`/ia/analisis/${cultivoId}`, data, {
        timeout: 60000
    })
    return response.data
}

