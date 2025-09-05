-- Créer une table pour les membres d'équipe (MVP)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  status_badge TEXT DEFAULT 'Fans 🏟️',
  avatar_url TEXT DEFAULT '/src/assets/marvin-avatar.jpg',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique pour le MVP
CREATE POLICY "Team members are publicly readable" 
ON public.team_members 
FOR SELECT 
USING (true);

-- Créer 15 membres d'équipe pour le MVP
INSERT INTO public.team_members (first_name, last_name, email, city, postal_code, status_badge) VALUES
('Sophie', 'Martin', 'sophie.martin@gmail.com', 'Paris', '75001', 'VIP 🌟'),
('Thomas', 'Bernard', 'thomas.bernard@gmail.com', 'Lyon', '69001', 'Fans 🏟️'),
('Marie', 'Dubois', 'marie.dubois@gmail.com', 'Marseille', '13001', 'Expert 🎯'),
('Pierre', 'Moreau', 'pierre.moreau@gmail.com', 'Paris', '75015', 'Fans 🏟️'),
('Claire', 'Laurent', 'claire.laurent@gmail.com', 'Toulouse', '31000', 'VIP 🌟'),
('Julien', 'Simon', 'julien.simon@gmail.com', 'Paris', '75008', 'Expert 🎯'),
('Emma', 'Leroy', 'emma.leroy@gmail.com', 'Nice', '06000', 'Fans 🏟️'),
('Nicolas', 'Michel', 'nicolas.michel@gmail.com', 'Paris', '75011', 'VIP 🌟'),
('Camille', 'Garcia', 'camille.garcia@gmail.com', 'Bordeaux', '33000', 'Expert 🎯'),
('Antoine', 'Rodriguez', 'antoine.rodriguez@gmail.com', 'Paris', '75020', 'Fans 🏟️'),
('Léa', 'Martinez', 'lea.martinez@gmail.com', 'Lille', '59000', 'VIP 🌟'),
('Maxime', 'Lopez', 'maxime.lopez@gmail.com', 'Paris', '75004', 'Expert 🎯'),
('Sarah', 'Gonzalez', 'sarah.gonzalez@gmail.com', 'Strasbourg', '67000', 'Fans 🏟️'),
('Romain', 'Perez', 'romain.perez@gmail.com', 'Paris', '75017', 'VIP 🌟'),
('Chloé', 'Sanchez', 'chloe.sanchez@gmail.com', 'Nantes', '44000', 'Expert 🎯');