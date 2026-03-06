import { getLocalDateString } from './dates'

export function runStreakCheck(parentTask, subtasks) {
    const today = getLocalDateString()
    if (parentTask.lastCheckedDate === today) {
        return null // skip, already checked today
    }

    const dateToCheck = parentTask.lastCheckedDate
    const totalSubtasks = subtasks.length

    // Edge Case: 0 subtasks
    if (totalSubtasks === 0) {
        return {
            streakCount: 0,
            lastActiveDayStatus: 'incomplete',
            lastCheckedDate: today,
            streakBroken: false
        }
    }

    const completedCount = subtasks.filter(s => s.completedDates?.includes(dateToCheck)).length
    const incompleteRatio = (totalSubtasks - completedCount) / totalSubtasks

    let streakCount = parentTask.streakCount
    let lastActiveDayStatus = parentTask.lastActiveDayStatus
    let streakBroken = false

    if (incompleteRatio > 0.5) {
        if (parentTask.lastActiveDayStatus === 'incomplete') {
            streakCount = 0 // BREAK: 2 consecutive bad days
            streakBroken = parentTask.streakCount > 0
        }
        lastActiveDayStatus = 'incomplete'
    } else if (completedCount === totalSubtasks) {
        streakCount = parentTask.streakCount + 1
        lastActiveDayStatus = 'complete'
    } else {
        lastActiveDayStatus = 'partial'
    }

    return { streakCount, lastActiveDayStatus, lastCheckedDate: today, streakBroken }
}
