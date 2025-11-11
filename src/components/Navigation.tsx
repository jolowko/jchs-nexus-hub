import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GraduationCap, Home, MessageSquare, BookOpen, Brain, Gamepad2, ShoppingBag, Trophy, Settings, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/homework", label: "Homework", icon: BookOpen },
    { to: "/ai-helper", label: "Helper", icon: Brain },
    { to: "/games", label: "Games", icon: Gamepad2 },
    { to: "/merch", label: "Merch", icon: ShoppingBag },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/profile", label: "Profile", icon: Settings },
  ];

  if (isAdmin) {
    links.push({ to: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">JCHS NEXUS</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="md:hidden">
            {/* Mobile menu will be added later */}
          </div>
        </div>
      </div>
    </nav>
  );
}
