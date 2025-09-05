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