-- Mettre à jour l'URL de l'avatar avec l'URL complète Lovable
UPDATE public.profiles 
SET 
  avatar_url = 'https://5affb644-50cf-4eab-bd5a-214a9bf11afd.sandbox.lovable.dev/lovable-uploads/ec28df7f-dc67-41ec-a64a-021dbd7af724.png',
  updated_at = now()
WHERE user_id = 'b156d8a6-9612-4e14-a837-087fb44385d9';