"use client"

import { DashboardSearch } from "./dashboard-search"
import { DashboardSort } from "./dashboard-sort"
import { ThemeToggle } from "./ui/theme-toggle"

export function DashboardToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card border-b">
      <DashboardSearch />
      <DashboardSort />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </div>
  )
}
