-- Add price columns to the Event table
ALTER TABLE public."Event" 
ADD COLUMN "Original_Price" text,
ADD COLUMN "Our_Price" text;

-- Insert sample data for existing events with prices
UPDATE public."Event" 
SET "Original_Price" = 'À partir de 65€', "Our_Price" = 'À partir de 45€'
WHERE "Event" = 'PSG vs OM';

UPDATE public."Event" 
SET "Original_Price" = 'À partir de 35€', "Our_Price" = 'À partir de 25€'
WHERE "Event" = 'Paris Basketball';

UPDATE public."Event" 
SET "Original_Price" = 'À partir de 50€', "Our_Price" = 'À partir de 35€'
WHERE "Event" = 'Open de Tennis';

UPDATE public."Event" 
SET "Original_Price" = 'À partir de 30€', "Our_Price" = 'À partir de 20€'
WHERE "Event" = 'Racing 92 vs Stade Français';

UPDATE public."Event" 
SET "Original_Price" = '105€', "Our_Price" = 'À partir de 84€'
WHERE "Event" = 'Les Mariannes 92 - Saison 25/26';

UPDATE public."Event" 
SET "Original_Price" = 'À partir de 25€', "Our_Price" = 'À partir de 18€'
WHERE "Event" = 'Handball Paris SG';