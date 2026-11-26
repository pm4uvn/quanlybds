import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { DemoDataInit } from "./demo-data-init";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DemoDataInit />
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-8 px-4 py-5 lg:px-8 lg:py-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
