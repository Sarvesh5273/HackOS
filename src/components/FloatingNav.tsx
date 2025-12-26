import { useState, useEffect } from "react";
import { SITE_CONTENT } from "@/constants/content";
import { supabase } from "@/lib/supabase";
import { LogIn, LogOut, Home, Layers, Microscope, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthModalContext";

// Icon mapping for Mobile View
const ICONS: Record<string, React.ElementType> = {
  "Ops Center": Home,
  "Pipeline": Layers,
  "Analysis Lab": Microscope,
  "Uplink": Radio
};

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState("home");
  const { openLoginModal, user } = useAuth();
  const { toast } = useToast();
  const navItems = SITE_CONTENT.navigation;

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // Trigger when section is in middle of screen
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    navItems.forEach((item) => {
      const element = document.getElementById(item.href.slice(1));
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [navItems]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.getElementById(href.slice(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "System Offline", description: "You have been logged out." });
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] md:max-w-fit">
      <div className="navbar-glass rounded-full border border-border/40 px-3 py-2 md:px-2 flex items-center justify-between md:justify-center md:gap-1 shadow-lg shadow-black/10 backdrop-blur-xl bg-background/60">
        
        {/* Navigation Links */}
        <div className="flex items-center gap-1 md:gap-1 w-full justify-between md:justify-start">
            {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            const Icon = ICONS[item.label] || Home;

            return (
                <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`
                    relative px-3 md:px-5 py-2 rounded-full font-mono text-sm font-medium
                    transition-all duration-300 ease-out flex items-center justify-center
                    ${isActive 
                    ? "text-foreground bg-primary/10 md:bg-transparent" 
                    : "text-muted-foreground hover:text-foreground/80"
                    }
                `}
                >
                {/* Desktop: Show Text */}
                <span className="hidden md:block">{item.label}</span>
                
                {/* Mobile: Show Icon */}
                <Icon className={`block md:hidden w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                
                {/* Desktop: Active Indicator Dot */}
                {isActive && (
                    <span className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary glow-teal" />
                )}
                </a>
            );
            })}
        </div>

        {/* Divider (Hidden on very small screens to save space) */}
        <div className="hidden md:block w-px h-4 bg-border/50 mx-1" />

        {/* Auth Button */}
        <div className="ml-2 pl-2 border-l border-border/50 md:border-none md:ml-0 md:pl-0">
            {user ? (
            <button
                onClick={handleLogout}
                title="Disconnect Uplink"
                className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors"
            >
                <LogOut className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            ) : (
            <button
                onClick={openLoginModal}
                title="Admin Access"
                className="p-2 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
            >
                <LogIn className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            )}
        </div>
      </div>
    </nav>
  );
}