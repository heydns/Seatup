-- Mettre à jour l'avatar avec la nouvelle image uploadée
UPDATE public.profiles 
SET 
  avatar_url = '/lovable-uploads/4fd1e1b2-9e43-4e19-949c-60c2e215ce87.png',
  updated_at = now()
WHERE user_id = 'b156d8a6-9612-4e14-a837-087fb44385d9';