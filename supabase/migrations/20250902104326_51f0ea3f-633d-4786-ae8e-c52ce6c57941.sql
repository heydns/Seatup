-- Normaliser les chemins d'images des stades pour assurer la cohérence
UPDATE stadiums 
SET image_url = '/lovable-uploads/2a65224f-97c7-457b-a5e7-697fb6fb61f3.png'
WHERE id = 'ebedfac1-cb73-4536-a8f6-095bfaf34042'; -- Accor Arena

UPDATE stadiums 
SET image_url = '/lovable-uploads/adidas-arena.jpg'
WHERE id = 'b3f457d3-71cc-457d-986c-564d99c893b6'; -- Adidas Arena

UPDATE stadiums 
SET image_url = '/lovable-uploads/u-arena.jpg'
WHERE id = '07ca9e2e-b0a3-4ea5-961c-efd6560492f0'; -- La Défense U Arena

UPDATE stadiums 
SET image_url = '/lovable-uploads/marcel-cerdan.jpg'
WHERE id = 'b0da60db-85da-4343-9132-8d1ec703d004'; -- Palais des Sports Marcel Cerdan

-- Parc des Princes est déjà correct
-- UPDATE stadiums SET image_url = '/lovable-uploads/parc-des-princes-night.jpg' WHERE id = '94b75378-8d39-452a-b212-5cf5bf190003';

UPDATE stadiums 
SET image_url = '/lovable-uploads/coubertin-modern.jpg'
WHERE id = '206be85d-6c39-4a13-b44f-6ba78b799df6'; -- Stade Pierre de Coubertin (1)

UPDATE stadiums 
SET image_url = '/lovable-uploads/pierre-coubertin.jpg'
WHERE id = '88192be6-aebd-4626-ba70-71128386e577'; -- Stade Pierre de Coubertin (2)

UPDATE stadiums 
SET image_url = '/lovable-uploads/roland-garros.jpg'
WHERE id = '7e46a3f9-de4d-4588-abf5-2e4243bcf061'; -- Stade Roland-Garros (1)

UPDATE stadiums 
SET image_url = '/lovable-uploads/roland-garros-modern.jpg'
WHERE id = 'c139c3ee-0012-4d3c-a1ca-a7ecb3853dd1'; -- Stade Roland-Garros (2)