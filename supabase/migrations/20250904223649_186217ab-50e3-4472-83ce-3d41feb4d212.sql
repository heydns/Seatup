-- Mettre à jour le profil avec l'URL de l'avatar
UPDATE public.profiles 
SET 
  avatar_url = '/lovable-uploads/ec28df7f-dc67-41ec-a64a-021dbd7af724.png',
  updated_at = now()
WHERE user_id = 'b156d8a6-9612-4e14-a837-087fb44385d9';