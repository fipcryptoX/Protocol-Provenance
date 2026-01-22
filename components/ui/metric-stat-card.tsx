"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"

interface MetricStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number
  formatValue?: (value: number) => string
}

const MetricStatCard = React.forwardRef<HTMLDivElement, MetricStatCardProps>(
  ({ title, value, formatValue, className, ...props }, ref) => {
    // Framer Motion hook for animating the number
    const motionValue = useMotionValue(0)

    // Transform the motion value using the format function
    const displayValue = useTransform(motionValue, (latest) =>
      formatValue ? formatValue(latest) : Math.round(latest).toLocaleString()
    )

    React.useEffect(() => {
      // Animate the value when the component mounts or the `value` prop changes
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
      })
      return controls.stop
    }, [value, motionValue])

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow",
          className
        )}
        role="region"
        aria-label={`${title}: ${formatValue ? formatValue(value) : value}`}
        {...props}
      >
        {/* Main animated value */}
        <motion.div className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">
          {displayValue}
        </motion.div>

        {/* Title */}
        <p className="text-base text-muted-foreground">{title}</p>
      </div>
    )
  }
)

MetricStatCard.displayName = "MetricStatCard"

export { MetricStatCard }
