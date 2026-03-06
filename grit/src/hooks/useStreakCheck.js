import { useEffect, useRef, useState } from 'react'
import { runStreakCheck } from '../utils/streak'
import { updateStreakData } from '../utils/firestore'

export function useStreakCheck(userId, parentTasks, subtasksMap) {
    const [brokenTasks, setBrokenTasks] = useState([])
    const checkedRefs = useRef(new Set())

    useEffect(() => {
        if (!userId || !parentTasks || parentTasks.length === 0 || !subtasksMap) return

        parentTasks.forEach(task => {
            // Ensure we only actually submit the streak check once per session per task
            if (checkedRefs.current.has(task.id)) return

            const subtasks = subtasksMap[task.id]
            if (!subtasks) return // Wait until subtasks are loaded

            checkedRefs.current.add(task.id)

            const result = runStreakCheck(task, subtasks)

            if (result) {
                // Write the new streak status
                updateStreakData(userId, task.id, {
                    streakCount: result.streakCount,
                    lastCheckedDate: result.lastCheckedDate,
                    lastActiveDayStatus: result.lastActiveDayStatus
                }).catch(console.error)

                if (result.streakBroken) {
                    setBrokenTasks(prev => [...prev, task])
                }
            }
        })
    }, [userId, parentTasks, subtasksMap])

    const clearBrokenTask = (taskId) => {
        setBrokenTasks(prev => prev.filter(t => t.id !== taskId))
    }

    return { brokenTasks, clearBrokenTask }
}
