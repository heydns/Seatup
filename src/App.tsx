import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { EventsPage } from "@/components/EventsPage";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import { EventDetail } from "@/pages/EventDetail";
import { OrganizerDetail } from "@/pages/OrganizerDetail";
import { OrganizersPage } from "@/pages/OrganizersPage";
import { StadiumsPage } from "@/pages/StadiumsPage";
import { StadiumDetail } from "@/pages/StadiumDetail";
import { TeamDetail } from "@/pages/TeamDetail";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/organizers" element={<OrganizersPage />} />
            <Route path="/stadiums" element={<StadiumsPage />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/organizer/:name" element={<OrganizerDetail />} />
            <Route path="/stadium/:id" element={<StadiumDetail />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
