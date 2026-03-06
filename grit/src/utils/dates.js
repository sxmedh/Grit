export function getLocalDateString() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return new Date().toLocaleDateString('en-CA', { timeZone: tz })
}

export function isActiveToday(activeDays) {
    if (!activeDays || activeDays.length === 0) return false
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    return activeDays.includes(todayShort)
}

export function getPreviousActiveDay(activeDays, fromDate) {
    if (!activeDays || activeDays.length === 0) return null

    let current = new Date(fromDate)

    // Cap lookback at 60 days to prevent infinite loop
    for (let i = 0; i < 60; i++) {
        current.setDate(current.getDate() - 1)
        const shortDay = current.toLocaleDateString('en-US', { weekday: 'short' })
        if (activeDays.includes(shortDay)) {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            return current.toLocaleDateString('en-CA', { timeZone: tz })
        }
    }

    return null
}
