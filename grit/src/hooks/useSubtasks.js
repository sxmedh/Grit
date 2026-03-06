import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

export function useSubtasks(userId, parentId) {
    const [subtasks, setSubtasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId || !parentId) {
            setSubtasks([])
            setLoading(false)
            return
        }

        const q = query(
            collection(db, 'users', userId, 'parentTasks', parentId, 'subtasks'),
            orderBy('createdAt', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSubtasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setSubtasks(fetchedSubtasks)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching subtasks: ", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [userId, parentId])

    return { subtasks, loading }
}
