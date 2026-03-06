export default function OfflineBanner() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="rounded-full bg-[#1e1e1e] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--accent-red,#ff3f6c)] shadow-lg ring-1 ring-[#ff3f6c]/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-red,#ff3f6c)] animate-pulse"></div>
                Device Offline
            </div>
        </div>
    )
}
