-- Create user relationships table
CREATE TABLE public.user_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('collègue', 'ami', 'famille')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure no duplicate relationships
  UNIQUE(user_id, friend_id),
  -- Prevent self-relationships
  CHECK (user_id != friend_id)
);

-- Enable RLS
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for user relationships
CREATE POLICY "Users can view their own relationships" 
ON public.user_relationships 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create their own relationships" 
ON public.user_relationships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationships" 
ON public.user_relationships 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own relationships" 
ON public.user_relationships 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_user_relationships_updated_at
BEFORE UPDATE ON public.user_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create 15 test users for the MVP
INSERT INTO public.profiles (user_id, email, first_name, last_name, city, postal_code, role, status_badge) VALUES
(gen_random_uuid(), 'sophie.martin@gmail.com', 'Sophie', 'Martin', 'Paris', '75001', 'beneficiary', 'VIP 🌟'),
(gen_random_uuid(), 'thomas.bernard@gmail.com', 'Thomas', 'Bernard', 'Lyon', '69001', 'beneficiary', 'Fans 🏟️'),
(gen_random_uuid(), 'marie.dubois@gmail.com', 'Marie', 'Dubois', 'Marseille', '13001', 'beneficiary', 'Expert 🎯'),
(gen_random_uuid(), 'pierre.moreau@gmail.com', 'Pierre', 'Moreau', 'Paris', '75015', 'beneficiary', 'Fans 🏟️'),
(gen_random_uuid(), 'claire.laurent@gmail.com', 'Claire', 'Laurent', 'Toulouse', '31000', 'beneficiary', 'VIP 🌟'),
(gen_random_uuid(), 'julien.simon@gmail.com', 'Julien', 'Simon', 'Paris', '75008', 'beneficiary', 'Expert 🎯'),
(gen_random_uuid(), 'emma.leroy@gmail.com', 'Emma', 'Leroy', 'Nice', '06000', 'beneficiary', 'Fans 🏟️'),
(gen_random_uuid(), 'nicolas.michel@gmail.com', 'Nicolas', 'Michel', 'Paris', '75011', 'beneficiary', 'VIP 🌟'),
(gen_random_uuid(), 'camille.garcia@gmail.com', 'Camille', 'Garcia', 'Bordeaux', '33000', 'beneficiary', 'Expert 🎯'),
(gen_random_uuid(), 'antoine.rodriguez@gmail.com', 'Antoine', 'Rodriguez', 'Paris', '75020', 'beneficiary', 'Fans 🏟️'),
(gen_random_uuid(), 'lea.martinez@gmail.com', 'Léa', 'Martinez', 'Lille', '59000', 'beneficiary', 'VIP 🌟'),
(gen_random_uuid(), 'maxime.lopez@gmail.com', 'Maxime', 'Lopez', 'Paris', '75004', 'beneficiary', 'Expert 🎯'),
(gen_random_uuid(), 'sarah.gonzalez@gmail.com', 'Sarah', 'Gonzalez', 'Strasbourg', '67000', 'beneficiary', 'Fans 🏟️'),
(gen_random_uuid(), 'romain.perez@gmail.com', 'Romain', 'Perez', 'Paris', '75017', 'beneficiary', 'VIP 🌟'),
(gen_random_uuid(), 'chloe.sanchez@gmail.com', 'Chloé', 'Sanchez', 'Nantes', '44000', 'beneficiary', 'Expert 🎯');

-- Get Marvin's user_id (assuming he exists in profiles)
-- Create relationships between Marvin and the test users
WITH marvin AS (
  SELECT user_id FROM profiles WHERE email = 'marvin.cadoret@gmail.com' LIMIT 1
),
test_users AS (
  SELECT user_id, 
    CASE 
      WHEN ROW_NUMBER() OVER() <= 5 THEN 'collègue'
      WHEN ROW_NUMBER() OVER() <= 10 THEN 'ami'
      ELSE 'famille'
    END as rel_type
  FROM profiles 
  WHERE email IN (
    'sophie.martin@gmail.com', 'thomas.bernard@gmail.com', 'marie.dubois@gmail.com',
    'pierre.moreau@gmail.com', 'claire.laurent@gmail.com', 'julien.simon@gmail.com',
    'emma.leroy@gmail.com', 'nicolas.michel@gmail.com', 'camille.garcia@gmail.com',
    'antoine.rodriguez@gmail.com', 'lea.martinez@gmail.com', 'maxime.lopez@gmail.com',
    'sarah.gonzalez@gmail.com', 'romain.perez@gmail.com', 'chloe.sanchez@gmail.com'
  )
)
INSERT INTO public.user_relationships (user_id, friend_id, relationship_type)
SELECT marvin.user_id, test_users.user_id, test_users.rel_type
FROM marvin, test_users
WHERE marvin.user_id IS NOT NULL;