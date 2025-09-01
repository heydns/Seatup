-- Fix RLS policies for Event table
CREATE POLICY "Events are publicly readable" 
ON public."Event" 
FOR SELECT 
USING (true);

CREATE POLICY "Admin operations on events" 
ON public."Event" 
FOR ALL 
USING (auth.role() = 'authenticated');