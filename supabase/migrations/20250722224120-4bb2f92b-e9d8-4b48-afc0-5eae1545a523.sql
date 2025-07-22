-- Create the Event table with all necessary columns
CREATE TABLE public.Event (
  ID_event BIGSERIAL PRIMARY KEY,
  Event TEXT,
  Date TEXT,
  Organization TEXT,
  Sport TEXT,
  Competition TEXT,
  Location TEXT,
  Adress TEXT,
  Access TEXT,
  Link TEXT,
  Original_Price TEXT,
  Our_Price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.Event ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to events
CREATE POLICY "Events are publicly readable" 
ON public.Event 
FOR SELECT 
USING (true);

-- Create a policy for admin operations (will be restricted when auth is implemented)
CREATE POLICY "Admin operations on events" 
ON public.Event 
FOR ALL 
USING (true);

-- Add events from parisjetaime.com and homepage events
INSERT INTO public.Event (Event, Date, Organization, Sport, Competition, Location, Adress, Access, Link, Original_Price, Our_Price) VALUES
('10 km du bois de Boulogne', '2025-10-11', 'Course à pied', 'Course à pied', 'Course populaire', 'Bois de Boulogne', 'Bois de Boulogne, Paris', 'Public', 'https://parisjetaime.com/evenement/course-10-km-bois-de-boulogne-e825', '25', '20'),
('2025 Street League Skateboarding Championship', '2025-10-12', 'Street League Skateboarding', 'Skateboard', 'Championnat mondial', 'Stade Roland-Garros', 'Stade Roland-Garros, Paris', 'Ticketing', 'https://parisjetaime.com/evenement/sls-championshiptour-roland-garros-e794', '75', '60'),
('20 km de Paris', '2025-08-30', 'Course à pied', 'Course à pied', 'Course populaire', 'Tout Paris', 'Pont d''Iena - Tour Eiffel', 'Public', 'https://parisjetaime.com/evenement/20km-de-paris-e054', '30', '25'),
('Aquathlon Paris', '2025-08-25', 'Triathlon', 'Aquathlon', 'Course populaire', 'Île aux Cygnes', 'Île aux Cygnes, Paris', 'Public', 'https://parisjetaime.com/evenement/aquathlon-paris-e1630', '40', '35'),
('Championnats du monde de badminton 2025', '2025-10-26', 'BWF', 'Badminton', 'Championnats du monde', 'adidas arena', 'adidas arena, Paris La Défense', 'Ticketing', 'https://parisjetaime.com/evenement/championnats-du-monde-badminton-e1342', '120', '95'),
('Battle Pro - Finale internationale', '2026-04-01', 'Battle Pro', 'Breakdance', 'Finale internationale', 'Théâtre du Châtelet', 'Théâtre du Châtelet, Paris', 'Ticketing', 'https://parisjetaime.com/evenement/battle-pro-finale-internationale-e557', '65', '50'),
('Finales de la coupe de France de basket', '2025-08-20', 'FFBB', 'Basketball', 'Coupe de France', 'Accor Arena', 'Accor Arena, Paris Bercy', 'Ticketing', 'https://billetterie.ffbb.com/fr', '85', '70'),
('Eco Trail Paris', '2025-06-24', 'Eco Trail', 'Trail', 'Course nature', 'Paris et Ile-de-France', 'Départ Paris', 'Public', 'https://parisjetaime.com/evenement/eco-trail-paris-e226', '45', '35'),
('Championnats d''Europe de natation 2026', '2026-08-01', 'LEN', 'Natation', 'Championnats d''Europe', 'Centre Aquatique Olympique de Saint-Denis', 'Centre Aquatique Olympique, Saint-Denis', 'Ticketing', 'https://parisjetaime.com/evenement/championnats-d-europe-de-natation-2026-e1485', '55', '45'),
('Championnat d''Europe de Flag Football 2025', '2025-09-25', 'IFAF', 'Flag Football', 'Championnat d''Europe', 'Parc Interdépartemental des Sports de Choisy', 'Choisy Paris Val-de-Marne', 'Ticketing', 'https://parisjetaime.com/evenement/championnat-d-europe-de-flag-football-2025-e1486', '35', '28'),
('PSG vs SCO Angers - Journée 1 Ligue 1', '2025-08-24', 'PSG', 'Football', 'Ligue 1', 'Parc des Princes', 'Parc des Princes, Paris', 'Ticketing', 'https://www.psg.fr', '45', '36'),
('Paris Basketball - Abonnement 25/26', '2025-07-27', 'Paris Basketball', 'Basketball', 'Jeep Élite', 'Adidas Arena', 'Adidas Arena, Paris La Défense', 'Ticketing', 'https://parisbasketball.com', '250', '200'),
('Rolex Paris Master 2025', '2025-07-28', 'ATP', 'Tennis', 'Masters 1000', 'La Défense U Arena', 'La Défense Arena, Nanterre', 'Ticketing', 'https://www.rolexparismasters.com', '80', '64'),
('Hoka Semi Marathon Paris 2025', '2025-07-29', 'Schneider Electric', 'Course à pied', 'Semi-marathon', 'Ville de Paris', 'Départ Château de Vincennes', 'Public', 'https://www.semideparis.com', '55', '44'),
('Les Mariannes 92 - Saison 25/26', '2025-07-30', 'Les Mariannes 92', 'Volleyball', 'Ligue A', 'Le palais des sports Marcel Cerdan', 'Palais des sports Marcel Cerdan, Levallois', 'Ticketing', 'https://lesmariannes92.fr', '105', '84'),
('PSG Handball - Dunkerque / Journée 1 StarLigue', '2025-09-07', 'PSG Handball', 'Handball', 'StarLigue', 'Stade Pierre de Coubertin', 'Stade Pierre de Coubertin, Paris', 'Ticketing', 'https://www.psghand.com', '35', '28');