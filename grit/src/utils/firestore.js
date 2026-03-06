import { db } from '../firebase'
import { collection, doc, setDoc, deleteDoc, writeBatch, updateDoc, arrayUnion, arrayRemove, serverTimestamp, getDocs } from 'firebase/firestore'

export async function addParentTask(userId, data) {
    const taskRef = doc(collection(db, 'users', userId, 'parentTasks'))
    await setDoc(taskRef, {
        name: data.name,
        activeDays: data.activeDays,
        streakCount: 0,
        lastCheckedDate: new Date().toLocaleDateString('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        lastActiveDayStatus: null,
        createdAt: serverTimestamp(),
        order: Date.now()
    })
    return taskRef.id
}

export async function deleteParentTask(userId, taskId) {
    const batch = writeBatch(db)
    const taskRef = doc(db, 'users', userId, 'parentTasks', taskId)

    // Get all subtasks to delete them as well
    const subtasksSnapshot = await getDocs(collection(taskRef, 'subtasks'))
    subtasksSnapshot.forEach((subtaskDoc) => {
        batch.delete(subtaskDoc.ref)
    })

    batch.delete(taskRef)
    await batch.commit()
}

export async function addSubtask(userId, parentId, data) {
    const subtaskRef = doc(collection(db, 'users', userId, 'parentTasks', parentId, 'subtasks'))
    await setDoc(subtaskRef, {
        name: data.name,
        completedDates: [],
        createdAt: serverTimestamp(),
        order: Date.now()
    })
    return subtaskRef.id
}

export async function deleteSubtask(userId, parentId, subtaskId) {
    const subtaskRef = doc(db, 'users', userId, 'parentTasks', parentId, 'subtasks', subtaskId)
    await deleteDoc(subtaskRef)
}

export async function toggleSubtaskComplete(userId, parentId, subtaskId, date, isDone) {
    const subtaskRef = doc(db, 'users', userId, 'parentTasks', parentId, 'subtasks', subtaskId)
    if (isDone) {
        await updateDoc(subtaskRef, {
            completedDates: arrayUnion(date)
        })
    } else {
        await updateDoc(subtaskRef, {
            completedDates: arrayRemove(date)
        })
    }
}

export async function updateStreakData(userId, taskId, updates) {
    const taskRef = doc(db, 'users', userId, 'parentTasks', taskId)
    await updateDoc(taskRef, {
        streakCount: updates.streakCount,
        lastCheckedDate: updates.lastCheckedDate,
        lastActiveDayStatus: updates.lastActiveDayStatus
    })
}
