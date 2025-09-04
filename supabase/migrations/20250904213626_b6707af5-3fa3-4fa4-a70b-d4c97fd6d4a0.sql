-- Fix security issues

-- 1. Fix function search path issues
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'beneficiary'); -- Default role
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix RLS policies to restrict to authenticated users only
-- Drop and recreate policies with proper restrictions

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Beneficiaries policies
DROP POLICY IF EXISTS "Beneficiaries can view their own info" ON public.beneficiaries;
DROP POLICY IF EXISTS "CSE admins can view their company beneficiaries" ON public.beneficiaries;

CREATE POLICY "Beneficiaries can view their own info" ON public.beneficiaries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "CSE admins can view their company beneficiaries" ON public.beneficiaries
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.beneficiaries b ON p.user_id = b.user_id 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'cse_admin' 
      AND b.cse_company_id = beneficiaries.cse_company_id
    )
  );

-- CSE companies policies
DROP POLICY IF EXISTS "CSE admins can view their company" ON public.cse_companies;

CREATE POLICY "CSE admins can view their company" ON public.cse_companies
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.beneficiaries b ON p.user_id = b.user_id 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'cse_admin' 
      AND b.cse_company_id = cse_companies.id
    )
  );

-- Organizers policies
DROP POLICY IF EXISTS "Organizers can manage their own info" ON public.organizers;

CREATE POLICY "Organizers can manage their own info" ON public.organizers
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Purchases policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can create their own purchases" ON public.purchases;

CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" ON public.purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Favorite events policies
DROP POLICY IF EXISTS "Users can manage their favorite events" ON public.favorite_events;

CREATE POLICY "Users can manage their favorite events" ON public.favorite_events
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Cart items policies
DROP POLICY IF EXISTS "Users can manage their cart" ON public.cart_items;

CREATE POLICY "Users can manage their cart" ON public.cart_items
  FOR ALL TO authenticated USING (auth.uid() = user_id);