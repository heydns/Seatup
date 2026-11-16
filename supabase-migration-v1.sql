-- ═══════════════════════════════════════════════════════════════════════════
-- SEATUP — MIGRATION V1 (production)
-- ═══════════════════════════════════════════════════════════════════════════
-- Scope V1 :
--   1. Multi-rôles par user (compte unique peut être bénéficiaire + admin CSE +
--      admin orga en même temps)
--   2. Rôles CSE fins : high / low / lecteur
--   3. Events : visibilité publique, source externe (Tickie, etc.)
--   4. Stripe : mapping user → stripe_customer + CB tokenisée
--   5. OTP : audit trail (rate limit + anti-abuse)
--   6. Payment logs : audit paiements (compliance)
--
-- À appliquer APRÈS supabase-migration-prio3.sql (qui existe déjà pour le MVP).
-- Idempotent : utilise IF NOT EXISTS / OR REPLACE partout.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. MULTI-RÔLES ═════════════════════════════════════════════════════════

-- Nouvelle enum pour role_type (plus granulaire que profiles.role)
DO $$
BEGIN
  CREATE TYPE public.user_role_type AS ENUM (
    'beneficiary',       -- Salarié bénéficiaire d'un CSE
    'cse_admin',         -- Admin d'un CSE
    'organizer_admin',   -- Admin d'un club/organisateur
    'seatup_admin'       -- Super admin SeatUp (back-office, hors scope V1 mais préparé)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Enum pour les sous-rôles CSE (granularité demandée par le Notion V1)
DO $$
BEGIN
  CREATE TYPE public.cse_role_level AS ENUM (
    'high',      -- Full access (gestion complète du CSE)
    'low',       -- Gestion bénéficiaires + BDC + factures
    'lecteur'    -- Lecture seule
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Table user_roles : un user peut avoir N rôles dans M organisations
CREATE TABLE IF NOT EXISTS public.user_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type       public.user_role_type NOT NULL,
  -- Pour cse_admin : pointe vers cse_companies.id
  -- Pour organizer_admin : pointe vers organizers.id
  -- Pour beneficiary : pointe vers cse_companies.id (CSE auquel le user appartient)
  -- Pour seatup_admin : NULL (rôle global)
  org_id          UUID NULL,
  -- Sous-rôle (uniquement pour cse_admin)
  cse_role        public.cse_role_level NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL,
  -- Un user ne peut avoir qu'un seul rôle du même type dans la même org
  UNIQUE (user_id, role_type, org_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user     ON public.user_roles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_org      ON public.user_roles(org_id)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_type     ON public.user_roles(role_type) WHERE deleted_at IS NULL;

-- RLS user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admin CSE high peut lire tous les roles de son CSE (pour gérer son équipe)
DROP POLICY IF EXISTS "CSE high admins can read org roles" ON public.user_roles;
CREATE POLICY "CSE high admins can read org roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_type = 'cse_admin'
        AND ur.cse_role = 'high'
        AND ur.org_id = public.user_roles.org_id
        AND ur.deleted_at IS NULL
    )
  );

-- Migration des rôles existants (profiles.role → user_roles)
-- Idempotent : ON CONFLICT DO NOTHING
INSERT INTO public.user_roles (user_id, role_type, org_id, cse_role)
SELECT
  p.id AS user_id,
  CASE p.role
    WHEN 'beneficiary'     THEN 'beneficiary'::public.user_role_type
    WHEN 'cse_admin'       THEN 'cse_admin'::public.user_role_type
    WHEN 'organizer_admin' THEN 'organizer_admin'::public.user_role_type
    ELSE 'beneficiary'::public.user_role_type
  END AS role_type,
  COALESCE(p.cse_company_id, p.organizer_id) AS org_id,
  CASE WHEN p.role = 'cse_admin' THEN 'high'::public.cse_role_level ELSE NULL END AS cse_role
FROM public.profiles p
WHERE p.deleted_at IS NULL
ON CONFLICT (user_id, role_type, org_id) DO NOTHING;


-- ─── 2. FONCTIONS HELPER DE PERMISSIONS ════════════════════════════════════

-- Check : un user donné a-t-il un rôle précis dans une org ?
CREATE OR REPLACE FUNCTION public.has_role(
  p_user_id   UUID,
  p_role_type public.user_role_type,
  p_org_id    UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
      AND ur.role_type = p_role_type
      AND (p_org_id IS NULL OR ur.org_id = p_org_id)
      AND ur.deleted_at IS NULL
  );
$$;

-- Check : un user a-t-il un cse_role >= à un niveau donné ?
-- Hiérarchie : lecteur < low < high (high peut tout faire ce que low peut faire)
CREATE OR REPLACE FUNCTION public.has_cse_role(
  p_user_id UUID,
  p_org_id  UUID,
  p_min_role public.cse_role_level
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
      AND ur.role_type = 'cse_admin'
      AND ur.org_id = p_org_id
      AND ur.deleted_at IS NULL
      AND (
        -- 'high' satisfait tous les niveaux ; 'low' satisfait low+lecteur ; 'lecteur' uniquement lecteur
        (ur.cse_role = 'high')
        OR (ur.cse_role = 'low' AND p_min_role IN ('low', 'lecteur'))
        OR (ur.cse_role = 'lecteur' AND p_min_role = 'lecteur')
      )
  );
$$;

-- Liste les rôles d'un user (pour UI switch espaces)
CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS TABLE (
  role_type public.user_role_type,
  org_id    UUID,
  org_name  TEXT,
  cse_role  public.cse_role_level
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ur.role_type,
    ur.org_id,
    COALESCE(c.name, o.name, 'SeatUp') AS org_name,
    ur.cse_role
  FROM public.user_roles ur
  LEFT JOIN public.cse_companies c ON c.id = ur.org_id AND ur.role_type IN ('cse_admin', 'beneficiary')
  LEFT JOIN public.organizers o    ON o.id = ur.org_id AND ur.role_type = 'organizer_admin'
  WHERE ur.user_id = auth.uid()
    AND ur.deleted_at IS NULL;
$$;


-- ─── 3. EVENTS : vitrine publique + source externe ═════════════════════════

-- Rendre certains events publiquement visibles (vitrine ouverte)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_public_visible BOOLEAN DEFAULT TRUE NOT NULL;

-- Source externe (pour Tickie et futurs partenaires API)
-- Possible values: 'seatup' (créé via wizard), 'tickie', 'weezevent', 'manual'
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS external_source TEXT DEFAULT 'seatup' NOT NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS external_id TEXT NULL;

-- URL de redirection quand event en mode "display + redirect" (Tickie V1)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS external_url TEXT NULL;

-- Mode de distribution (audit section 8) :
-- 'checkout_seatup' : paiement sur SeatUp (Stripe + Tickie booking-only en V1.5)
-- 'checkout_external' : redirection vers checkout du partenaire (Tickie V1)
-- 'manual' : vendu manuellement par le club (hors parcours en ligne)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS mode_distribution TEXT DEFAULT 'checkout_seatup' NOT NULL;

-- Index pour requêtes publiques (homepage, catalogue)
CREATE INDEX IF NOT EXISTS idx_events_public ON public.events(is_public_visible, event_date)
  WHERE is_public_visible = TRUE AND is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_events_external ON public.events(external_source, external_id)
  WHERE external_id IS NOT NULL;

-- RLS : events publics visibles par TOUT LE MONDE (y compris anon)
DROP POLICY IF EXISTS "Public events visible to anyone" ON public.events;
CREATE POLICY "Public events visible to anyone"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (is_public_visible = TRUE AND is_published = TRUE);


-- ─── 4. STRIPE : customers + payment methods tokenisés ═════════════════════

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT NOT NULL UNIQUE,
  default_payment_method TEXT NULL,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user ON public.stripe_customers(user_id);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own stripe customer" ON public.stripe_customers;
CREATE POLICY "Users read their own stripe customer"
  ON public.stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

-- Table d'historique des méthodes de paiement (pour UI "mes CB")
-- NB : la table existe peut-être déjà depuis le MVP (migration Prio 3) avec
-- un schema différent. On utilise CREATE TABLE IF NOT EXISTS + ALTER pour
-- garantir la présence de TOUTES les colonnes attendues.
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Ajoute les colonnes V1 si manquantes (au cas où la table existe déjà)
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS stripe_payment_method TEXT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS card_brand            TEXT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS card_last4            TEXT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS card_exp_month        SMALLINT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS card_exp_year         SMALLINT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS is_default            BOOLEAN DEFAULT FALSE;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS deleted_at            TIMESTAMPTZ NULL;

-- Unique sur stripe_payment_method quand défini (pas sur les anciennes lignes mock)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_methods_stripe_pm_unique'
  ) THEN
    CREATE UNIQUE INDEX payment_methods_stripe_pm_unique
      ON public.payment_methods(stripe_payment_method)
      WHERE stripe_payment_method IS NOT NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id) WHERE deleted_at IS NULL;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own payment methods" ON public.payment_methods;
CREATE POLICY "Users read their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users soft-delete their own payment methods" ON public.payment_methods;
CREATE POLICY "Users soft-delete their own payment methods"
  ON public.payment_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── 5. OTP : audit trail pour rate limiting ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.otp_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  ip_address  TEXT NULL,
  user_agent  TEXT NULL,
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  success     BOOLEAN DEFAULT NULL, -- NULL = en cours, TRUE = utilisé, FALSE = expiré/invalidé
  consumed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_logs_email_recent ON public.otp_logs(email, sent_at DESC);

-- Rate limit : max 5 OTP par email en 15 minutes
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 5
  FROM public.otp_logs
  WHERE email = p_email
    AND sent_at > NOW() - INTERVAL '15 minutes';
$$;

ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;
-- Pas de policy SELECT pour les users : read-only côté admin via service_role

-- ─── 6. PAYMENT LOGS : audit paiements Stripe ══════════════════════════════

CREATE TABLE IF NOT EXISTS public.payment_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_id          UUID NULL,                 -- Link vers reservations si applicable
  stripe_payment_intent   TEXT UNIQUE NULL,
  amount_cents            INTEGER NOT NULL,          -- En centimes
  currency                TEXT DEFAULT 'eur' NOT NULL,
  status                  TEXT NOT NULL,             -- 'pending', 'succeeded', 'failed', 'refunded'
  wallet_amount_cents     INTEGER DEFAULT 0 NOT NULL,-- Part payée par cagnotte
  cb_amount_cents         INTEGER DEFAULT 0 NOT NULL,-- Part payée par CB
  metadata                JSONB DEFAULT '{}'::JSONB,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_user ON public.payment_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_res  ON public.payment_logs(reservation_id) WHERE reservation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON public.payment_logs(status, created_at DESC);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own payment logs" ON public.payment_logs;
CREATE POLICY "Users read their own payment logs"
  ON public.payment_logs FOR SELECT
  USING (auth.uid() = user_id);


-- ─── 7. TRACKING VITRINE PUBLIQUE ══════════════════════════════════════════

-- Tracking des clics sortants (audit section 8.1)
-- Pour les events en mode 'checkout_external' (Tickie en redirect)
CREATE TABLE IF NOT EXISTS public.outbound_clicks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES public.events(id) ON DELETE SET NULL,
  user_id         UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  seatup_ref      TEXT NOT NULL,            -- Identifiant unique de redirection (ex 'AB12CD')
  external_source TEXT NOT NULL,            -- 'tickie', 'weezevent', ...
  external_url    TEXT NOT NULL,
  ip_address      TEXT NULL,
  user_agent      TEXT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbound_clicks_event ON public.outbound_clicks(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_ref   ON public.outbound_clicks(seatup_ref);

ALTER TABLE public.outbound_clicks ENABLE ROW LEVEL SECURITY;

-- Insertion publique autorisée (pour tracker même les users anonymes depuis vitrine)
DROP POLICY IF EXISTS "Anyone can insert outbound clicks" ON public.outbound_clicks;
CREATE POLICY "Anyone can insert outbound clicks"
  ON public.outbound_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);


-- ─── 8. MISE À JOUR events_analytics pour vitrine publique ═════════════════

-- Tracker les vues publiques des fiches events (homepage, catalogue, fiche)
ALTER TABLE public.event_analytics
  ADD COLUMN IF NOT EXISTS public_views INTEGER DEFAULT 0;

ALTER TABLE public.event_analytics
  ADD COLUMN IF NOT EXISTS authenticated_views INTEGER DEFAULT 0;

-- Incrémente les vues publiques d'un event
CREATE OR REPLACE FUNCTION public.track_event_view(
  p_event_id UUID,
  p_is_authenticated BOOLEAN DEFAULT FALSE
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.event_analytics (event_id, date, public_views, authenticated_views, views)
  VALUES (
    p_event_id,
    CURRENT_DATE,
    CASE WHEN p_is_authenticated THEN 0 ELSE 1 END,
    CASE WHEN p_is_authenticated THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (event_id, date) DO UPDATE SET
    public_views        = event_analytics.public_views + (CASE WHEN p_is_authenticated THEN 0 ELSE 1 END),
    authenticated_views = event_analytics.authenticated_views + (CASE WHEN p_is_authenticated THEN 1 ELSE 0 END),
    views               = event_analytics.views + 1;
END;
$$;

-- RLS : tout le monde peut tracker une vue
DROP POLICY IF EXISTS "Anyone can track event view via rpc" ON public.event_analytics;
-- NB : track_event_view est SECURITY DEFINER donc bypass les RLS


-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DE MIGRATION V1
--
-- À appliquer via Supabase SQL Editor ou CLI :
--   supabase db push
-- OU copier-coller tout ce fichier dans le SQL Editor du dashboard.
--
-- Vérifications post-migration :
--   SELECT COUNT(*) FROM user_roles;      -- doit être égal au nb de profiles
--   SELECT * FROM get_my_roles();         -- après avoir été authentifié
--   SELECT has_role('<uuid>', 'cse_admin'); -- test
-- ═══════════════════════════════════════════════════════════════════════════
