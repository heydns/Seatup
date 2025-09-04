-- Mettre à jour le profil avec les bonnes données
UPDATE public.profiles 
SET 
  first_name = 'Marvin',
  last_name = 'Cadoret',
  updated_at = now()
WHERE user_id = 'b156d8a6-9612-4e14-a837-087fb44385d9';