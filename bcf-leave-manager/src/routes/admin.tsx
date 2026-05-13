import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Header } from "@/components/Header";
import { getSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Megaphone, Save, CheckCircle2, Users, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminPage });

interface Row {
  employee_id: string;
  full_name: string;
  annual_balance: number;
  sick_balance: number;
}

function AdminPage() {
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [parsedRows, setParsedRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [count, setCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      navigate({ to: "/" });
      return;
    }
    void loadMeta();
  }, [navigate]);

  const loadMeta = async () => {
    const [a, b] = await Promise.all([
      supabase.from("announcements").select("*").eq("id", 1).maybeSingle(),
      supabase.from("balances").select("employee_id, updated_at").order("updated_at", { ascending: false }).limit(1),
    ]);
    if (a.data) setAnnouncement(a.data.content);
    const { count: total } = await supabase.from("balances").select("*", { count: "exact", head: true });
    setCount(total ?? 0);
    if (b.data && b.data.length > 0) setLastUpdate(b.data[0].updated_at);
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      const rows: Row[] = json
        .map((r) => {
          const id = String(r.ID ?? r.id ?? r.Id ?? "").trim();
          const name = String(r.Name ?? r.name ?? r.NAME ?? "").trim();
          const annual = Number(r.Annual_Balance ?? r.annual_balance ?? r["Annual Balance"] ?? 0);
          const sick = Number(r.Sick_Balance ?? r.sick_balance ?? r["Sick Balance"] ?? 0);
          return { employee_id: id, full_name: name, annual_balance: annual, sick_balance: sick };
        })
        .filter((r) => r.employee_id && r.full_name);
      if (rows.length === 0) {
        toast.error("No valid rows. Required columns: ID, Name, Annual_Balance, Sick_Balance");
        return;
      }
      setParsedRows(rows);
      toast.success(`Parsed ${rows.length} employees from ${file.name}`);
    } catch (e: any) {
      toast.error(`Failed to parse: ${e.message}`);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const sync = async () => {
    if (parsedRows.length === 0) return;
    setUploading(true);
    try {
      const stamped = parsedRows.map((r) => ({ ...r, updated_at: new Date().toISOString() }));
      const { error } = await supabase.from("balances").upsert(stamped, { onConflict: "employee_id" });
      if (error) throw error;
      toast.success(`Synced ${stamped.length} records to the cloud`);
      setParsedRows([]);
      setFileName(null);
      await loadMeta();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from("announcements")
        .upsert({ id: 1, content: announcement, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Announcement updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Console</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage leave balances and global announcements
            </p>
          </div>
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
            <Users className="w-5 h-5 text-royal" />
            <div>
              <div className="text-xl font-bold">{count}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Employees
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold">Excel Upload</h2>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition p-10 text-center ${
              dragOver ? "border-gold bg-gold/5 glow-gold" : "border-white/15 hover:border-gold/40 hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="mx-auto w-14 h-14 rounded-full gradient-gold flex items-center justify-center mb-4 glow-gold">
              <Upload className="w-7 h-7 text-gold-foreground" />
            </div>
            <p className="font-semibold">
              {fileName ? fileName : "Drop your .xlsx here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Required columns: ID · Name · Annual_Balance · Sick_Balance
            </p>
          </div>

          <AnimatePresence>
            {parsedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="glass rounded-xl overflow-hidden">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 sticky top-0">
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3 text-right">Annual</th>
                          <th className="px-4 py-3 text-right">Sick</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((r, i) => (
                          <tr key={i} className="border-t border-white/5">
                            <td className="px-4 py-2 font-mono text-gold">{r.employee_id}</td>
                            <td className="px-4 py-2">{r.full_name}</td>
                            <td className="px-4 py-2 text-right">{r.annual_balance}</td>
                            <td className="px-4 py-2 text-right">{r.sick_balance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {parsedRows.length} rows ready · existing records will be overwritten
                  </p>
                  <button
                    onClick={sync}
                    disabled={uploading}
                    className="px-5 py-2.5 rounded-xl gradient-gold text-gold-foreground font-semibold glow-gold hover:brightness-110 transition flex items-center gap-2 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Sync to Cloud
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-4">
              Last data update: {new Date(lastUpdate).toLocaleString()}
            </p>
          )}
        </motion.section>

        {/* Announcement */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-royal" />
            <h2 className="text-lg font-semibold">Global Announcement</h2>
          </div>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={4}
            placeholder="Write a note visible to all employees…"
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-royal/50 focus:outline-none focus:ring-2 focus:ring-royal/20 transition resize-none"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="px-5 py-2.5 rounded-xl gradient-royal text-royal-foreground font-semibold glow-royal hover:brightness-110 transition flex items-center gap-2 disabled:opacity-60"
            >
              {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Announcement
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
