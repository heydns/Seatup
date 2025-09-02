-- Mettre à jour U Arena avec l'image officielle spécifique
UPDATE stadiums 
SET image_url = '/lovable-uploads/u-arena-official.jpg', updated_at = now()
WHERE id = '07ca9e2e-b0a3-4ea5-961c-efd6560492f0';