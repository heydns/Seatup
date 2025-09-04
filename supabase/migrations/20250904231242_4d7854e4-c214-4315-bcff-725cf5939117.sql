-- Add address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN street_address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN country TEXT DEFAULT 'France';

-- Update marvin.cadoret@gmail.com address
UPDATE public.profiles 
SET 
  street_address = '5, rue Berthe',
  city = 'Colombes', 
  postal_code = '92700'
WHERE email = 'marvin.cadoret@gmail.com';