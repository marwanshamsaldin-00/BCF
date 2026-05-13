import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, User, Lock, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { setSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"employee" | "admin">("employee");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "admin") {
        if (username === "admin" && password === "admin123") {
          setSession({ role: "admin" });
          toast.success("Welcome, Administrator");
          navigate({ to: "/admin" });
        } else {
          toast.error("Invalid admin credentials");
        }
      } else {
        if (password !== "12345") {
          toast.error("Invalid password");
          return;
        }
        const { data, error } = await supabase
          .from("balances")
          .select("employee_id, full_name")
          .eq("employee_id", username.trim())
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          toast.error("Employee ID not found");
          return;
        }
        setSession({ role: "employee", employeeId: data.employee_id, fullName: data.full_name });
        toast.success(`Welcome, ${data.full_name}`);
        navigate({ to: "/employee" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md glass rounded-2xl p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to view your leave balances
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 mb-6">
            {(["employee", "admin"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative py-2.5 rounded-lg text-sm font-medium capitalize transition ${
                  tab === t ? "text-gold-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 gradient-gold rounded-lg glow-gold"
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {t === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {t}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                {tab === "admin" ? "Username" : "Employee ID"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tab === "admin" ? "admin" : "Your ID"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 transition"
                />
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-gold text-gold-foreground font-bold glow-gold hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </motion.button>
          </form>

          <p className="text-[11px] text-center text-muted-foreground mt-6">
            Employees: use your ID + password <span className="text-gold">12345</span>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
