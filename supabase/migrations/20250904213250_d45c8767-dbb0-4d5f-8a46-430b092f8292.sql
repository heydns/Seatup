-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('beneficiary', 'cse_admin', 'organizer_admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create CSE companies table
CREATE TABLE public.cse_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_budget DECIMAL(10,2) DEFAULT 0,
  consumed_budget DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create beneficiaries table (employees of CSE)
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cse_company_id UUID NOT NULL REFERENCES public.cse_companies(id) ON DELETE CASCADE,
  allocated_budget DECIMAL(10,2) DEFAULT 0,
  consumed_budget DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create organizers table
CREATE TABLE public.organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES public.event(id_event) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  original_price DECIMAL(10,2) NOT NULL,
  subsidized_amount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT,
  qr_code TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorite events table
CREATE TABLE public.favorite_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id BIGINT NOT NULL REFERENCES public.event(id_event) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id BIGINT NOT NULL REFERENCES public.event(id_event) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cse_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can see and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CSE companies: CSE admins can manage their company
CREATE POLICY "CSE admins can view their company" ON public.cse_companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.beneficiaries b ON p.user_id = b.user_id 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'cse_admin' 
      AND b.cse_company_id = cse_companies.id
    )
  );

-- Beneficiaries: users can see their own beneficiary info, CSE admins can see their company's beneficiaries
CREATE POLICY "Beneficiaries can view their own info" ON public.beneficiaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "CSE admins can view their company beneficiaries" ON public.beneficiaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.beneficiaries b ON p.user_id = b.user_id 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'cse_admin' 
      AND b.cse_company_id = beneficiaries.cse_company_id
    )
  );

-- Organizers: users can see and update their own organizer info
CREATE POLICY "Organizers can manage their own info" ON public.organizers
  FOR ALL USING (auth.uid() = user_id);

-- Purchases: users can see their own purchases, CSE admins can see their company's purchases
CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorite events: users can manage their own favorites
CREATE POLICY "Users can manage their favorite events" ON public.favorite_events
  FOR ALL USING (auth.uid() = user_id);

-- Cart items: users can manage their own cart
CREATE POLICY "Users can manage their cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'beneficiary'); -- Default role
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cse_companies_updated_at BEFORE UPDATE ON public.cse_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();