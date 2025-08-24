-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  category TEXT NOT NULL, -- masculine, féminine, esport, etc.
  description TEXT,
  logo_url TEXT,
  colors JSONB, -- {primary: "#color", secondary: "#color"}
  founded INTEGER,
  stadium TEXT,
  coach TEXT,
  captain TEXT,
  league TEXT,
  achievements TEXT[],
  stats JSONB, -- {wins: 0, losses: 0, titles: 0, players_count: 0}
  social_media JSONB, -- {instagram: "url", twitter: "url", youtube: "url"}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (teams are public information)
CREATE POLICY "Teams are publicly readable" 
ON public.teams 
FOR SELECT 
USING (true);

-- Create policy for admin operations (only authenticated users can modify)
CREATE POLICY "Admin operations on teams" 
ON public.teams 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_teams_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teams_updated_at_column();

-- Insert example teams for Paris Saint-Germain
INSERT INTO public.teams (name, organizer_name, category, description, logo_url, colors, founded, stadium, coach, captain, league, achievements, stats, social_media) VALUES 
(
  'PSG Masculin',
  'Paris Saint-Germain',
  'Masculine',
  'L''équipe masculine du Paris Saint-Germain évolue en Ligue 1 et représente l''élite du football français avec des ambitions européennes.',
  '/lovable-uploads/7a7acfde-0c35-4b64-a3ee-20842182476b.png',
  '{"primary": "#004170", "secondary": "#FF0000"}',
  1970,
  'Parc des Princes',
  'Luis Enrique',
  'Marquinhos',
  'Ligue 1',
  ARRAY['Ligue 1', 'Coupe de France', 'Champions League'],
  '{"wins": 245, "losses": 85, "titles": 47, "players_count": 25}',
  '{"instagram": "https://instagram.com/psg", "twitter": "https://twitter.com/psg_officiel", "youtube": "https://youtube.com/psg"}'
),
(
  'PSG Féminin',
  'Paris Saint-Germain',
  'Féminine',
  'L''équipe féminine du Paris Saint-Germain évolue en D1 Arkema et est l''une des équipes les plus titrées d''Europe.',
  '/lovable-uploads/7a7acfde-0c35-4b64-a3ee-20842182476b.png',
  '{"primary": "#004170", "secondary": "#FF0000"}',
  1971,
  'Stade Jean Bouin',
  'Fabrice Abriel',
  'Grace Geyoro',
  'D1 Arkema',
  ARRAY['D1 Arkema', 'Coupe de France Féminine', 'Champions League Féminine'],
  '{"wins": 189, "losses": 42, "titles": 23, "players_count": 22}',
  '{"instagram": "https://instagram.com/psgfeminines", "twitter": "https://twitter.com/psgfeminines"}'
),
(
  'PSG Esport',
  'Paris Saint-Germain',
  'Esport',
  'La section esport du PSG compete dans plusieurs jeux vidéo dont FIFA, League of Legends et autres titres majeurs.',
  '/lovable-uploads/7a7acfde-0c35-4b64-a3ee-20842182476b.png',
  '{"primary": "#004170", "secondary": "#FF0000"}',
  2016,
  'PSG Campus',
  'Staff Esport PSG',
  'Divers selon les jeux',
  'LFL, FIFA Global Series',
  ARRAY['LFL', 'FIFA eWorld Cup'],
  '{"wins": 67, "losses": 23, "titles": 8, "players_count": 15}',
  '{"instagram": "https://instagram.com/psgesports", "twitter": "https://twitter.com/psgesports", "twitch": "https://twitch.tv/psgesports"}'
);