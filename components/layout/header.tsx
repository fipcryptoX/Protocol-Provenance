"use client";

import { Search, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tab {
  label: string;
  count?: number;
  active?: boolean;
}

const tabs: Tab[] = [
  { label: "ALL", count: 87, active: false },
  { label: "CURRENT", count: 4, active: true },
  { label: "PENDING", count: 2, active: false },
  { label: "COMPLETED", count: 78, active: false },
  { label: "FAILED", active: false },
];

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-12">
          <h1 className="text-2xl font-semibold">Projects</h1>

          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`relative pb-4 text-sm font-medium transition-colors ${
                  tab.active
                    ? "text-[#2563EB]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs">
                    {tab.count}
                  </span>
                )}
                {tab.active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="rounded-lg p-2 hover:bg-gray-100">
            <Search className="h-5 w-5 text-gray-600" />
          </button>
          <button className="relative rounded-lg p-2 hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
