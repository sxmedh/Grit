export default function SkeletonCard() {
    return (
        <div className="relative mb-4 overflow-hidden rounded-xl bg-[#111] border border-[#1e1e1e] p-4 h-24">
            <div className="absolute inset-0 z-0 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,#1a1a1a_25%,#242424_50%,#1a1a1a_75%)] bg-[length:200%_100%]"></div>
            <div className="relative z-10 space-y-3">
                <div className="h-6 w-1/3 rounded bg-[#242424]"></div>
                <div className="h-4 w-1/2 rounded bg-[#242424]"></div>
            </div>
        </div>
    )
}
