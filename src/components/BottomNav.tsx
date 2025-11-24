import { Home, TrendingUp, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className = "" }: BottomNavProps) {
  const location = useLocation();
  
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/progress", icon: TrendingUp, label: "Progress" },
    { to: "/community", icon: Users, label: "Community" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 ${className}`}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-1">
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
