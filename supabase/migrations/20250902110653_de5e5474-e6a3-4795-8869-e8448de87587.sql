-- Mettre à jour l'image de U Arena avec la nouvelle image réelle
UPDATE stadiums 
SET image_url = '/lovable-uploads/u-arena-real.jpg'
WHERE name LIKE '%U Arena%' OR name LIKE '%Défense%';