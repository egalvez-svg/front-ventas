import React from 'react'

/**
 * Returns the appropriate weather icon SVG based on the weather code
 * Weather codes follow the WMO (World Meteorological Organization) standard
 */
export function getWeatherIcon(codigoClima: number): React.ReactElement {
    // Tormentas (95, 96, 99)
    if (codigoClima >= 95) {
        return (
            <svg className="w-12 h-12 text-yellow-200 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    }

    // Chubascos de nieve (85-86)
    if (codigoClima >= 85 && codigoClima <= 86) {
        return (
            <svg className="w-12 h-12 text-blue-100 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
                <circle cx="8" cy="19" r="1" fill="white" />
                <circle cx="12" cy="21" r="1" fill="white" />
                <circle cx="16" cy="19" r="1" fill="white" />
            </svg>
        )
    }

    // Chubascos (80-82)
    if (codigoClima >= 80 && codigoClima <= 82) {
        return (
            <svg className="w-12 h-12 text-blue-200 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
                <path d="M7 19l1-2M11 20l1-2M15 19l1-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    }

    // Granizo (77)
    if (codigoClima === 77) {
        return (
            <svg className="w-12 h-12 text-slate-200 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
                <circle cx="8" cy="20" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
                <circle cx="16" cy="20" r="1.5" />
            </svg>
        )
    }

    // Nevada (71-75)
    if (codigoClima >= 71 && codigoClima <= 75) {
        return (
            <svg className="w-12 h-12 text-blue-100 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" />
            </svg>
        )
    }

    // Lluvia helada (66-67)
    if (codigoClima >= 66 && codigoClima <= 67) {
        return (
            <svg className="w-12 h-12 text-cyan-200 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
            </svg>
        )
    }

    // Lluvia (61-65)
    if (codigoClima >= 61 && codigoClima <= 65) {
        return (
            <svg className="w-12 h-12 text-blue-200 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
            </svg>
        )
    }

    // Llovizna helada (56-57)
    if (codigoClima >= 56 && codigoClima <= 57) {
        return (
            <svg className="w-12 h-12 text-cyan-300 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
            </svg>
        )
    }

    // Llovizna (51-55)
    if (codigoClima >= 51 && codigoClima <= 55) {
        return (
            <svg className="w-12 h-12 text-blue-300 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
            </svg>
        )
    }

    // Niebla (45, 48)
    if (codigoClima === 45 || codigoClima === 48) {
        return (
            <svg className="w-12 h-12 text-slate-300 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15h18M3 19h18M3 11h18" />
            </svg>
        )
    }

    // Nublado (2-3)
    if (codigoClima >= 2 && codigoClima <= 3) {
        return (
            <svg className="w-12 h-12 text-slate-200 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
            </svg>
        )
    }

    // Despejado / Mayormente despejado (0-1)
    return (
        <svg className="w-12 h-12 text-yellow-300 opacity-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
    )
}

/**
 * Weather code descriptions based on WMO standard
 */
export const WEATHER_CODES: { [key: number]: string } = {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla con escarcha',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna densa',
    56: 'Llovizna helada ligera',
    57: 'Llovizna helada densa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia intensa',
    66: 'Lluvia helada ligera',
    67: 'Lluvia helada intensa',
    71: 'Nevada ligera',
    73: 'Nevada moderada',
    75: 'Nevada intensa',
    77: 'Granizo',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos violentos',
    85: 'Chubascos de nieve ligeros',
    86: 'Chubascos de nieve intensos',
    95: 'Tormenta',
    96: 'Tormenta con granizo ligero',
    99: 'Tormenta con granizo intenso',
}
