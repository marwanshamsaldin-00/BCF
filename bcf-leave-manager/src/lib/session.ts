export type Session =
  | { role: "admin" }
  | { role: "employee"; employeeId: string; fullName: string };

const KEY = "bcf_session";

export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (s: Session) => {
  localStorage.setItem(KEY, JSON.stringify(s));
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
};
