"use client";

import { Home, LayoutGrid, Calendar, MessageCircle, Info, Users, Sliders, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { icon: Home, label: "Home" },
  { icon: LayoutGrid, label: "Projects" },
  { icon: Calendar, label: "Calendar" },
  { icon: MessageCircle, label: "Messages" },
  { icon: Info, label: "Info" },
  { icon: Users, label: "Team" },
  { icon: Sliders, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[120px] bg-[#2563EB] flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
        <div className="h-6 w-6 rounded-lg bg-[#2563EB]" />
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-1 flex-col items-center space-y-4">
        {navigation.map((item, index) => (
          <button
            key={item.label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white",
              index === 1 && "bg-white/10 text-white"
            )}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </nav>

      {/* More Options */}
      <button className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </aside>
  );
}
