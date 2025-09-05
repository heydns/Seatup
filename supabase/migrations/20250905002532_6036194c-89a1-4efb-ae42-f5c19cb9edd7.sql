-- Fix all team members with proper Île-de-France addresses and avatar URLs

-- Update members that haven't been updated yet
UPDATE team_members SET 
  avatar_url = '/src/assets/team/antoine-rodriguez.jpg',
  city = 'Issy-les-Moulineaux',
  postal_code = '92130'
WHERE first_name = 'Antoine' AND last_name = 'Rodriguez';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/camille-garcia.jpg',
  city = 'Vincennes',
  postal_code = '94300'
WHERE first_name = 'Camille' AND last_name = 'Garcia';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/chloe-sanchez.jpg',
  city = 'Clichy',
  postal_code = '92110'
WHERE first_name = 'Chloé' AND last_name = 'Sanchez';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/claire-laurent.jpg',
  city = 'Courbevoie',
  postal_code = '92400'
WHERE first_name = 'Claire' AND last_name = 'Laurent';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/emma-leroy.jpg',
  city = 'Montreuil',
  postal_code = '93100'
WHERE first_name = 'Emma' AND last_name = 'Leroy';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/julien-simon.jpg',
  city = 'Nanterre',
  postal_code = '92000'
WHERE first_name = 'Julien' AND last_name = 'Simon';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/lea-martinez.jpg',
  city = 'Saint-Denis',
  postal_code = '93200'
WHERE first_name = 'Léa' AND last_name = 'Martinez';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/maxime-lopez.jpg',
  city = 'Créteil',
  postal_code = '94000'
WHERE first_name = 'Maxime' AND last_name = 'Lopez';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/nicolas-michel.jpg',
  city = 'Levallois-Perret',
  postal_code = '92300'
WHERE first_name = 'Nicolas' AND last_name = 'Michel';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/pierre-moreau.jpg',
  city = 'Puteaux',
  postal_code = '92800'
WHERE first_name = 'Pierre' AND last_name = 'Moreau';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/romain-perez.jpg',
  city = 'Suresnes',
  postal_code = '92150'
WHERE first_name = 'Romain' AND last_name = 'Perez';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/sarah-gonzalez.jpg',
  city = 'Versailles',
  postal_code = '78000'
WHERE first_name = 'Sarah' AND last_name = 'Gonzalez';

-- Fix existing entries that have incorrect paths (missing /)
UPDATE team_members SET 
  avatar_url = '/src/assets/team/marie-dubois.jpg'
WHERE first_name = 'Marie' AND last_name = 'Dubois';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/sophie-martin.jpg'
WHERE first_name = 'Sophie' AND last_name = 'Martin';

UPDATE team_members SET 
  avatar_url = '/src/assets/team/thomas-bernard.jpg'
WHERE first_name = 'Thomas' AND last_name = 'Bernard';