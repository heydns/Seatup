-- Insert 3 sample groups for Marvin Cadoret
-- Note: We'll use a placeholder user_id that will need to be updated with the actual auth user ID
INSERT INTO public.groups (name, description, created_by, created_at) VALUES
(
  'Équipe Marketing Digital',
  'Groupe pour coordonner les campagnes et événements marketing',
  '00000000-0000-0000-0000-000000000001'::uuid,
  now()
),
(
  'Amis du Sport',
  'Passionnés de sport pour organiser des sorties ensemble',
  '00000000-0000-0000-0000-000000000001'::uuid,
  now()
),
(
  'Famille Cadoret',
  'Groupe familial pour partager les moments et organiser les réunions',
  '00000000-0000-0000-0000-000000000001'::uuid,
  now()
);

-- Add some random team members to each group
-- We'll add members to the first group (Marketing Digital)
INSERT INTO public.group_members (group_id, member_id, added_by)
SELECT 
  g.id as group_id,
  tm.id as member_id,
  '00000000-0000-0000-0000-000000000001'::uuid as added_by
FROM public.groups g
CROSS JOIN (
  SELECT id FROM public.team_members 
  WHERE first_name IN ('Sophie', 'Thomas', 'Marie', 'Pierre')
  LIMIT 4
) tm
WHERE g.name = 'Équipe Marketing Digital';

-- Add members to the second group (Amis du Sport)
INSERT INTO public.group_members (group_id, member_id, added_by)
SELECT 
  g.id as group_id,
  tm.id as member_id,
  '00000000-0000-0000-0000-000000000001'::uuid as added_by
FROM public.groups g
CROSS JOIN (
  SELECT id FROM public.team_members 
  WHERE first_name IN ('Antoine', 'Camille', 'Julien')
  LIMIT 3
) tm
WHERE g.name = 'Amis du Sport';

-- Add members to the third group (Famille)
INSERT INTO public.group_members (group_id, member_id, added_by)
SELECT 
  g.id as group_id,
  tm.id as member_id,
  '00000000-0000-0000-0000-000000000001'::uuid as added_by
FROM public.groups g
CROSS JOIN (
  SELECT id FROM public.team_members 
  WHERE first_name IN ('Emma', 'Nicolas', 'Sarah', 'Lucas', 'Léa')
  LIMIT 5
) tm
WHERE g.name = 'Famille Cadoret';