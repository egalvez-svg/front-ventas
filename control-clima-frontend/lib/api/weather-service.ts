import apiClient from './client'
import { Weather } from '@/lib/types/api'

export const fetchWeather = async (): Promise<Weather> => {
    const response = await apiClient.get<Weather>('/clima')
    return response.data
}
