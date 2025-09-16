-- Créer un utilisateur organisateur pour les tests
-- Note: En production, les utilisateurs s'inscrivent via l'interface

-- Insérer dans auth.users (utilisateur Supabase)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'marvin.organizer@gmail.com',
  crypt('password123', gen_salt('bf')), -- Mot de passe: password123
  now(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Marvin", "last_name": "Organizer", "role": "organizer_admin", "company_name": "PSG Sports Club"}',
  false,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false
)
ON CONFLICT (email) DO NOTHING;

-- Le profil sera automatiquement créé par le trigger handle_new_user()
-- qui utilise les métadonnées pour créer l'entrée dans profiles

-- Créer un organisateur dans la table organizers
INSERT INTO public.organizers (
  user_id,
  organization_name,
  description
)
SELECT 
  u.id,
  'PSG Sports Club',
  'Club de football professionnel parisien organisant des événements sportifs exclusifs pour les supporters et entreprises partenaires.'
FROM auth.users u
WHERE u.email = 'marvin.organizer@gmail.com'
ON CONFLICT (user_id) DO NOTHING;