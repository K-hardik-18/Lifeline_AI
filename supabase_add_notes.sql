-- Run this in your Supabase SQL Editor to add the Sticky Notes feature

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  date DATE DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create Policy
CREATE POLICY "Users can manage their own notes" ON public.notes 
FOR ALL USING (auth.uid() = user_id);
