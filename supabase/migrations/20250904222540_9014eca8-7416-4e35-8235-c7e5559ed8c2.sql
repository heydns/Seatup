-- Mettre à jour le profil existant avec prénom et nom
UPDATE public.profiles 
SET 
  first_name = 'Marvin',
  last_name = 'Cadoret',
  updated_at = now()
WHERE user_id = auth.uid();