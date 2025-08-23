import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, MapPin, Calendar, Euro, Users, Heart, Star, Zap, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "./EventCard";
import { Header } from "./Header";
import { SportIcon } from "./SportIcon";
import { useNavigate } from "react-router-dom";

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
  { name: "Tous", icon: "", key: "all" },
  { name: "Football", icon: "football", key: "football" },
  { name: "Basketball", icon: "basketball", key: "basketball" }, 
  { name: "Tennis", icon: "tennis", key: "tennis" },
  { name: "Rugby", icon: "rugby", key: "rugby" },
  { name: "Handball", icon: "handball", key: "handball" },
  { name: "Volleyball", icon: "volleyball", key: "volleyball" },
  { name: "Natation", icon: "natation", key: "natation" },
  { name: "Cyclisme", icon: "cyclisme", key: "cyclisme" },
  { name: "Autres sports", icon: "others", key: "others", hasDropdown: true }
];

const OTHER_SPORTS = [
  "Aquathlon",
  "Athlétisme",
  "Badminton",
  "Course à pied",
  "Courses hippiques",
  "Dance",
  "Football Américain",
  "Skateboard",
  "Tennis de Table",
  "Tennis Padel",
  "Trail",
  "Triathlon"
];

const SPORT_RELATIONS = {
  "Football": {
    competitions: ["Ligue 1", "Ligue 2"],
    venues: ["Parc des Princes", "Stade de France", "Stade Jean-Bouin", "Stade Charléty"]
  },
  "Basketball": {
    competitions: ["Jeep Élite", "Pro B"],
    venues: ["Paris La Défense Arena", "Halle Carpentier"]
  },
  "Tennis": {
    competitions: ["Masters 1000", "Grand Chelem"],
    venues: ["Roland-Garros", "Paris La Défense Arena"]
  },
  "Rugby": {
    competitions: ["Top 14", "Pro D2"],
    venues: ["Stade de France", "Stade Jean-Bouin"]
  },
  "Handball": {
    competitions: ["LNH", "StarLigue"],
    venues: ["Stade Pierre de Coubertin", "Halle Carpentier"]
  },
  "Volleyball": {
    competitions: ["Ligue A Féminine", "Ligue A Masculine"],
    venues: ["Halle Carpentier", "Paris La Défense Arena"]
  },
  "Natation": {
    competitions: ["Championnats de France", "Meeting de Paris"],
    venues: ["Paris La Défense Arena"]
  },
  "Cyclisme": {
    competitions: ["Tour de France", "Paris-Roubaix"],
    venues: ["Stade de France", "Ville de Paris"]
  }
};

const DATE_FILTERS = [
  { name: "Aujourd'hui", key: "today" },
  { name: "Cette semaine", key: "week" },
  { name: "Ce week-end", key: "weekend" },
  { name: "Une date", key: "custom" }
];

const COMPETITION_FILTERS = [
  "Toutes",
  "Ligue 1",
  "Ligue 2", 
  "Top 14",
  "Pro D2",
  "Jeep Élite",
  "LNH",
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
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tous");
  const [selectedCompetition, setSelectedCompetition] = useState("Toutes");
  const [selectedVenue, setSelectedVenue] = useState("Tous");
  const [selectedDate, setSelectedDate] = useState("Tous");
  const [customDate, setCustomDate] = useState<Date>();
  const [showOtherSports, setShowOtherSports] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "price" | "popularity">("date");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Mock user balance - in real app this would come from context/props
  const userBalance = 75;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedSport, selectedCompetition, selectedVenue, selectedDate, customDate, sortBy]);

  // Close dropdowns and date picker on significant scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);
      
      // Close dropdowns only if user scrolled significantly (more than 100px)
      if (scrollDifference > 100) {
        setShowOtherSports(false);
        setShowDatePicker(false);
        setLastScrollY(currentScrollY);
      }

      // Close date picker after 3/4 scroll for better UX
      if (scrollDifference > 75 && isDatePickerOpen) {
        setIsDatePickerOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isDatePickerOpen]);

  // Get filtered options based on current selections
  const getAvailableCompetitions = () => {
    let availableCompetitions = COMPETITION_FILTERS;
    
    // Filter by sport
    if (selectedSport !== "Tous" && SPORT_RELATIONS[selectedSport]) {
      availableCompetitions = ["Toutes", ...SPORT_RELATIONS[selectedSport].competitions];
    }
    
    // Filter by venue
    if (selectedVenue !== "Tous") {
      const sportsForVenue = Object.entries(SPORT_RELATIONS).filter(([sport, data]) => 
        data.venues.includes(selectedVenue)
      );
      const competitionsForVenue = sportsForVenue.flatMap(([sport, data]) => data.competitions);
      availableCompetitions = availableCompetitions.filter(comp => 
        comp === "Toutes" || competitionsForVenue.includes(comp)
      );
    }
    
    return availableCompetitions;
  };

  const getAvailableVenues = () => {
    let availableVenues = VENUE_FILTERS;
    
    // Filter by sport
    if (selectedSport !== "Tous" && SPORT_RELATIONS[selectedSport]) {
      availableVenues = ["Tous", ...SPORT_RELATIONS[selectedSport].venues];
    }
    
    // Filter by competition
    if (selectedCompetition !== "Toutes") {
      const sportsForCompetition = Object.entries(SPORT_RELATIONS).filter(([sport, data]) => 
        data.competitions.includes(selectedCompetition)
      );
      const venuesForCompetition = sportsForCompetition.flatMap(([sport, data]) => data.venues);
      availableVenues = availableVenues.filter(venue => 
        venue === "Tous" || venuesForCompetition.includes(venue)
      );
    }
    
    return availableVenues;
  };

  const getAvailableSports = () => {
    let availableSports = SPORTS_FILTERS;
    
    // Filter by competition
    if (selectedCompetition !== "Toutes") {
      const sportsForCompetition = Object.entries(SPORT_RELATIONS)
        .filter(([sport, data]) => data.competitions.includes(selectedCompetition))
        .map(([sport]) => sport);
      availableSports = availableSports.filter(sportFilter => 
        sportFilter.key === "all" || sportsForCompetition.includes(sportFilter.name)
      );
    }
    
    // Filter by venue
    if (selectedVenue !== "Tous") {
      const sportsForVenue = Object.entries(SPORT_RELATIONS)
        .filter(([sport, data]) => data.venues.includes(selectedVenue))
        .map(([sport]) => sport);
      availableSports = availableSports.filter(sportFilter => 
        sportFilter.key === "all" || sportsForVenue.includes(sportFilter.name)
      );
    }
    
    return availableSports;
  };

  // Filter by date
  const filterByDate = (events: Event[]) => {
    if (selectedDate === "Tous") return events;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.Date);
      eventDate.setHours(0, 0, 0, 0);
      
      switch (selectedDate) {
        case "today":
          return eventDate.getTime() === today.getTime();
        case "week":
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          return eventDate >= today && eventDate <= weekEnd;
        case "weekend":
          const nextSaturday = new Date(today);
          nextSaturday.setDate(today.getDate() + (6 - today.getDay()));
          const nextSunday = new Date(nextSaturday);
          nextSunday.setDate(nextSaturday.getDate() + 1);
          return eventDate.getTime() === nextSaturday.getTime() || eventDate.getTime() === nextSunday.getTime();
        case "custom":
          if (!customDate) return true;
          const customDateObj = new Date(customDate);
          customDateObj.setHours(0, 0, 0, 0);
          return eventDate.getTime() === customDateObj.getTime();
        default:
          return true;
      }
    });
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('Event')
        .select('*')
        .order('Date', { ascending: true });

      if (error) throw error;
      
      // Fallback events from homepage
      const fallbackEvents = [
        {
          ID_event: 11,
          Event: "PSG vs SCO Angers - Journée 1 Ligue 1",
          Date: "2025-08-24",
          Organization: "Paris Saint-Germain",
          Sport: "Football",
          Competition: "Ligue 1",
          Location: "Parc des Princes",
          Adress: "Parc des Princes, Paris",
          Access: "Ticketing",
          Link: "https://psg.fr",
          Original_Price: "45€",
          Our_Price: "36€"
        },
        {
          ID_event: 12,
          Event: "Paris Basketball - Abonnement 25/26",
          Date: "2025-07-27",
          Organization: "Paris Basketball",
          Sport: "Basketball",
          Competition: "Jeep Élite",
          Location: "Adidas Arena",
          Adress: "Adidas Arena, Paris La Défense",
          Access: "Ticketing",
          Link: "https://parisbasketball.com",
          Original_Price: "250€",
          Our_Price: "200€"
        },
        {
          ID_event: 13,
          Event: "Rolex Paris Master 2025",
          Date: "2025-07-28",
          Organization: "Rolex Paris Masters",
          Sport: "Tennis",
          Competition: "ATP Masters 1000",
          Location: "La Défense U Arena",
          Adress: "La Défense U Arena, Nanterre",
          Access: "Ticketing",
          Link: "https://rolexparismasters.com",
          Original_Price: "80€",
          Our_Price: "64€"
        },
        {
          ID_event: 14,
          Event: "Hoka Semi Marathon Paris 2025",
          Date: "2025-07-29",
          Organization: "Hoka Running",
          Sport: "Course à pied",
          Competition: "Semi Marathon",
          Location: "Ville de Paris",
          Adress: "Paris, France",
          Access: "Inscription",
          Link: "https://hokaparis.com",
          Original_Price: "55€",
          Our_Price: "44€"
        },
        {
          ID_event: 15,
          Event: "Les Mariannes 92 - Saison 25/26",
          Date: "2025-07-30",
          Organization: "Les Mariannes 92",
          Sport: "Volleyball",
          Competition: "Ligue A Féminine",
          Location: "Le palais des sports Marcel Cerdan",
          Adress: "Palais des sports Marcel Cerdan, Levallois-Perret",
          Access: "Ticketing",
          Link: "https://lesmariannes92.com",
          Original_Price: "105€",
          Our_Price: "84€"
        },
        {
          ID_event: 16,
          Event: "PSG Handball - Dunkerque / Journée 1 StarLigue",
          Date: "2025-09-07",
          Organization: "PSG Handball",
          Sport: "Handball",
          Competition: "StarLigue",
          Location: "Stade Pierre de Coubertin",
          Adress: "Stade Pierre de Coubertin, Paris",
          Access: "Ticketing",
          Link: "https://psghandball.com",
          Original_Price: "35€",
          Our_Price: "28€"
        }
      ];
      
      let allEvents = data || [];
      
      // Remove any existing events that match our fallback events
      allEvents = allEvents.filter(event => 
        !fallbackEvents.some(fallback => fallback.ID_event === event.ID_event)
      );
      
      // Add all fallback events
      allEvents.push(...fallbackEvents);
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Use all fallback events in case of complete network failure
      const fallbackEvents = [
        {
          ID_event: 11,
          Event: "PSG vs SCO Angers - Journée 1 Ligue 1",
          Date: "2025-08-24",
          Organization: "Paris Saint-Germain",
          Sport: "Football",
          Competition: "Ligue 1",
          Location: "Parc des Princes",
          Adress: "Parc des Princes, Paris",
          Access: "Ticketing",
          Link: "https://psg.fr",
          Original_Price: "45€",
          Our_Price: "36€"
        },
        {
          ID_event: 12,
          Event: "Paris Basketball - Abonnement 25/26",
          Date: "2025-07-27",
          Organization: "Paris Basketball",
          Sport: "Basketball",
          Competition: "Jeep Élite",
          Location: "Adidas Arena",
          Adress: "Adidas Arena, Paris La Défense",
          Access: "Ticketing",
          Link: "https://parisbasketball.com",
          Original_Price: "250€",
          Our_Price: "200€"
        },
        {
          ID_event: 13,
          Event: "Rolex Paris Master 2025",
          Date: "2025-07-28",
          Organization: "Rolex Paris Masters",
          Sport: "Tennis",
          Competition: "ATP Masters 1000",
          Location: "La Défense U Arena",
          Adress: "La Défense U Arena, Nanterre",
          Access: "Ticketing",
          Link: "https://rolexparismasters.com",
          Original_Price: "80€",
          Our_Price: "64€"
        },
        {
          ID_event: 14,
          Event: "Hoka Semi Marathon Paris 2025",
          Date: "2025-07-29",
          Organization: "Hoka Running",
          Sport: "Course à pied",
          Competition: "Semi Marathon",
          Location: "Ville de Paris",
          Adress: "Paris, France",
          Access: "Inscription",
          Link: "https://hokaparis.com",
          Original_Price: "55€",
          Our_Price: "44€"
        },
        {
          ID_event: 15,
          Event: "Les Mariannes 92 - Saison 25/26",
          Date: "2025-07-30",
          Organization: "Les Mariannes 92",
          Sport: "Volleyball",
          Competition: "Ligue A Féminine",
          Location: "Le palais des sports Marcel Cerdan",
          Adress: "Palais des sports Marcel Cerdan, Levallois-Perret",
          Access: "Ticketing",
          Link: "https://lesmariannes92.com",
          Original_Price: "105€",
          Our_Price: "84€"
        },
        {
          ID_event: 16,
          Event: "PSG Handball - Dunkerque / Journée 1 StarLigue",
          Date: "2025-09-07",
          Organization: "PSG Handball",
          Sport: "Handball",
          Competition: "StarLigue",
          Location: "Stade Pierre de Coubertin",
          Adress: "Stade Pierre de Coubertin, Paris",
          Access: "Ticketing",
          Link: "https://psghandball.com",
          Original_Price: "35€",
          Our_Price: "28€"
        }
      ];
      setEvents(fallbackEvents);
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

    // Date filter
    filtered = filterByDate(filtered);

    // Sport filter (including "Autres sports")
    if (selectedSport !== "Tous") {
      if (selectedSport === "Autres sports") {
        filtered = filtered.filter(event => 
          OTHER_SPORTS.some(sport => event.Sport?.toLowerCase().includes(sport.toLowerCase()))
        );
      } else {
        filtered = filtered.filter(event => 
          event.Sport?.toLowerCase().includes(selectedSport.toLowerCase())
        );
      }
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
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header with Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-xl md:text-3xl font-monument mb-2">
              Nos événements à venir
            </h1>
            <p className="text-xl text-muted-foreground">
              Découvrez {filteredEvents.length} événements disponibles
            </p>
          </div>
          {/* Balance only shown when user is authenticated - will be implemented later */}
          {false && (
            <div className="mt-4 md:mt-0">
              <div className="balance-badge">
                💳 Solde: {userBalance}€
              </div>
            </div>
          )}
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

        {/* Date Filters - Default Display */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DATE_FILTERS.map((dateFilter) => (
            <div key={dateFilter.key}>
              {dateFilter.key === "custom" ? (
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                        selectedDate === dateFilter.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                      onClick={() => {
                        setSelectedDate(dateFilter.key);
                        setIsDatePickerOpen(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 cursor-pointer" />
                      <span className="font-medium text-sm">
                        {customDate ? format(customDate, "dd/MM/yyyy", { locale: fr }) : dateFilter.name}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customDate}
                      onSelect={(date) => {
                        setCustomDate(date);
                        setSelectedDate("custom");
                        setIsDatePickerOpen(false); // Close after selection
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto bg-white"
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  onClick={() => setSelectedDate(dateFilter.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                    selectedDate === dateFilter.key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-sm">{dateFilter.name}</span>
                </button>
              )}
            </div>
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
            {/* Sports Filter */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Sports</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {getAvailableSports().map((sport) => (
                  <div key={sport.key} className="relative">
                    {sport.hasDropdown ? (
                      <div className="relative">
                        <button
                          onClick={() => setShowOtherSports(!showOtherSports)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                            selectedSport === sport.name
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                        {sport.icon && <SportIcon sport={sport.icon} className="w-4 h-4" />}
                          <span className="font-medium text-sm">{sport.name}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {showOtherSports && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-2 z-[60] min-w-48">
                            {OTHER_SPORTS.map((otherSport) => (
                              <button
                                key={otherSport}
                                onClick={() => {
                                  setSelectedSport(otherSport);
                                  setShowOtherSports(false);
                                }}
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-primary/5 rounded-md transition-colors"
                              >
                                {otherSport}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSport(sport.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                          selectedSport === sport.name
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white border-border hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {sport.icon && <SportIcon sport={sport.icon} className="w-4 h-4" />}
                        <span className="font-medium text-sm">{sport.name}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Competition Filter - Dynamic based on sport */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Compétition</h3>
              <div className="flex flex-wrap gap-2">
                {getAvailableCompetitions().map((competition) => (
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

            {/* Venue Filter - Dynamic based on sport */}
            <div>
              <h3 className="font-monument mb-3 text-sm">Lieu</h3>
              <div className="flex flex-wrap gap-2">
                {getAvailableVenues().map((venue) => (
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
                  setSelectedDate("Tous");
                  setCustomDate(undefined);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        ) : (
          <>
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
    </>
  );
};