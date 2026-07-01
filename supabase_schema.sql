-- Run this exactly as it is in the Supabase SQL Editor

-- 1. Create Tasks Table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Routines Table
CREATE TABLE public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'health',
  priority TEXT DEFAULT 'medium',
  days JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  logs JSONB DEFAULT '{}'::jsonb,
  "startDate" DATE DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS) so users can only see their own data
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
CREATE POLICY "Users can manage their own tasks" ON public.tasks 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own routines" ON public.routines 
FOR ALL USING (auth.uid() = user_id);
