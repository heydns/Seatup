import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Calendar, Euro, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "./EventCard";

interface Event {
  ID_event: number;
  Event: string;
  Date: string;
  Organization: string;
  Sport: string;
  Competition: string;
  Location: string;
  Adress: string;
  Access: string;
  Link: string;
}

const SPORTS_FILTERS = [
  "Tous",
  "Football",
  "Basketball", 
  "Tennis",
  "Rugby",
  "Handball",
  "Volleyball",
  "Natation",
  "Cyclisme"
];

const COMPETITION_FILTERS = [
  "Toutes",
  "Ligue 1",
  "Ligue 2", 
  "Top 14",
  "Pro D2",
  "Betclic Élite",
  "LNH",
  "Roland Garros",
  "Masters 1000"
];

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tous");
  const [selectedCompetition, setSelectedCompetition] = useState("Toutes");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Mock user balance - in real app this would come from context/props
  const userBalance = 75;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedSport, selectedCompetition]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('Event')
        .select('*')
        .order('Date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.Event?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.Organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.Location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.Sport?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sport filter
    if (selectedSport !== "Tous") {
      filtered = filtered.filter(event => 
        event.Sport?.toLowerCase().includes(selectedSport.toLowerCase())
      );
    }

    // Competition filter  
    if (selectedCompetition !== "Toutes") {
      filtered = filtered.filter(event =>
        event.Competition?.toLowerCase().includes(selectedCompetition.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header with Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-spartan font-black mb-2">
              Événements sportifs
            </h1>
            <p className="text-xl text-muted-foreground">
              Découvrez {filteredEvents.length} événements disponibles
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="balance-badge">
              💳 Solde: {userBalance}€
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un événement, club, ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pl-10 h-12 text-lg"
          />
        </div>

        {/* Filters Toggle */}
        <div className="mb-6">
          <Button
            variant="sport"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres {showFilters ? "▲" : "▼"}
          </Button>

          {showFilters && (
            <div className="space-y-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-border/50">
              {/* Sport Filter */}
              <div>
                <h3 className="font-spartan font-bold mb-2">Sport</h3>
                <div className="flex flex-wrap gap-2">
                  {SPORTS_FILTERS.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`filter-chip ${selectedSport === sport ? 'active' : ''}`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              {/* Competition Filter */}
              <div>
                <h3 className="font-spartan font-bold mb-2">Compétition</h3>
                <div className="flex flex-wrap gap-2">
                  {COMPETITION_FILTERS.map((competition) => (
                    <button
                      key={competition}
                      onClick={() => setSelectedCompetition(competition)}
                      className={`filter-chip ${selectedCompetition === competition ? 'active' : ''}`}
                    >
                      {competition}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="card-sport max-w-md mx-auto">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-spartan font-bold mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                variant="sport"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSport("Tous");
                  setSelectedCompetition("Toutes");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.ID_event} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};