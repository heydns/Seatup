import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Users, Calendar, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StadiumCard } from "@/components/StadiumCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stadium {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  capacity?: number | null;
  type?: string | null;
  opened_year?: number | null;
  description?: string | null;
  image_url?: string | null;
  coordinates?: any;
  amenities?: string[] | null;
  contact_info?: any;
}

const TYPE_FILTERS = [
  { label: "Tous les types", value: "all" },
  { label: "Salle polyvalente", value: "Salle polyvalente" },
  { label: "Stade", value: "Stade" },
  { label: "Gymnase", value: "Gymnase" },
];

const CAPACITY_FILTERS = [
  { label: "Toutes capacités", value: "all" },
  { label: "Moins de 20 000", value: "small" },
  { label: "20 000 - 50 000", value: "medium" },
  { label: "50 000 - 80 000", value: "large" },
  { label: "Plus de 80 000", value: "huge" },
];

const CITY_FILTERS = [
  "Toutes les villes",
  "Paris",
  "Saint-Denis", 
  "Marseille",
  "Munich",
  "Londres",
  "Barcelone"
];

export const StadiumsPage = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [filteredStadiums, setFilteredStadiums] = useState<Stadium[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("Toutes les villes");
  const [sortBy, setSortBy] = useState("name");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStadiums();
  }, []);

  useEffect(() => {
    filterStadiums();
  }, [stadiums, searchQuery, typeFilter, capacityFilter, cityFilter, sortBy]);

  const fetchStadiums = async () => {
    try {
      const { data, error } = await supabase
        .from('stadiums')
        .select('*')
        .order('name');

      if (error) throw error;

      setStadiums(data || []);
    } catch (error) {
      console.error('Error fetching stadiums:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les stades",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStadiums = () => {
    let filtered = [...stadiums];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(stadium =>
        stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stadium.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stadium.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(stadium => stadium.type === typeFilter);
    }

    // Capacity filter
    if (capacityFilter !== "all") {
      filtered = filtered.filter(stadium => {
        if (!stadium.capacity) return false;
        switch (capacityFilter) {
          case "small": return stadium.capacity < 20000;
          case "medium": return stadium.capacity >= 20000 && stadium.capacity < 50000;
          case "large": return stadium.capacity >= 50000 && stadium.capacity < 80000;
          case "huge": return stadium.capacity >= 80000;
          default: return true;
        }
      });
    }

    // City filter
    if (cityFilter !== "Toutes les villes") {
      filtered = filtered.filter(stadium => stadium.city === cityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "city":
          return a.city.localeCompare(b.city);
        case "capacity":
          return (b.capacity || 0) - (a.capacity || 0);
        case "year":
          return (b.opened_year || 0) - (a.opened_year || 0);
        default:
          return 0;
      }
    });

    setFilteredStadiums(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCapacityFilter("all");
    setCityFilter("Toutes les villes");
    setSortBy("name");
    setShowAdvancedFilters(false);
  };

  return (
    <div className="min-h-screen bg-accent">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Stades
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les stades mythiques où se déroulent nos événements
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un stade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {TYPE_FILTERS.map((filter) => (
              <Badge
                key={filter.value}
                variant={typeFilter === filter.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setTypeFilter(filter.value)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Capacité" />
                </SelectTrigger>
                <SelectContent>
                  {CAPACITY_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_FILTERS.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="city">Ville</SelectItem>
                  <SelectItem value="capacity">Capacité</SelectItem>
                  <SelectItem value="year">Année d'ouverture</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Effacer
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Chargement..."
            ) : (
              `${filteredStadiums.length} stade${filteredStadiums.length > 1 ? 's' : ''} trouvé${filteredStadiums.length > 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Stadiums Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredStadiums.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun stade trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={clearFilters} variant="outline">
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStadiums.map((stadium) => (
              <StadiumCard key={stadium.id} stadium={stadium} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};