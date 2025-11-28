import { Home, TrendingUp, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className = "" }: BottomNavProps) {
  const location = useLocation();
  
  const navItems = [
    { to: "/", icon: Home, label: "Home", tourAttr: "" },
    { to: "/progress", icon: TrendingUp, label: "Progress", tourAttr: "progress" },
    { to: "/community", icon: Users, label: "Community", tourAttr: "community" },
    { to: "/profile", icon: User, label: "Profile", tourAttr: "" },
  ];

  return (
    <div className={`fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-card/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg px-6 py-4 z-50 ${className}`}>
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          
          return (
            <Link 
              key={item.to} 
              to={item.to} 
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
              {...(item.tourAttr ? { 'data-tour': item.tourAttr } : {})}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
