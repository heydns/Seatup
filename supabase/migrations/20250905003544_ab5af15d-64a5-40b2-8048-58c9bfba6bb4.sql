-- Create groups table for organizing team members
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  whatsapp_link TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table for many-to-many relationship
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups
CREATE POLICY "Users can view all groups"
ON public.groups
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
ON public.groups
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
ON public.groups
FOR DELETE
USING (auth.uid() = created_by);

-- RLS policies for group_members
CREATE POLICY "Users can view all group members"
ON public.group_members
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add members to groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can remove members from groups they created"
ON public.group_members
FOR DELETE
USING (
  auth.uid() = added_by OR 
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.created_by = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_member_id ON public.group_members(member_id);