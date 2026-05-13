import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { RingProgress } from "@/components/RingProgress";
import { getSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, CalendarDays, Stethoscope, Sparkles } from "lucide-react";

export const Route = createFileRoute("/employee")({ component: EmployeePage });

function EmployeePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ annual: number; sick: number } | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "employee") {
      navigate({ to: "/" });
      return;
    }
    setName(s.fullName);
    (async () => {
      const [bal, ann] = await Promise.all([
        supabase.from("balances").select("*").eq("employee_id", s.employeeId).maybeSingle(),
        supabase.from("announcements").select("*").eq("id", 1).maybeSingle(),
      ]);
      if (bal.data) {
        setData({ annual: Number(bal.data.annual_balance), sick: Number(bal.data.sick_balance) });
        setLastUpdate(bal.data.updated_at);
      }
      if (ann.data) setNote(ann.data.content);
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-gold" />
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, <span className="text-gold">{name}</span>
          </h1>
        </motion.div>

        {note && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-gold rounded-2xl p-5 sm:p-6 flex items-start gap-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 shimmer pointer-events-none opacity-30" />
            <div className="relative w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-gold-foreground" />
            </div>
            <div className="relative">
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                Announcement
              </p>
              <p className="text-sm sm:text-base whitespace-pre-wrap">{note}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RingProgress
            value={data?.annual ?? 0}
            max={20}
            label="Annual Leave"
            color="gold"
            icon={<CalendarDays className="w-4 h-4" />}
          />
          <RingProgress
            value={data?.sick ?? 0}
            max={5}
            label="Sick Leave"
            color="royal"
            icon={<Stethoscope className="w-4 h-4" />}
          />
        </div>
      </main>
      <footer className="border-t border-white/5 py-5 text-center text-xs text-muted-foreground">
        Last Data Update:{" "}
        <span className="text-gold">
          {lastUpdate ? new Date(lastUpdate).toLocaleString() : "—"}
        </span>
      </footer>
    </div>
  );
}
