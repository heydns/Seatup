-- Create stadiums table
CREATE TABLE public.stadiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  capacity INTEGER,
  surface_type TEXT, -- grass, artificial, hybrid
  opened_year INTEGER,
  description TEXT,
  image_url TEXT,
  coordinates JSONB, -- {lat, lng}
  amenities TEXT[], -- parking, restaurant, shop, etc.
  contact_info JSONB, -- {phone, email, website}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Stadiums are publicly readable" 
ON public.stadiums 
FOR SELECT 
USING (true);

CREATE POLICY "Admin operations on stadiums" 
ON public.stadiums 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Add stadium_id to events table
ALTER TABLE public.event 
ADD COLUMN stadium_id UUID REFERENCES public.stadiums(id);

-- Add stadium_id to teams table  
ALTER TABLE public.teams 
ADD COLUMN stadium_id UUID REFERENCES public.stadiums(id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stadiums_updated_at
BEFORE UPDATE ON public.stadiums
FOR EACH ROW
EXECUTE FUNCTION public.update_teams_updated_at_column();

-- Insert sample stadiums data
INSERT INTO public.stadiums (name, city, address, capacity, surface_type, opened_year, description, image_url, coordinates, amenities, contact_info) VALUES
('Parc des Princes', 'Paris', '24 Rue du Commandant Guilbaud, 75016 Paris', 47929, 'grass', 1972, 'Stade mythique du Paris Saint-Germain, situé dans le 16e arrondissement de Paris.', '/lovable-uploads/parc-des-princes.jpg', '{"lat": 48.8414, "lng": 2.2530}', ARRAY['parking', 'restaurant', 'boutique', 'musée'], '{"phone": "+33 1 47 43 71 71", "website": "https://www.psg.fr"}'),

('Stade de France', 'Saint-Denis', '93200 Saint-Denis', 80698, 'grass', 1998, 'Plus grand stade de France, accueille les finales nationales et internationales.', '/lovable-uploads/stade-de-france.jpg', '{"lat": 48.9244, "lng": 2.3601}', ARRAY['parking', 'restaurant', 'boutique', 'transport'], '{"phone": "+33 1 55 93 00 00", "website": "https://www.stadefrance.com"}'),

('Stade Vélodrome', 'Marseille', '3 Boulevard Michelet, 13008 Marseille', 67394, 'grass', 1937, 'Temple du football marseillais, rénové pour l''Euro 2016.', '/lovable-uploads/velodrome.jpg', '{"lat": 43.2701, "lng": 5.3958}', ARRAY['parking', 'restaurant', 'boutique'], '{"phone": "+33 4 91 76 56 00", "website": "https://www.om.fr"}'),

('Allianz Arena', 'Munich', 'Werner-Heisenberg-Allee 25, 80939 Munich', 75000, 'grass', 2005, 'Stade moderne du Bayern Munich avec sa façade LED emblématique.', '/lovable-uploads/allianz-arena.jpg', '{"lat": 48.2188, "lng": 11.6242}', ARRAY['parking', 'restaurant', 'boutique', 'transport'], '{"phone": "+49 89 69931222", "website": "https://allianz-arena.com"}'),

('Wembley Stadium', 'Londres', 'Wembley, London HA9 0WS', 90000, 'grass', 2007, 'Temple du football anglais, accueille la finale de la FA Cup et de l''Euro.', '/lovable-uploads/wembley.jpg', '{"lat": 51.5560, "lng": -0.2796}', ARRAY['parking', 'restaurant', 'boutique', 'transport', 'hôtel'], '{"phone": "+44 20 8795 9000", "website": "https://www.wembleystadium.com"}'),

('Camp Nou', 'Barcelone', 'C. d''Arístides Maillol, 12, 08028 Barcelona', 99354, 'grass', 1957, 'Plus grand stade d''Europe, temple du FC Barcelone.', '/lovable-uploads/camp-nou.jpg', '{"lat": 41.3809, "lng": 2.1228}', ARRAY['parking', 'restaurant', 'boutique', 'musée'], '{"phone": "+34 902 18 99 00", "website": "https://www.fcbarcelona.com"}');

-- Update some teams with their stadium references
UPDATE public.teams 
SET stadium_id = (SELECT id FROM public.stadiums WHERE name = 'Parc des Princes')
WHERE organizer_name = 'Paris Saint-Germain' AND name LIKE '%PSG%';