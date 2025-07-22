import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Calendar, Euro, Users, Heart, Star, Zap } from "lucide-react";
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
  { name: "Tous", icon: "⚽", key: "all" },
  { name: "Football", icon: "⚽", key: "football" },
  { name: "Basketball", icon: "🏀", key: "basketball" }, 
  { name: "Tennis", icon: "🎾", key: "tennis" },
  { name: "Rugby", icon: "🏉", key: "rugby" },
  { name: "Handball", icon: "🤾", key: "handball" },
  { name: "Volleyball", icon: "🏐", key: "volleyball" },
  { name: "Natation", icon: "🏊", key: "natation" },
  { name: "Cyclisme", icon: "🚴", key: "cyclisme" }
];

const COMPETITION_FILTERS = [
  "Toutes",
  "Ligue 1",
  "Ligue 2", 
  "Top 14",
  "Pro D2",
  "Jeep Élite",
  "LNH",
  "Roland Garros",
  "Masters 1000",
  "Grand Chelem"
];

const VENUE_FILTERS = [
  "Tous",
  "Parc des Princes",
  "Stade de France", 
  "Roland-Garros",
  "Paris La Défense Arena",
  "Halle Carpentier",
  "Stade Jean-Bouin",
  "Stade Charléty"
];

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tous");
  const [selectedCompetition, setSelectedCompetition] = useState("Toutes");
  const [selectedVenue, setSelectedVenue] = useState("Tous");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "price" | "popularity">("date");

  // Mock user balance - in real app this would come from context/props
  const userBalance = 75;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedSport, selectedCompetition, selectedVenue, sortBy]);

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

    // Venue filter
    if (selectedVenue !== "Tous") {
      filtered = filtered.filter(event =>
        event.Location?.toLowerCase().includes(selectedVenue.toLowerCase())
      );
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.Date || "").getTime() - new Date(b.Date || "").getTime();
        case "price":
          // Mock sorting by price since we don't have real prices
          return Math.random() - 0.5;
        case "popularity":
          // Mock sorting by popularity
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const toggleFavorite = (eventId: number) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
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
    <div className="min-h-screen pt-24 pb-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header with Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-monument mb-2">
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

        {/* Category Pills - Dice.fm Style */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPORTS_FILTERS.map((sport) => (
            <button
              key={sport.key}
              onClick={() => setSelectedSport(sport.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                selectedSport === sport.name
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <span className="text-sm">{sport.icon}</span>
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
              onChange={(e) => setSortBy(e.target.value as "date" | "price" | "popularity")}
              className="px-3 py-2 border border-border rounded-md bg-white text-sm font-medium"
            >
              <option value="date">Trier par date</option>
              <option value="price">Trier par prix</option>
              <option value="popularity">Trier par popularité</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 mb-6">
            {/* Competition Filter */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Compétition</h3>
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

            {/* Venue Filter */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Lieu</h3>
              <div className="flex flex-wrap gap-2">
                {VENUE_FILTERS.map((venue) => (
                  <button
                    key={venue}
                    onClick={() => setSelectedVenue(venue)}
                    className={`filter-chip ${selectedVenue === venue ? 'active' : ''}`}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="card-sport max-w-md mx-auto">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-monument mb-2">
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
                  setSelectedVenue("Tous");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Popular Events Section - Dice.fm Style */}
            <div className="mb-8">
              <h3 className="text-xl font-monument mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Événements populaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {filteredEvents.slice(0, 4).map((event) => (
                  <div key={`popular-${event.ID_event}`} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                      <div className="aspect-square overflow-hidden relative">
                        <img 
                          src={`https://picsum.photos/300/300?random=${event.ID_event}`} 
                          alt={event.Event} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <button
                          onClick={() => toggleFavorite(event.ID_event)}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                        >
                          <Heart 
                            className={`h-4 w-4 ${favorites.includes(event.ID_event) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                          />
                        </button>
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                            {event.Sport}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-monument text-sm font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {event.Event}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.Date}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {event.Location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.ID_event} className="relative">
                  <EventCard event={event} />
                  <button
                    onClick={() => toggleFavorite(event.ID_event)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors z-10"
                  >
                    <Heart 
                      className={`h-4 w-4 ${favorites.includes(event.ID_event) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                    />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};