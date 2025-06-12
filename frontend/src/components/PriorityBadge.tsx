interface UrgencyBadgeProps {
  priority: "P1" | "P2" | "P3" | "P4"
  className?: string
}

const urgencyConfiguration = {
  P1: {
    label: "Critical",
    className: "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-300/60 shadow-red-200/50",
    dotColor: "bg-gradient-to-r from-red-500 to-pink-500",
    glowColor: "shadow-red-300/40",
  },
  P2: {
    label: "High",
    className: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-300/60 shadow-orange-200/50",
    dotColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    glowColor: "shadow-orange-300/40",
  },
  P3: {
    label: "Medium",
    className: "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-300/60 shadow-violet-200/50",
    dotColor: "bg-gradient-to-r from-violet-500 to-purple-500",
    glowColor: "shadow-violet-300/40",
  },
  P4: {
    label: "Low",
    className: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300/60 shadow-emerald-200/50",
    dotColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
    glowColor: "shadow-emerald-300/40",
  }
}

export function PriorityBadge({ priority, className = "" }: UrgencyBadgeProps) {
  const config = urgencyConfiguration[priority]

  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-2
        transition-all duration-300 hover:scale-110 hover:shadow-lg
        ${config.className} ${config.glowColor} ${className}
        backdrop-blur-sm
      `}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
      <span className="tracking-wide">{priority} - {config.label}</span>
    </span>
  )
}
