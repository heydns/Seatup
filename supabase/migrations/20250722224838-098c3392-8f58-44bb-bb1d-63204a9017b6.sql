-- Update existing events to match homepage events with correct IDs and add missing ones
UPDATE public.Event SET 
  Event = 'Paris Basketball - Abonnement 25/26',
  Date = '2025-07-27',
  Organization = 'Paris Basketball',
  Sport = 'Basketball',
  Competition = 'Jeep Élite',
  Location = 'Adidas Arena',
  Adress = 'Adidas Arena, Paris La Défense',
  Access = 'Ticketing',
  Link = 'https://parisbasketball.com',
  Original_Price = '250',
  Our_Price = '200'
WHERE ID_event = 12;

UPDATE public.Event SET 
  Event = 'Rolex Paris Master 2025',
  Date = '2025-07-28',
  Organization = 'ATP',
  Sport = 'Tennis',
  Competition = 'Masters 1000',
  Location = 'La Défense U Arena',
  Adress = 'La Défense Arena, Nanterre',
  Access = 'Ticketing',
  Link = 'https://www.rolexparismasters.com',
  Original_Price = '80',
  Our_Price = '64'
WHERE ID_event = 13;

UPDATE public.Event SET 
  Event = 'Hoka Semi Marathon Paris 2025',
  Date = '2025-07-29',
  Organization = 'Schneider Electric',
  Sport = 'Course à pied',
  Competition = 'Semi-marathon',
  Location = 'Ville de Paris',
  Adress = 'Départ Château de Vincennes',
  Access = 'Public',
  Link = 'https://www.semideparis.com',
  Original_Price = '55',
  Our_Price = '44'
WHERE ID_event = 14;

UPDATE public.Event SET 
  Event = 'Les Mariannes 92 - Saison 25/26',
  Date = '2025-07-30',
  Organization = 'Les Mariannes 92',
  Sport = 'Volleyball',
  Competition = 'Ligue A',
  Location = 'Le palais des sports Marcel Cerdan',
  Adress = 'Palais des sports Marcel Cerdan, Levallois',
  Access = 'Ticketing',
  Link = 'https://lesmariannes92.fr',
  Original_Price = '105',
  Our_Price = '84'
WHERE ID_event = 15;

UPDATE public.Event SET 
  Event = 'PSG Handball - Dunkerque / Journée 1 StarLigue',
  Date = '2025-09-07',
  Organization = 'PSG Handball',
  Sport = 'Handball',
  Competition = 'StarLigue',
  Location = 'Stade Pierre de Coubertin',
  Adress = 'Stade Pierre de Coubertin, Paris',
  Access = 'Ticketing',
  Link = 'https://www.psghand.com',
  Original_Price = '35',
  Our_Price = '28'
WHERE ID_event = 16;