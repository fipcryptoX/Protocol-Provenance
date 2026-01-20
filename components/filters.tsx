"use client";

import { useState } from "react";
import { Search, ChevronDown, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtocolCategory, SortOption } from "@/types";

interface FiltersProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: SortOption) => void;
  currentSort: SortOption;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "ethos", label: "Ethos Score" },
  { value: "stock", label: "Stock Value" },
  { value: "flow", label: "Flow Value" },
  { value: "name", label: "Name" },
];

export function Filters({ onSearchChange, onSortChange, currentSort }: FiltersProps) {
  const [search, setSearch] = useState("");
  const [isGridView, setIsGridView] = useState(true);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search a project"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort and View Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by</span>
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-10 text-sm font-medium focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <div className="flex rounded-lg border border-gray-200 bg-white">
          <button
            onClick={() => setIsGridView(false)}
            className={`p-2 ${!isGridView ? "bg-gray-100" : ""}`}
          >
            <List className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setIsGridView(true)}
            className={`p-2 ${isGridView ? "bg-gray-100" : ""}`}
          >
            <LayoutGrid className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
