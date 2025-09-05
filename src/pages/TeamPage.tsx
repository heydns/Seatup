import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  MapPin, 
  UserPlus,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import marvinAvatar from '@/assets/marvin-avatar.jpg';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  city?: string;
  postal_code?: string;
  status_badge: string;
  avatar_url: string;
  created_at: string;
}

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('first_name', { ascending: true });

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        setTeamMembers(data || []);
        setFilteredMembers(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    let filtered = teamMembers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by badge type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(member =>
        member.status_badge.toLowerCase().includes(selectedFilter.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [searchQuery, selectedFilter, teamMembers]);

  const getBadgeVariant = (badge: string) => {
    if (badge.includes('VIP')) return 'default';
    if (badge.includes('Expert')) return 'secondary';
    return 'outline';
  };

  const getRelationshipType = (index: number) => {
    if (index < 5) return { type: 'collègue', emoji: '💼', color: 'bg-blue-100 text-blue-700' };
    if (index < 10) return { type: 'ami', emoji: '🤝', color: 'bg-green-100 text-green-700' };
    return { type: 'famille', emoji: '👨‍👩‍👧‍👦', color: 'bg-purple-100 text-purple-700' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-28">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de votre équipe...</p>
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
            <Link to="/home">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-monument font-bold text-brand">
                Mon Équipe Seatup
              </h1>
              <p className="text-muted-foreground mt-1">
                Découvrez les {teamMembers.length} membres de votre réseau
              </p>
            </div>
          </div>
          <Button className="bg-gradient-primary text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter des amis
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="card-sport">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email ou ville..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Tous' },
                    { key: 'vip', label: 'VIP 🌟' },
                    { key: 'expert', label: 'Expert 🎯' },
                    { key: 'fans', label: 'Fans 🏟️' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={selectedFilter === filter.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.key)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Membres', value: teamMembers.length, icon: Users, color: 'bg-blue-500' },
            { label: 'Collègues', value: 5, icon: Users, color: 'bg-green-500' },
            { label: 'Amis', value: 5, icon: Users, color: 'bg-purple-500' },
            { label: 'Famille', value: 5, icon: Users, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <Card key={index} className="card-sport">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => {
            const relationship = getRelationshipType(index);
            return (
              <Card key={member.id} className="card-sport animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={member.avatar_url || marvinAvatar} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-monument font-semibold">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={getBadgeVariant(member.status_badge)}>
                        {member.status_badge}
                      </Badge>
                      <Badge variant="outline" className={relationship.color}>
                        {relationship.emoji} {relationship.type}
                      </Badge>
                    </div>

                    {(member.city || member.postal_code) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {member.city} {member.postal_code}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Profil
                      </Button>
                      <Button size="sm" className="flex-1">
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="card-sport">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun membre trouvé</h3>
              <p className="text-muted-foreground">
                Aucun membre ne correspond à vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamPage;