import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParentTasks } from '../hooks/useParentTasks'
import { useSubtasksMap } from '../hooks/useSubtasksMap'
import { useStreakCheck } from '../hooks/useStreakCheck'
import { isActiveToday } from '../utils/dates'
import { deleteParentTask } from '../utils/firestore'
import ParentTaskCard from '../components/ParentTaskCard'
import SkeletonCard from '../components/SkeletonCard'
import OfflineBanner from '../components/OfflineBanner'
import StreakBrokenToast from '../components/StreakBrokenToast'
import SubtaskView from '../components/SubtaskView'
import AddParentTaskModal from '../components/AddParentTaskModal'

export default function HomeScreen() {
    const { currentUser, signOut } = useAuth()
    const { tasks, loading } = useParentTasks(currentUser?.uid)

    const subtasksMap = useSubtasksMap(currentUser?.uid, tasks)
    const { brokenTasks, clearBrokenTask } = useStreakCheck(currentUser?.uid, tasks, subtasksMap)

    const [selectedParentTask, setSelectedParentTask] = useState(null)
    const [isOffline, setIsOffline] = useState(!navigator.onLine)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleDelete = async (taskId) => {
        if (!currentUser) return
        try {
            await deleteParentTask(currentUser.uid, taskId)
        } catch (e) {
            console.error("Error deleting parent task:", e)
        }
    }

    if (selectedParentTask) {
        return <SubtaskView
            userId={currentUser.uid}
            parentTask={selectedParentTask}
            onBack={() => setSelectedParentTask(null)}
        />
    }

    const activeTasks = tasks.filter(t => isActiveToday(t.activeDays))
    const inactiveTasks = tasks.filter(t => !isActiveToday(t.activeDays))

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative pb-24">
            {isOffline && <OfflineBanner />}
            <StreakBrokenToast brokenTasks={brokenTasks} clearTask={clearBrokenTask} />

            <header className="flex items-center justify-between p-4 px-5 pt-8 mb-4">
                <h1 className="font-display text-4xl font-[800] tracking-tighter">Grit</h1>
                <button
                    onClick={signOut}
                    className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] ring-1 ring-[#1e1e1e] px-3 py-1.5 rounded-full"
                >
                    Sign Out
                </button>
            </header>

            <main className="mx-auto max-w-[480px] p-4">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : tasks.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center text-center animate-[fadeUp_400ms_ease-out]">
                        <div className="text-7xl mb-6 opacity-30 drop-shadow-lg">🏔️</div>
                        <h2 className="font-display text-2xl font-[800] mb-3 text-[var(--text-primary)]">No goals yet</h2>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-[260px] leading-relaxed">
                            Add your first goal to start tracking your daily habits and building streaks.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="rounded-full bg-[var(--accent-green)] text-[var(--bg-primary)] px-8 py-3.5 font-[800] transition-colors hover:bg-opacity-90 active:scale-95 shadow-lg shadow-[var(--accent-green)]/10"
                        >
                            Add first goal
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {activeTasks.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {activeTasks.map(task => (
                                    <ParentTaskCard
                                        key={task.id}
                                        task={task}
                                        onClick={setSelectedParentTask}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}

                        {inactiveTasks.length > 0 && (
                            <div className="animate-[fadeUp_500ms_ease-out_both] delay-100">
                                <h3 className="mb-3 pl-1 text-[11px] font-[800] uppercase tracking-widest text-[var(--text-muted)]">
                                    Not Today
                                </h3>
                                <div className="flex flex-col gap-3 relative">
                                    {inactiveTasks.map(task => (
                                        <ParentTaskCard
                                            key={task.id}
                                            task={task}
                                            onClick={setSelectedParentTask}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FAB */}
            {!loading && tasks.length > 0 && (
                <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-6 right-6 z-40 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[var(--accent-green)] text-[var(--bg-primary)] shadow-xl shadow-[var(--accent-green)]/20 transition-all hover:scale-105 active:scale-95"
                >
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            )}

            {showAddModal && <AddParentTaskModal onClose={() => setShowAddModal(false)} userId={currentUser.uid} />}
        </div>
    )
}
