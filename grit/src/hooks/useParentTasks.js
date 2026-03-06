import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

export function useParentTasks(userId) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setTasks([])
            setLoading(false)
            return
        }

        const q = query(
            collection(db, 'users', userId, 'parentTasks'),
            orderBy('createdAt', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setTasks(fetchedTasks)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching parent tasks: ", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [userId])

    return { tasks, loading }
}
