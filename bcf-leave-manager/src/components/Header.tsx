import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { clearSession, getSession } from "@/lib/session";
import { useEffect, useState } from "react";
import bcfLogo from "@/assets/bcf-logo.png";

export function Header() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!getSession());
  }, []);

  const logout = () => {
    clearSession();
    navigate({ to: "/" });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full bg-white/95 flex items-center justify-center glow-gold overflow-hidden ring-1 ring-gold/40">
            <img src={bcfLogo} alt="BCF logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              Barzani Charity Foundation
            </h1>
            <p className="text-[11px] sm:text-xs text-gold tracking-widest uppercase">
              BCF Employee Portal
            </p>
          </div>
        </Link>
        {hasSession && (
          <button
            onClick={logout}
            className="glass px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </motion.header>
  );
}
