-- Correction des informations de l'Adidas Arena
UPDATE stadiums 
SET 
  city = 'Paris',
  address = '8 Rue de la Chapelle, 75018 Paris',
  coordinates = '{"lat": 48.8978, "lng": 2.3597}'::jsonb,
  description = 'Salle omnisports moderne située Porte de la Chapelle dans le 18e arrondissement de Paris, inaugurée en 2024 pour les Jeux Olympiques de Paris.'
WHERE id = 'b3f457d3-71cc-457d-986c-564d99c893b6';