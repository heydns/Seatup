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
  sports?: string[];
  stats?: {
    eventsCount: number;
    followersCount: string;
    rating: number;
  };
}

const SPORT_FILTERS = [
  { name: "Tous", key: "all" },
  { name: "Football", key: "football" },
  { name: "Basketball", key: "basketball" },
  { name: "Tennis", key: "tennis" },
  { name: "Rugby", key: "rugby" },
  { name: "Handball", key: "handball" },
  { name: "Volleyball", key: "volleyball" },
  { name: "Course à pied", key: "course" },
];

const LOCATION_FILTERS = [
  "Toutes",
  "Paris",
  "Nanterre", 
  "Levallois-Perret"
];

const ORGANIZERS_DATA: Organizer[] = [
  {
    name: "Paris Basketball",
    description: "Paris Basketball est un club de basketball professionnel français basé à Paris et évoluant en Jeep Élite, l'élite du basketball français.",
    logo: "/lovable-uploads/2837c0cc-2ffb-4656-92c6-96c4f4dfd60f.png",
    website: "https://parisbasketball.com",
    email: "contact@parisbasketball.com",
    location: "Paris, France",
    founded: "2018",
    sports: ["Basketball"],
    stats: {
      eventsCount: 25,
      followersCount: "15K",
      rating: 4.8
    }
  },
  {
    name: "Paris Saint-Germain",
    description: "Le Paris Saint-Germain Football Club est un club de football français fondé le 12 août 1970. Basé à Paris, le club évolue en Ligue 1.",
    logo: "/lovable-uploads/147eb088-277c-4032-b6b4-e01dfed524d3.png",
    website: "https://psg.fr",
    email: "contact@psg.fr",
    location: "Paris, France",
    founded: "1970",
    sports: ["Football"],
    stats: {
      eventsCount: 45,
      followersCount: "2.1M",
      rating: 4.9
    }
  },
  {
    name: "PSG Handball",
    description: "Le Paris Saint-Germain Handball est la section handball du Paris Saint-Germain. Fondé en 1992, le club évolue en StarLigue.",
    logo: "/lovable-uploads/585f742a-f198-48d5-aaff-54c375f30f55.png",
    website: "https://psghandball.com",
    email: "contact@psghandball.com",
    location: "Paris, France",
    founded: "1992",
    sports: ["Handball"],
    stats: {
      eventsCount: 30,
      followersCount: "125K",
      rating: 4.7
    }
  },
  {
    name: "Rolex Paris Masters",
    description: "Le Rolex Paris Masters est un tournoi de tennis masculin professionnel qui se déroule chaque année à Paris.",
    logo: "/lovable-uploads/7809806e-e8e7-44e8-8cb6-4e9157c04ac5.png",
    website: "https://rolexparismasters.com",
    email: "info@rolexparismasters.com",
    location: "Nanterre, France",
    founded: "1968",
    sports: ["Tennis"],
    stats: {
      eventsCount: 12,
      followersCount: "89K",
      rating: 4.8
    }
  },
  {
    name: "Hoka Running",
    description: "Hoka est une marque de chaussures de course française fondée en 2009. Elle organise plusieurs événements de course à pied en France.",
    logo: "/lovable-uploads/56eb70ed-a5f5-4845-b859-1354756c82ff.png",
    website: "https://hokaparis.com",
    email: "events@hoka.com",
    location: "Paris, France",
    founded: "2009",
    sports: ["Course à pied"],
    stats: {
      eventsCount: 8,
      followersCount: "45K",
      rating: 4.6
    }
  },
  {
    name: "Les Mariannes 92",
    description: "Les Mariannes 92 est un club de volleyball féminin français basé à Levallois-Perret. Évoluant en Ligue A Féminine.",
    logo: "/lovable-uploads/498f232f-981f-4bb2-ab0f-d9d08551a8fb.png",
    website: "https://lesmariannes92.com",
    email: "contact@lesmariannes92.com",
    location: "Levallois-Perret, France",
    founded: "1986",
    sports: ["Volleyball"],
    stats: {
      eventsCount: 18,
      followersCount: "12K",
      rating: 4.5
    }
  }
];

export const OrganizersPage = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>(ORGANIZERS_DATA);
  const [filteredOrganizers, setFilteredOrganizers] = useState<Organizer[]>(ORGANIZERS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tous");
  const [selectedLocation, setSelectedLocation] = useState("Toutes");
  const [sortBy, setSortBy] = useState<"name" | "events" | "rating" | "followers">("name");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    filterOrganizers();
  }, [organizers, searchQuery, selectedSport, selectedLocation, sortBy]);

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

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "events":
          return (b.stats?.eventsCount || 0) - (a.stats?.eventsCount || 0);
        case "rating":
          return (b.stats?.rating || 0) - (a.stats?.rating || 0);
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
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Rechercher un organisateur, sport, lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Sport</label>
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORT_FILTERS.map((sport) => (
                          <SelectItem key={sport.key} value={sport.name}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Lieu</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_FILTERS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Trier par</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="events">Nombre d'événements</SelectItem>
                        <SelectItem value="rating">Note</SelectItem>
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