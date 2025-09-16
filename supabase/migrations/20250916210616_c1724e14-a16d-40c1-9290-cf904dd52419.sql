-- Créer seulement l'entrée organisateur avec un ID temporaire
-- L'utilisateur devra s'inscrire normalement via l'interface

-- D'abord, créons un profil temporaire pour l'organisateur test
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  company_name,
  role
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- UUID temporaire
  'marvin.organizer@gmail.com',
  'Marvin',
  'Organizer',
  'PSG Sports Club',
  'organizer_admin'
) 
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_name = EXCLUDED.company_name,
  role = EXCLUDED.role;

-- Créer l'entrée organisateur correspondante
INSERT INTO public.organizers (
  user_id,
  organization_name,
  description
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'PSG Sports Club',
  'Club de football professionnel parisien organisant des événements sportifs exclusifs pour les supporters et entreprises partenaires.'
)
ON CONFLICT (user_id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  description = EXCLUDED.description;