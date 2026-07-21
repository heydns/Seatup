import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ReservationsProvider } from "@/contexts/ReservationsContext";
import { AuthDebug } from "@/components/AuthDebug";
import { EventsPage } from "@/components/EventsPage";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import MerchantInvoices from "@/pages/MerchantInvoices";
import MerchantStats from "@/pages/MerchantStats";
import MerchantCommunication from "@/pages/MerchantCommunication";
import Dashboard from "@/pages/Dashboard";
import BeneficiaryHome from "@/pages/BeneficiaryHome";
import { EventDetail } from "@/pages/EventDetail";
import { OrganizerDetail } from "@/pages/OrganizerDetail";
import { OrganizersPage } from "@/pages/OrganizersPage";
import { StadiumsPage } from "@/pages/StadiumsPage";
import { StadiumDetail } from "@/pages/StadiumDetail";
import { TeamDetail } from "@/pages/TeamDetail";
import TeamPage from "@/pages/TeamPage";
import GroupsPage from "@/pages/GroupsPage";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ReservationsProvider>
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/marchand/factures" element={<MerchantInvoices />} />
            <Route path="/admin/marchand/stats" element={<MerchantStats />} />
            <Route path="/admin/marchand/communication" element={<MerchantCommunication />} />
            <Route path="/home" element={<BeneficiaryHome />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* <AuthDebug /> */}
        </BrowserRouter>
      </TooltipProvider>
      </ReservationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;