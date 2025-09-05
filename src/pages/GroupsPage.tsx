import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Settings,
  ArrowLeft,
  Search,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Group {
  id: string;
  name: string;
  description?: string;
  whatsapp_link?: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  members?: TeamMember[];
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  status_badge: string;
}

const GroupsPage = () => {
  const { userProfile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchTeamMembers();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithCounts = groupsData?.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0
      })) || [];

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Erreur lors du chargement des groupes');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async () => {
    if (!userProfile?.user_id || !newGroupName.trim()) {
      toast.error('Veuillez saisir un nom de groupe');
      return;
    }

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          created_by: userProfile.user_id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add selected members to the group
      if (selectedMembers.length > 0) {
        const memberInserts = selectedMembers.map(memberId => ({
          group_id: groupData.id,
          member_id: memberId,
          added_by: userProfile.user_id
        }));

        const { error: membersError } = await supabase
          .from('group_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      toast.success('Groupe créé avec succès !');
      setShowCreateDialog(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setSelectedMembers([]);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Erreur lors de la création du groupe');
    }
  };

  const generateWhatsAppLink = (group: Group) => {
    const message = encodeURIComponent(`Rejoignez le groupe ${group.name} sur Seatup !`);
    return `https://wa.me/?text=${message}`;
  };

  const updateWhatsAppLink = async (groupId: string, link: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ whatsapp_link: link })
        .eq('id', groupId);

      if (error) throw error;
      
      toast.success('Lien WhatsApp mis à jour !');
      fetchGroups();
    } catch (error) {
      console.error('Error updating WhatsApp link:', error);
      toast.error('Erreur lors de la mise à jour du lien');
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-28">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des groupes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-28 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/team">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-monument font-bold text-brand">
                Groupes d'Équipe
              </h1>
              <p className="text-muted-foreground mt-1">
                Organisez votre équipe et créez des groupes WhatsApp
              </p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau groupe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Nom du groupe *</Label>
                  <Input
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Équipe Marketing"
                  />
                </div>
                
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Description du groupe..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Membres à ajouter</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher des membres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            }
                          }}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Label htmlFor={`member-${member.id}`} className="text-sm cursor-pointer">
                          {member.first_name} {member.last_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={createGroup} className="flex-1">
                    Créer le groupe
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups Grid */}
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="card-sport">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-monument text-lg">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="mt-1">{group.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Users className="h-3 w-3 mr-1" />
                      {group.member_count}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const link = group.whatsapp_link || generateWhatsAppLink(group);
                        window.open(link, '_blank');
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {group.whatsapp_link ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span>Lien WhatsApp configuré</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Cliquez sur WhatsApp pour générer un lien
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Créé le {new Date(group.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-sport">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun groupe créé</h3>
              <p className="text-muted-foreground mb-6">
                Créez votre premier groupe pour organiser votre équipe et faciliter les discussions sur WhatsApp.
              </p>
              <Button 
                className="bg-gradient-primary text-white"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier groupe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;