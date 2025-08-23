import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Users, Star, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { OrganizerCard } from "@/components/OrganizerCard";

interface Organizer {
  name: string;
  description: string;
  logo: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  founded?: string;
  type: string;
  sports?: string[];
  instagram?: string;
  stats?: {
    eventsCount: number;
    followersCount: string;
  };
}

const SPORT_FILTERS = [
  { name: "Tous", icon: "", key: "all" },
  { name: "Football", icon: "⚽", key: "football" },
  { name: "Basketball", icon: "🏀", key: "basketball" },
  { name: "Tennis", icon: "🎾", key: "tennis" },
  { name: "Rugby", icon: "🏉", key: "rugby" },
  { name: "Handball", icon: "🤾", key: "handball" },
  { name: "Volleyball", icon: "🏐", key: "volleyball" },
  { name: "Course à pied", icon: "🏃", key: "course" },
];

const LOCATION_FILTERS = [
  "Toutes",
  "Paris",
  "Nanterre", 
  "Levallois-Perret"
];

const TYPE_FILTERS = [
  "Tous",
  "Club",
  "Marque",
  "Fédération",
  "Agence événementielle"
];

const ORGANIZERS_DATA: Organizer[] = [
  {
    name: "Paris Basketball",
    description: "Paris Basketball est un club de basketball professionnel français basé à Paris et évoluant en Jeep Élite, l'élite du basketball français.",
    logo: "https://logos-world.net/wp-content/uploads/2021/05/Paris-Basketball-Logo.png",
    website: "https://parisbasketball.com",
    email: "contact@parisbasketball.com",
    location: "Paris, France",
    founded: "2018",
    type: "Club",
    sports: ["Basketball"],
    instagram: "https://instagram.com/parisbasketball",
    stats: {
      eventsCount: 25,
      followersCount: "15K"
    }
  },
  {
    name: "Paris Saint-Germain",
    description: "Le Paris Saint-Germain Football Club est un club de football français fondé le 12 août 1970. Basé à Paris, le club évolue en Ligue 1.",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png",
    website: "https://psg.fr",
    email: "contact@psg.fr",
    location: "Paris, France",
    founded: "1970",
    type: "Club",
    sports: ["Football"],
    instagram: "https://instagram.com/psg",
    stats: {
      eventsCount: 45,
      followersCount: "2.1M"
    }
  },
  {
    name: "PSG Handball",
    description: "Le Paris Saint-Germain Handball est la section handball du Paris Saint-Germain. Fondé en 1992, le club évolue en StarLigue.",
    logo: "https://www.psg.fr/media/199952/psg-handball-logo.png",
    website: "https://psghandball.com",
    email: "contact@psghandball.com",
    location: "Paris, France",
    founded: "1992",
    type: "Club",
    sports: ["Handball"],
    instagram: "https://instagram.com/psghand",
    stats: {
      eventsCount: 30,
      followersCount: "125K"
    }
  },
  {
    name: "Rolex Paris Masters",
    description: "Le Rolex Paris Masters est un tournoi de tennis masculin professionnel qui se déroule chaque année à Paris.",
    logo: "https://seeklogo.com/images/R/rolex-logo-FC562C4240-seeklogo.com.png",
    website: "https://rolexparismasters.com",
    email: "info@rolexparismasters.com",
    location: "Nanterre, France",
    founded: "1968",
    type: "Marque",
    sports: ["Tennis"],
    instagram: "https://instagram.com/rolexparismasters",
    stats: {
      eventsCount: 12,
      followersCount: "89K"
    }
  },
  {
    name: "Hoka Running",
    description: "Hoka est une marque de chaussures de course française fondée en 2009. Elle organise plusieurs événements de course à pied en France.",
    logo: "https://seeklogo.com/images/H/hoka-one-one-logo-9F0F3757A1-seeklogo.com.png",
    website: "https://hokaparis.com",
    email: "events@hoka.com",
    location: "Paris, France",
    founded: "2009",
    type: "Marque",
    sports: ["Course à pied"],
    instagram: "https://instagram.com/hokaoneone",
    stats: {
      eventsCount: 8,
      followersCount: "45K"
    }
  },
  {
    name: "Les Mariannes 92",
    description: "Les Mariannes 92 est un club de volleyball féminin français basé à Levallois-Perret. Évoluant en Ligue A Féminine.",
    logo: "https://www.lesmariannes92.com/images/logo-mariannes.png",
    website: "https://lesmariannes92.com",
    email: "contact@lesmariannes92.com",
    location: "Levallois-Perret, France",
    founded: "1986",
    type: "Club",
    sports: ["Volleyball"],
    instagram: "https://instagram.com/lesmariannes92",
    stats: {
      eventsCount: 18,
      followersCount: "12K"
    }
  }
];

export const OrganizersPage = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>(ORGANIZERS_DATA);
  const [filteredOrganizers, setFilteredOrganizers] = useState<Organizer[]>(ORGANIZERS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tous");
  const [selectedLocation, setSelectedLocation] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");
  const [sortBy, setSortBy] = useState<"name" | "events" | "followers">("name");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    filterOrganizers();
  }, [organizers, searchQuery, selectedSport, selectedLocation, selectedType, sortBy]);

  const filterOrganizers = () => {
    let filtered = organizers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(organizer =>
        organizer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.sports?.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sport filter
    if (selectedSport !== "Tous") {
      filtered = filtered.filter(organizer =>
        organizer.sports?.includes(selectedSport)
      );
    }

    // Location filter
    if (selectedLocation !== "Toutes") {
      filtered = filtered.filter(organizer =>
        organizer.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "Tous") {
      filtered = filtered.filter(organizer =>
        organizer.type === selectedType
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "events":
          return (b.stats?.eventsCount || 0) - (a.stats?.eventsCount || 0);
        case "followers":
          const aFollowers = parseFloat(a.stats?.followersCount?.replace(/[KM]/, '') || '0');
          const bFollowers = parseFloat(b.stats?.followersCount?.replace(/[KM]/, '') || '0');
          return bFollowers - aFollowers;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredOrganizers(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSport("Tous");
    setSelectedLocation("Toutes");
    setSelectedType("Tous");
    setSortBy("name");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-monument mb-2">Organisateurs</h1>
                <p className="text-muted-foreground">
                  Découvrez {filteredOrganizers.length} organisateur{filteredOrganizers.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="sport" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Masquer" : "Filtres"}
                </Button>
              </div>
            </div>

            {/* Search Bar with Advanced Filters */}
            <div className="bg-white rounded-xl border-2 focus-within:border-primary shadow-sm mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Rechercher un organisateur, sport, lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg border-0 rounded-xl bg-transparent focus-visible:ring-0"
                />
              </div>
              
              {/* Advanced Filters Row */}
              <div className="border-t px-4 py-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-muted-foreground">Filtres:</span>
                  
                  {/* Type Filter */}
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-auto h-8 px-3 text-sm border-0 bg-gray-100 hover:bg-gray-200 rounded-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      {TYPE_FILTERS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Location Filter */}
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-auto h-8 px-3 text-sm border-0 bg-gray-100 hover:bg-gray-200 rounded-full">
                      <SelectValue placeholder="Ville" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      {LOCATION_FILTERS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Filter */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-auto h-8 px-3 text-sm border-0 bg-gray-100 hover:bg-gray-200 rounded-full">
                      <SelectValue placeholder="Trier" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="name">Nom</SelectItem>
                      <SelectItem value="events">Événements</SelectItem>
                      <SelectItem value="followers">Abonnés</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {(selectedType !== "Tous" || selectedLocation !== "Toutes" || sortBy !== "name") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Effacer
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sports Filter Pills */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {SPORT_FILTERS.map((sport) => (
                  <Button
                    key={sport.key}
                    variant={selectedSport === sport.name ? "hero" : "sport"}
                    size="sm"
                    onClick={() => setSelectedSport(sport.name)}
                    className="gap-2 h-10"
                  >
                    <span className="text-base">{sport.icon}</span>
                    {sport.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Lieu</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        {LOCATION_FILTERS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        {TYPE_FILTERS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Trier par</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="events">Nombre d'événements</SelectItem>
                        <SelectItem value="followers">Abonnés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="sport" 
                      onClick={clearFilters}
                      className="h-12 w-full"
                    >
                      Effacer les filtres
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des organisateurs...</p>
              </div>
            </div>
          ) : filteredOrganizers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun organisateur trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button variant="sport" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizers.map((organizer) => (
                <OrganizerCard key={organizer.name} organizer={organizer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};