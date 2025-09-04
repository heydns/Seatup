-- Créer l'entreprise CSE Orus
INSERT INTO public.cse_companies (id, name, total_budget, consumed_budget) 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Orus',
  100000,
  15000
) ON CONFLICT (id) DO NOTHING;

-- Créer le bénéficiaire Marvin lié à Orus
INSERT INTO public.beneficiaries (user_id, cse_company_id, allocated_budget, consumed_budget, status)
VALUES (
  'b156d8a6-9612-4e14-a837-087fb44385d9',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  500,
  160,
  'active'
) ON CONFLICT (user_id) DO UPDATE SET
  cse_company_id = EXCLUDED.cse_company_id,
  allocated_budget = EXCLUDED.allocated_budget,
  consumed_budget = EXCLUDED.consumed_budget;

-- Ajouter une colonne status_badge à la table profiles pour le statut utilisateur
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status_badge TEXT DEFAULT 'Fans 🏟️';

-- Mettre à jour le statut de Marvin
UPDATE public.profiles 
SET status_badge = 'Fans 🏟️'
WHERE user_id = 'b156d8a6-9612-4e14-a837-087fb44385d9';