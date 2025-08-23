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
  rating?: number;
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
    logo: "/lovable-uploads/b02cb022-8fbf-4d98-9493-bfd5d0a04866.png",
    website: "https://parisbasketball.com",
    email: "contact@parisbasketball.com",
    location: "Paris, France",
    founded: "2018",
    type: "Club",
    sports: ["Basketball"],
    instagram: "https://instagram.com/parisbasketball",
    rating: 4.3,
    stats: {
      eventsCount: 25,
      followersCount: "15K"
    }
  },
  {
    name: "Paris Saint-Germain",
    description: "Le Paris Saint-Germain Football Club est un club de football français fondé le 12 août 1970. Basé à Paris, le club évolue en Ligue 1.",
    logo: "/lovable-uploads/7a7acfde-0c35-4b64-a3ee-20842182476b.png",
    website: "https://psg.fr",
    email: "contact@psg.fr",
    location: "Paris, France",
    founded: "1970",
    type: "Club",
    sports: ["Football"],
    instagram: "https://instagram.com/psg",
    rating: 4.8,
    stats: {
      eventsCount: 45,
      followersCount: "2.1M"
    }
  },
  {
    name: "PSG Handball",
    description: "Le Paris Saint-Germain Handball est la section handball du Paris Saint-Germain. Fondé en 1992, le club évolue en StarLigue.",
    logo: "/lovable-uploads/c874bbe9-19a8-4e77-b649-aa0455bdc2c5.png",
    website: "https://psghandball.com",
    email: "contact@psghandball.com",
    location: "Paris, France",
    founded: "1992",
    type: "Club",
    sports: ["Handball"],
    instagram: "https://instagram.com/psghand",
    rating: 4.2,
    stats: {
      eventsCount: 30,
      followersCount: "125K"
    }
  },
  {
    name: "Rolex Paris Masters",
    description: "Le Rolex Paris Masters est un tournoi de tennis masculin professionnel qui se déroule chaque année à Paris.",
    logo: "/lovable-uploads/b379a728-71d8-4301-8d46-73d92d4aa0ba.png",
    website: "https://rolexparismasters.com",
    email: "info@rolexparismasters.com",
    location: "Nanterre, France",
    founded: "1968",
    type: "Marque",
    sports: ["Tennis"],
    instagram: "https://instagram.com/rolexparismasters",
    rating: 4.6,
    stats: {
      eventsCount: 12,
      followersCount: "89K"
    }
  },
  {
    name: "Hoka Running",
    description: "Hoka est une marque de chaussures de course française fondée en 2009. Elle organise plusieurs événements de course à pied en France.",
    logo: "/lovable-uploads/88a89064-a2ce-45ba-b1d0-551b4be719d3.png",
    website: "https://hokaparis.com",
    email: "events@hoka.com",
    location: "Paris, France",
    founded: "2009",
    type: "Marque",
    sports: ["Course à pied"],
    instagram: "https://instagram.com/hokaoneone",
    rating: 4.1,
    stats: {
      eventsCount: 8,
      followersCount: "45K"
    }
  },
  {
    name: "Les Mariannes 92",
    description: "Les Mariannes 92 est un club de volleyball féminin français basé à Levallois-Perret. Évoluant en Ligue A Féminine.",
    logo: "/lovable-uploads/778a9033-e16f-49d0-8f4e-7ae11c48b1bb.png",
    website: "https://lesmariannes92.com",
    email: "contact@lesmariannes92.com",
    location: "Levallois-Perret, France",
    founded: "1986",
    type: "Club",
    sports: ["Volleyball"],
    instagram: "https://instagram.com/lesmariannes92",
    rating: 3.9,
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

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un organisateur, sport, lieu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pl-10 h-12 text-lg"
          />
        </div>

        {/* Sports Filters - Default Display */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPORT_FILTERS.map((sport) => (
            <button
              key={sport.key}
              onClick={() => setSelectedSport(sport.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                selectedSport === sport.name
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              {sport.icon && <span className="text-sm">{sport.icon}</span>}
              <span className="font-medium text-sm">{sport.name}</span>
            </button>
          ))}
        </div>

        {/* Sort and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant="sport"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés {showFilters ? "▲" : "▼"}
            </Button>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "events" | "followers")}
              className="px-3 py-2 border border-border rounded-md bg-white text-sm font-medium"
            >
              <option value="name">Trier par nom</option>
              <option value="events">Trier par événements</option>
              <option value="followers">Trier par abonnés</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 mb-6">
            {/* Type Filter */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Type d'organisateur</h3>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`filter-chip ${selectedType === type ? 'active' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Lieu</h3>
              <div className="flex flex-wrap gap-2">
                {LOCATION_FILTERS.map((location) => (
                  <button
                    key={location}
                    onClick={() => setSelectedLocation(location)}
                    className={`filter-chip ${selectedLocation === location ? 'active' : ''}`}
                  >
                    {location}
                  </button>
                ))}
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