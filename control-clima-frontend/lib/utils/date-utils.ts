/**
 * Formats a date string from the API (YYYY-MM-DD or ISO) to a localized Spanish format.
 * @param dateStr The date string to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatLocalDate = (dateStr?: string, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return ''
    const datePart = dateStr.split('T')[0]
    const [year, month, day] = datePart.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', options || { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Returns the current date in local format
 */
export const getTodayFormatted = () => {
    return formatLocalDate(new Date().toISOString().split('T')[0])
}
