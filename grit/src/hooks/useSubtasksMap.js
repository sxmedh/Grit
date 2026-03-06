import { useEffect, useMemo, useRef, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'

export function useSubtasksMap(userId, parentTasks) {
  const [subtasksMap, setSubtasksMap] = useState({})

  const parentTasksRef = useRef(parentTasks)
  useEffect(() => {
    parentTasksRef.current = parentTasks
  })

  const stableTaskKey = useMemo(() => (parentTasks || []).map((t) => t.id).join(','), [parentTasks])

  useEffect(() => {
    const tasks = parentTasksRef.current

    if (!userId || !tasks || tasks.length === 0) return

    const taskIds = new Set(tasks.map((task) => task.id))

    const unsubscribers = tasks.map((task) => {
      const q = query(
        collection(db, 'users', userId, 'parentTasks', task.id, 'subtasks'),
        orderBy('createdAt', 'asc')
      )

      return onSnapshot(
        q,
        (snapshot) => {
          const subtasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setSubtasksMap((prev) => {
            const next = {}
            taskIds.forEach((id) => {
              if (prev[id]) next[id] = prev[id]
            })
            next[task.id] = subtasks
            return next
          })
        },
        (error) => {
          console.error(`Error fetching subtasks for task ${task.id}:`, error)
        }
      )
    })

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [userId, stableTaskKey])
  return useMemo(() => {
    if (!parentTasks || parentTasks.length === 0) return {}
    const taskIds = new Set(parentTasks.map((t) => t.id))
    const result = {}
    taskIds.forEach((id) => {
      if (subtasksMap[id]) result[id] = subtasksMap[id]
    })
    return result
  }, [subtasksMap, parentTasks])
}
