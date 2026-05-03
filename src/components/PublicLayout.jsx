import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Box, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { path: "/home", label: "Home" },
  { path: "/features", label: "Tính năng" },
  { path: "/demo", label: "Demo" },
  { path: "/contact", label: "Liên hệ" },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Box className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">
                SmartBox
              </span>
              <span className="text-sm text-primary font-medium">
                {" "}
                E-Logistics
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-primary"
            >
              Dashboard Admin
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Box className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              SmartBox E-Logistics © 2026
            </span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link to="/features" className="hover:text-foreground">
              Tính năng
            </Link>
            <Link to="/demo" className="hover:text-foreground">
              Demo
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Liên hệ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
