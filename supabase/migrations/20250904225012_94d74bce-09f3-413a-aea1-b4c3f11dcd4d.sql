-- Mettre à jour l'avatar avec l'image générée automatiquement
UPDATE public.profiles 
SET 
  avatar_url = '/src/assets/marvin-avatar.jpg',
  updated_at = now()
WHERE user_id = 'b156d8a6-9612-4e14-a837-087fb44385d9';