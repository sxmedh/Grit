import { useState } from 'react'
import { useSubtasks } from '../hooks/useSubtasks'
import { getLocalDateString } from '../utils/dates'
import { deleteSubtask, toggleSubtaskComplete } from '../utils/firestore'
import SubtaskRow from './SubtaskRow'
import AddSubtaskModal from './AddSubtaskModal'
import SkeletonCard from './SkeletonCard'

export default function SubtaskView({ userId, parentTask, onBack }) {
    const { subtasks, loading } = useSubtasks(userId, parentTask.id)
    const [showAddModal, setShowAddModal] = useState(false)
    const today = getLocalDateString()

    const handleToggle = async (subtaskId, isDone) => {
        await toggleSubtaskComplete(userId, parentTask.id, subtaskId, today, isDone)
    }

    const handleDelete = async (subtaskId) => {
        try {
            await deleteSubtask(userId, parentTask.id, subtaskId)
        } catch (e) {
            console.error("Error deleting subtask:", e)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative pb-24 animate-[fadeUp_200ms_ease-out_both] z-10 w-full absolute inset-0">
            <header className="flex items-center gap-4 border-b border-[var(--border)] p-4 pt-6 bg-[var(--bg-primary)] sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="flex-1 overflow-hidden">
                    <h2 className="font-display text-2xl font-[800] tracking-tight truncate">{parentTask.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[var(--accent-green)] flex items-center gap-1">
                            <span className="text-sm">🔥</span> Streak: {parentTask.streakCount || 0}
                        </span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[480px] p-4">
                {loading ? (
                    <div className="mt-4"><SkeletonCard /><SkeletonCard /></div>
                ) : subtasks.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center text-center animate-[fadeUp_300ms_ease-out_both]">
                        <div className="text-6xl mb-4 opacity-50">📝</div>
                        <h3 className="font-display text-xl font-[800] mb-2">No subtasks yet</h3>
                        <p className="text-[var(--text-secondary)] mb-6 text-sm">Break your goal down into actionable steps.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] px-6 py-2.5 font-[800] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
                        >
                            Add first subtask
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 mt-4 animate-[fadeUp_300ms_ease-out_both]">
                        {subtasks.map(subtask => (
                            <SubtaskRow
                                key={subtask.id}
                                subtask={subtask}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                today={today}
                            />
                        ))}
                    </div>
                )}
            </main>

            {!loading && (
                <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-6 right-6 z-40 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[var(--accent-blue)] text-[var(--bg-primary)] shadow-xl shadow-[var(--accent-blue)]/20 transition-all hover:scale-105 active:scale-95"
                >
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            )}

            {showAddModal && (
                <AddSubtaskModal
                    onClose={() => setShowAddModal(false)}
                    userId={userId}
                    parentId={parentTask.id}
                />
            )}
        </div>
    )
}
