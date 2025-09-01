-- Ajouter les images générées aux stades qui n'en ont pas
UPDATE stadiums 
SET image_url = '/public/lovable-uploads/roland-garros-modern.jpg'
WHERE id = 'c139c3ee-0012-4d3c-a1ca-a7ecb3853dd1';

UPDATE stadiums 
SET image_url = '/public/lovable-uploads/coubertin-modern.jpg'
WHERE id = '206be85d-6c39-4a13-b44f-6ba78b799df6';