-- Mettre à jour l'image du Stade Pierre de Coubertin
UPDATE stadiums 
SET image_url = '/lovable-uploads/pierre-coubertin-real.jpg', updated_at = now()
WHERE id = '206be85d-6c39-4a13-b44f-6ba78b799df6';