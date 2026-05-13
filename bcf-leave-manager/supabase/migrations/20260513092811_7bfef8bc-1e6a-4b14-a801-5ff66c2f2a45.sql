
CREATE TABLE public.balances (
  employee_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  annual_balance NUMERIC NOT NULL DEFAULT 0,
  sick_balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.announcements (
  id INT PRIMARY KEY DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO public.announcements (id, content) VALUES (1, 'Welcome to BCF Employee Portal');

ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read balances" ON public.balances FOR SELECT USING (true);
CREATE POLICY "public write balances" ON public.balances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "public write announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
