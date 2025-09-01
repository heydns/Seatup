-- D'abord, retirer les références aux stades dans les teams
UPDATE teams SET stadium_id = NULL;

-- Supprimer tous les stades existants
DELETE FROM stadiums;

-- Ajouter seulement les vrais stades des événements
INSERT INTO stadiums (name, city, address, capacity, opened_year, surface_type, description, image_url, amenities, contact_info, coordinates) VALUES
(
  'Adidas Arena',
  'Paris La Défense',
  '52 Boulevard de Pesaro, 92000 Nanterre',
  8000,
  2024,
  'Parquet',
  'Salle omnisports moderne située à La Défense, inaugurée en 2024 pour les Jeux Olympiques de Paris.',
  '/public/lovable-uploads/adidas-arena.jpg',
  ARRAY['Boutique', 'Restaurant', 'Parking', 'Accès PMR', 'WiFi'],
  '{"phone": "+33 1 47 76 40 00", "email": "contact@adidas-arena.fr", "website": "https://adidas-arena.com"}',
  '{"lat": 48.8944, "lng": 2.2297}'
),
(
  'La Défense U Arena',
  'Nanterre',
  '99 Avenue de Paris, 92000 Nanterre',
  40000,
  2017,
  'Pelouse synthétique',
  'Plus grande salle couverte d''Europe, U Arena accueille le Racing 92 et de grands événements sportifs et culturels.',
  '/public/lovable-uploads/u-arena.jpg',
  ARRAY['Boutique', 'Restaurant', 'Parking', 'Accès PMR', 'WiFi', 'Écrans géants'],
  '{"phone": "+33 1 40 97 79 79", "website": "https://u-arena.com"}',
  '{"lat": 48.8965, "lng": 2.2186}'
),
(
  'Palais des Sports Marcel Cerdan',
  'Levallois-Perret',
  '2 Rue Aristide Briand, 92300 Levallois-Perret',
  4000,
  1992,
  'Parquet',
  'Salle de sports polyvalente accueillant notamment les matchs du Levallois Metropolitans de basketball.',
  '/public/lovable-uploads/marcel-cerdan.jpg',
  ARRAY['Boutique', 'Restaurant', 'Parking', 'Accès PMR'],
  '{"phone": "+33 1 47 15 76 00"}',
  '{"lat": 48.8937, "lng": 2.2877}'
),
(
  'Parc des Princes',
  'Paris',
  '24 Rue du Commandant Guilbaud, 75016 Paris',
  47929,
  1972,
  'Pelouse naturelle',
  'Stade mythique du Paris Saint-Germain, le Parc des Princes est l''un des temples du football français.',
  '/public/lovable-uploads/parc-des-princes.jpg',
  ARRAY['Boutique', 'Restaurant', 'Parking', 'Accès PMR', 'WiFi', 'Musée'],
  '{"phone": "+33 1 47 43 71 71", "website": "https://www.psg.fr"}',
  '{"lat": 48.8413, "lng": 2.2530}'
),
(
  'Stade Pierre de Coubertin',
  'Paris',
  '82 Avenue Georges Lafont, 75016 Paris',
  4500,
  1937,
  'Parquet',
  'Salle historique parisienne accueillant de nombreuses compétitions de tennis, basketball et autres sports indoor.',
  '/public/lovable-uploads/pierre-coubertin.jpg',
  ARRAY['Restaurant', 'Parking', 'Accès PMR'],
  '{"phone": "+33 1 45 27 79 12"}',
  '{"lat": 48.8477, "lng": 2.2516}'
),
(
  'Accor Arena',
  'Paris',
  '8 Boulevard de Bercy, 75012 Paris',
  20300,
  1984,
  'Parquet modulable',
  'Anciennement Palais Omnisports de Paris-Bercy, l''AccorHotels Arena est une salle mythique pour les grands événements sportifs et musicaux.',
  '/public/lovable-uploads/accor-arena.jpg',
  ARRAY['Boutique', 'Restaurant', 'Parking', 'Accès PMR', 'WiFi', 'Écrans géants'],
  '{"phone": "+33 1 40 02 60 60", "website": "https://www.accorhotels-arena.com"}',
  '{"lat": 48.8387, "lng": 2.3789}'
),
(
  'Stade Roland-Garros',
  'Paris',
  '2 Avenue Gordon Bennett, 75016 Paris',
  15225,
  1928,
  'Terre battue',
  'Temple mondial du tennis sur terre battue, Roland-Garros accueille chaque année le tournoi du Grand Chelem français.',
  '/public/lovable-uploads/roland-garros.jpg',
  ARRAY['Boutique', 'Restaurant', 'Parking', 'Accès PMR', 'WiFi', 'Musée'],
  '{"phone": "+33 1 47 43 48 00", "website": "https://www.rolandgarros.com"}',
  '{"lat": 48.8467, "lng": 2.2517}'
);

-- Mettre à jour les événements pour les relier aux stades correspondants
UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'Adidas Arena' LIMIT 1) 
WHERE location ILIKE '%adidas arena%';

UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'La Défense U Arena' LIMIT 1) 
WHERE location ILIKE '%défense u arena%';

UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'Palais des Sports Marcel Cerdan' LIMIT 1) 
WHERE location ILIKE '%palais des sports marcel cerdan%';

UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'Parc des Princes' LIMIT 1) 
WHERE location ILIKE '%parc des princes%';

UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'Stade Pierre de Coubertin' LIMIT 1) 
WHERE location ILIKE '%pierre de coubertin%';

UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'Accor Arena' LIMIT 1) 
WHERE location ILIKE '%accor arena%';

UPDATE event SET stadium_id = (SELECT id FROM stadiums WHERE name = 'Stade Roland-Garros' LIMIT 1) 
WHERE location ILIKE '%roland%garros%';