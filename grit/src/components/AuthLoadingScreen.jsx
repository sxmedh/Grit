export default function AuthLoadingScreen() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary,#0a0a0a)]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-green,#00ff88)] border-t-transparent"></div>
        </div>
    )
}
