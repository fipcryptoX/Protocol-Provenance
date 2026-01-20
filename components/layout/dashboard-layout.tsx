import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-cream">
      <Sidebar />
      <div className="flex-1 pl-[120px]">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
