import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter,
  UserPlus,
  Heart,
  Briefcase,
  Home,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  city?: string;
  status_badge: string;
  relationship_type: 'collègue' | 'ami' | 'famille';
  avatar_url?: string;
}

const MyTeam = () => {
  const { userProfile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'collègue' | 'ami' | 'famille'>('all');
  const [loading, setLoading] = useState(true);

  // Données de test pour le MVP (seront remplacées par de vraies données plus tard)
  const mockTeamMembers: TeamMember[] = [
    { id: '1', first_name: 'Sophie', last_name: 'Martin', email: 'sophie.martin@gmail.com', city: 'Paris', status_badge: 'VIP 🌟', relationship_type: 'collègue' },
    { id: '2', first_name: 'Thomas', last_name: 'Bernard', email: 'thomas.bernard@gmail.com', city: 'Lyon', status_badge: 'Fans 🏟️', relationship_type: 'collègue' },
    { id: '3', first_name: 'Marie', last_name: 'Dubois', email: 'marie.dubois@gmail.com', city: 'Marseille', status_badge: 'Expert 🎯', relationship_type: 'collègue' },
    { id: '4', first_name: 'Pierre', last_name: 'Moreau', email: 'pierre.moreau@gmail.com', city: 'Paris', status_badge: 'Fans 🏟️', relationship_type: 'collègue' },
    { id: '5', first_name: 'Claire', last_name: 'Laurent', email: 'claire.laurent@gmail.com', city: 'Toulouse', status_badge: 'VIP 🌟', relationship_type: 'collègue' },
    { id: '6', first_name: 'Julien', last_name: 'Simon', email: 'julien.simon@gmail.com', city: 'Paris', status_badge: 'Expert 🎯', relationship_type: 'ami' },
    { id: '7', first_name: 'Emma', last_name: 'Leroy', email: 'emma.leroy@gmail.com', city: 'Nice', status_badge: 'Fans 🏟️', relationship_type: 'ami' },
    { id: '8', first_name: 'Nicolas', last_name: 'Michel', email: 'nicolas.michel@gmail.com', city: 'Paris', status_badge: 'VIP 🌟', relationship_type: 'ami' },
    { id: '9', first_name: 'Camille', last_name: 'Garcia', email: 'camille.garcia@gmail.com', city: 'Bordeaux', status_badge: 'Expert 🎯', relationship_type: 'ami' },
    { id: '10', first_name: 'Antoine', last_name: 'Rodriguez', email: 'antoine.rodriguez@gmail.com', city: 'Paris', status_badge: 'Fans 🏟️', relationship_type: 'ami' },
    { id: '11', first_name: 'Léa', last_name: 'Martinez', email: 'lea.martinez@gmail.com', city: 'Lille', status_badge: 'VIP 🌟', relationship_type: 'famille' },
    { id: '12', first_name: 'Maxime', last_name: 'Lopez', email: 'maxime.lopez@gmail.com', city: 'Paris', status_badge: 'Expert 🎯', relationship_type: 'famille' },
    { id: '13', first_name: 'Sarah', last_name: 'Gonzalez', email: 'sarah.gonzalez@gmail.com', city: 'Strasbourg', status_badge: 'Fans 🏟️', relationship_type: 'famille' },
    { id: '14', first_name: 'Romain', last_name: 'Perez', email: 'romain.perez@gmail.com', city: 'Paris', status_badge: 'VIP 🌟', relationship_type: 'famille' },
    { id: '15', first_name: 'Chloé', last_name: 'Sanchez', email: 'chloe.sanchez@gmail.com', city: 'Nantes', status_badge: 'Expert 🎯', relationship_type: 'famille' },
  ];

  useEffect(() => {
    // Pour le MVP, on utilise les données mockées
    setTeamMembers(mockTeamMembers);
    setLoading(false);
    
    // TODO: Fetch real team members from Supabase
    // fetchTeamMembers();
  }, [userProfile]);

  const fetchTeamMembers = async () => {
    if (!userProfile?.user_id) return;
    
    try {
      // TODO: Implementer la récupération réelle des données depuis Supabase
      // const { data, error } = await supabase
      //   .from('user_relationships')
      //   .select(`
      //     id,
      //     relationship_type,
      //     friend_profile:profiles!user_relationships_friend_id_fkey(
      //       user_id,
      //       first_name,
      //       last_name,
      //       email,
      //       city,
      //       status_badge,
      //       avatar_url
      //     )
      //   `)
      //   .eq('user_id', userProfile.user_id)
      //   .eq('status', 'active');

      // if (error) {
      //   console.error('Error fetching team members:', error);
      //   return;
      // }

      // // Transform data to match TeamMember interface
      // const transformedMembers = data?.map(relation => ({
      //   id: relation.friend_profile.user_id,
      //   first_name: relation.friend_profile.first_name,
      //   last_name: relation.friend_profile.last_name,
      //   email: relation.friend_profile.email,
      //   city: relation.friend_profile.city,
      //   status_badge: relation.friend_profile.status_badge,
      //   relationship_type: relation.relationship_type as 'collègue' | 'ami' | 'famille',
      //   avatar_url: relation.friend_profile.avatar_url
      // })) || [];

      // setTeamMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || member.relationship_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'collègue': return <Briefcase className="h-4 w-4" />;
      case 'ami': return <Heart className="h-4 w-4" />;
      case 'famille': return <Home className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'collègue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ami': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'famille': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const relationshipCounts = {
    total: teamMembers.length,
    collègue: teamMembers.filter(m => m.relationship_type === 'collègue').length,
    ami: teamMembers.filter(m => m.relationship_type === 'ami').length,
    famille: teamMembers.filter(m => m.relationship_type === 'famille').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/home">
              <Button variant="ghost" size="sm" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-monument font-bold text-brand flex items-center gap-3">
                <Users className="h-8 w-8" />
                Mon Équipe
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos relations sur Seatup
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-monument font-bold text-brand mb-1">
                  {relationshipCounts.total}
                </div>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-monument font-bold text-blue-600 mb-1">
                  {relationshipCounts.collègue}
                </div>
                <p className="text-sm text-muted-foreground">Collègues</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-monument font-bold text-pink-600 mb-1">
                  {relationshipCounts.ami}
                </div>
                <p className="text-sm text-muted-foreground">Amis</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-monument font-bold text-green-600 mb-1">
                  {relationshipCounts.famille}
                </div>
                <p className="text-sm text-muted-foreground">Famille</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={selectedFilter === 'collègue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('collègue')}
                className="text-blue-700"
              >
                <Briefcase className="h-4 w-4 mr-1" />
                Collègues
              </Button>
              <Button
                variant={selectedFilter === 'ami' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('ami')}
                className="text-pink-700"
              >
                <Heart className="h-4 w-4 mr-1" />
                Amis
              </Button>
              <Button
                variant={selectedFilter === 'famille' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('famille')}
                className="text-green-700"
              >
                <Home className="h-4 w-4 mr-1" />
                Famille
              </Button>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement de votre équipe...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <Card key={member.id} className="card-sport hover:shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="bg-gradient-primary text-white text-lg">
                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-monument font-semibold text-lg mb-1 truncate">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2 truncate">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {member.status_badge}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRelationshipColor(member.relationship_type)}`}
                        >
                          {getRelationshipIcon(member.relationship_type)}
                          <span className="ml-1 capitalize">{member.relationship_type}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {member.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>📍</span>
                      <span>{member.city}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Voir profil
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-monument font-semibold mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedFilter !== 'all' 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez à inviter des collègues, amis ou famille"}
            </p>
            <Button className="bg-gradient-primary text-white hover-scale">
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter quelqu'un
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;