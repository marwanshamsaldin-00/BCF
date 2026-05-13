import { motion } from "framer-motion";

interface Props {
  value: number;
  max: number;
  label: string;
  color: "gold" | "royal";
  icon: React.ReactNode;
}

export function RingProgress({ value, max, label, color, icon }: Props) {
  const safe = Math.max(0, Math.min(value, max));
  const pct = max > 0 ? safe / max : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const stroke = color === "gold" ? "var(--gold)" : "var(--royal)";
  const glassClass = color === "gold" ? "glass-gold" : "glass-royal";
  const textColor = color === "gold" ? "text-gold" : "text-royal";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`${glassClass} rounded-2xl p-6 sm:p-8 flex flex-col items-center`}
    >
      <div className="flex items-center gap-2 mb-4 text-sm uppercase tracking-widest font-semibold">
        <span className={textColor}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            stroke="oklch(1 0 0 / 0.08)" strokeWidth="12" fill="none"
          />
          <motion.circle
            cx="80" cy="80" r={radius}
            stroke={stroke} strokeWidth="12" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${textColor}`}>{safe}</span>
          <span className="text-xs text-muted-foreground mt-1">of {max} days</span>
        </div>
      </div>
    </motion.div>
  );
}
