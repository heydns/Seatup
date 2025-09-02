-- Mettre à jour l'image du deuxième Stade Pierre de Coubertin avec la même image
UPDATE stadiums 
SET image_url = '/lovable-uploads/pierre-coubertin-real.jpg', updated_at = now()
WHERE id = '88192be6-aebd-4626-ba70-71128386e577';