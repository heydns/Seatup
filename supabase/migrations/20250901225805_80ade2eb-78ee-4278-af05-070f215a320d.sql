-- Corriger l'URL du Parc des Princes avec le format complet qui fonctionne (comme l'Accor Arena)
UPDATE stadiums 
SET image_url = 'https://id-preview--5affb644-50cf-4eab-bd5a-214a9bf11afd.lovable.app/lovable-uploads/708fe03d-b469-40f0-98df-9d587d8c6fb0.png'
WHERE id = '94b75378-8d39-452a-b212-5cf5bf190003';