import { NavLink } from "react-router-dom";
import { Home, MapPin, Plus, MessageCircle, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
  const { user, activeRole } = useAuth();

  const navItems = [
    {
      to: "/",
      icon: Home,
      label: "Home",
      show: true,
    },
    {
      to: "/feed",
      icon: MapPin,
      label: "Browse",
      show: true,
    },
    {
      to: "/post-request",
      icon: Plus,
      label: "Post",
      show: !!user,
      isCenter: true,
    },
    {
      to: "/conversations",
      icon: MessageCircle,
      label: "Messages",
      show: !!user,
    },
    {
      to: activeRole === 'provider' ? "/provider-dashboard" : "/requester-dashboard",
      icon: activeRole === 'provider' ? LayoutDashboard : User,
      label: "Dashboard",
      show: !!user,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive && !item.isCenter && "text-primary",
                !isActive && !item.isCenter && "text-muted-foreground",
                item.isCenter && "relative -top-2"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center transition-all duration-200",
                    item.isCenter
                      ? "w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/30"
                      : "w-10 h-10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "transition-all duration-200",
                      item.isCenter ? "w-6 h-6 text-white" : "w-6 h-6",
                      isActive && !item.isCenter && "scale-110"
                    )}
                    strokeWidth={isActive && !item.isCenter ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all duration-200",
                    isActive && !item.isCenter && "font-semibold",
                    item.isCenter && "text-primary"
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
