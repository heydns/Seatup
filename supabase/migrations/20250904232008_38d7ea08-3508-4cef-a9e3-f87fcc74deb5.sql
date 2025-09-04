-- Add favorite stadium and team fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN favorite_stadium_id UUID REFERENCES public.stadiums(id),
ADD COLUMN favorite_team_id UUID REFERENCES public.teams(id);

-- Find the Parc des Princes stadium ID and PSG team ID for updating Marvin's profile
-- First, let's update Marvin's profile with favorite stadium (Parc des Princes)
UPDATE public.profiles 
SET favorite_stadium_id = (
  SELECT id FROM public.stadiums 
  WHERE name ILIKE '%parc des princes%' 
  LIMIT 1
)
WHERE email = 'marvin.cadoret@gmail.com';

-- Update Marvin's profile with favorite team (PSG)
UPDATE public.profiles 
SET favorite_team_id = (
  SELECT id FROM public.teams 
  WHERE name ILIKE '%psg%' OR name ILIKE '%paris saint%' 
  LIMIT 1
)
WHERE email = 'marvin.cadoret@gmail.com';