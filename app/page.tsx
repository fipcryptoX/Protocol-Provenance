"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProtocolCard } from "@/components/protocol-card";
import { Filters } from "@/components/filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockProtocols } from "@/lib/mock-data";
import { Protocol, SortOption } from "@/types";

export default function Home() {
  const [protocols] = useState<Protocol[]>(mockProtocols);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ethos");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  // Filter and sort protocols
  const filteredAndSortedProtocols = useMemo(() => {
    let filtered = [...protocols];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "ethos":
          return b.ethos.score - a.ethos.score;
        case "stock":
          return b.metrics.stock.value - a.metrics.stock.value;
        case "flow":
          return b.metrics.flow.value - a.metrics.flow.value;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [protocols, searchQuery, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Filters
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          currentSort={sortBy}
        />

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedProtocols.map((protocol) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onClick={() => setSelectedProtocol(protocol)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedProtocols.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                No protocols found
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <Button
          size="icon"
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </DashboardLayout>
  );
}
