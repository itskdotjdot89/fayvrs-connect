import { ReactNode } from "react";
import { MobileTopBar } from "./MobileTopBar";
import { MobileBottomNav } from "./MobileBottomNav";

interface MobileLayoutProps {
  children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <MobileTopBar />
      
      {/* Main Content with padding for fixed header and bottom nav */}
      <main className="flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      
      <MobileBottomNav />
    </div>
  );
};
