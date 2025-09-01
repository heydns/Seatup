-- Corriger l'URL du Parc des Princes avec le chemin local qui fonctionne
UPDATE stadiums 
SET image_url = '/public/lovable-uploads/parc-des-princes.jpg'
WHERE id = '94b75378-8d39-452a-b212-5cf5bf190003';