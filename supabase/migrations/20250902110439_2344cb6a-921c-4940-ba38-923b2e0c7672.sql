-- Utiliser l'image réelle de U Arena téléchargée
UPDATE stadiums 
SET image_url = '/lovable-uploads/u-arena-real.jpg'
WHERE name LIKE '%U Arena%' OR name LIKE '%Défense%';