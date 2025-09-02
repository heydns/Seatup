-- Mettre à jour l'image du Stade Roland-Garros avec l'image officielle
UPDATE stadiums 
SET image_url = '/lovable-uploads/roland-garros-real.jpg', updated_at = now()
WHERE id = '7e46a3f9-de4d-4588-abf5-2e4243bcf061';