/**
 * Seatup — Source unique de fake data pour tout le MVP démo.
 * ─────────────────────────────────────────────────────────────────────────
 * Toutes les vues (Home, EventsPage, EventDetail, BeneficiaryHome,
 * CSEAdminDashboard, OrganizerAdminDashboard) importent depuis ce fichier
 * pour assurer la cohérence — un event vu sur la home doit être le même
 * dans le dashboard organisateur correspondant.
 *
 * Les IDs 11→16 sont conservés pour ne pas casser les liens existants
 * (EventsPage / EventDetail / lovable-uploads d'images).
 *
 * Ce fichier est 100% statique : aucune dépendance API, Supabase ou autre.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Format compatible avec le schema Supabase "Event" historique (capitales). */
export interface MockEvent {
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
  Original_Price: string;
  Our_Price: string;
  /** Champs ajoutés pour les dashboards admin */
  totalTickets: number;
  soldTickets: number;
  imageUrl?: string;
}

export interface MockOrganizer {
  id: string;
  name: string;
  logo?: string;
  sport: string;
  city: string;
  websiteUrl?: string;
}

export interface MockCseCompany {
  id: string;
  name: string;
  totalBudget: number;
  consumedBudget: number;
  monthlySpending: number;
}

export interface MockBeneficiary {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  cseCompanyId: string;
  allocatedBudget: number;
  consumedBudget: number;
  status: 'active' | 'inactive';
  lastActivity: string;
  favoriteEvents: string[];
}

export interface MockReservation {
  id: number;
  beneficiaryId: number;
  eventId: number;
  date: string;
  quantity: number;
  originalPrice: number;
  subsidizedAmount: number;
  finalPrice: number;
  status: 'confirmed' | 'cancelled' | 'pending';
}

export interface MockSocialMessage {
  id: number;
  name: string;
  message: string;
  time: string;
  unread: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — IDs 11→16 conservés pour compatibilité Lovable
// ─────────────────────────────────────────────────────────────────────────────

export const mockEvents: MockEvent[] = [
  {
    ID_event: 11,
    Event: 'PSG vs SCO Angers - Journée 1 Ligue 1',
    Date: '2026-08-24',
    Organization: 'Paris Saint-Germain',
    Sport: 'Football',
    Competition: 'Ligue 1',
    Location: 'Parc des Princes',
    Adress: 'Parc des Princes, Paris',
    Access: 'Ticketing',
    Link: 'https://psg.fr',
    Original_Price: '45€',
    Our_Price: '36€',
    totalTickets: 47000,
    soldTickets: 41320,
    imageUrl: '/lovable-uploads/147eb088-277c-4032-b6b4-e01dfed524d3.png',
  },
  {
    ID_event: 12,
    Event: 'Paris Basketball - Abonnement 25/26',
    Date: '2026-07-27',
    Organization: 'Paris Basketball',
    Sport: 'Basketball',
    Competition: 'Jeep Élite',
    Location: 'Adidas Arena',
    Adress: 'Adidas Arena, Paris La Défense',
    Access: 'Ticketing',
    Link: 'https://parisbasketball.com',
    Original_Price: '250€',
    Our_Price: '200€',
    totalTickets: 8000,
    soldTickets: 6420,
    imageUrl: '/lovable-uploads/2837c0cc-2ffb-4656-92c6-96c4f4dfd60f.png',
  },
  {
    ID_event: 13,
    Event: 'Rolex Paris Master 2026',
    Date: '2026-07-28',
    Organization: 'Rolex Paris Masters',
    Sport: 'Tennis',
    Competition: 'ATP Masters 1000',
    Location: 'La Défense U Arena',
    Adress: 'La Défense U Arena, Nanterre',
    Access: 'Ticketing',
    Link: 'https://rolexparismasters.com',
    Original_Price: '80€',
    Our_Price: '64€',
    totalTickets: 16000,
    soldTickets: 9870,
    imageUrl: '/lovable-uploads/7809806e-e8e7-44e8-8cb6-4e9157c04ac5.png',
  },
  {
    ID_event: 14,
    Event: 'Hoka Semi Marathon Paris 2026',
    Date: '2026-07-29',
    Organization: 'Hoka Running',
    Sport: 'Course à pied',
    Competition: 'Semi Marathon',
    Location: 'Ville de Paris',
    Adress: 'Paris, France',
    Access: 'Inscription',
    Link: 'https://hokaparis.com',
    Original_Price: '55€',
    Our_Price: '44€',
    totalTickets: 25000,
    soldTickets: 18450,
    imageUrl: '/lovable-uploads/56eb70ed-a5f5-4845-b859-1354756c82ff.png',
  },
  {
    ID_event: 15,
    Event: 'Les Mariannes 92 - Saison 25/26',
    Date: '2026-07-30',
    Organization: 'Les Mariannes 92',
    Sport: 'Volleyball',
    Competition: 'Ligue A Féminine',
    Location: 'Le palais des sports Marcel Cerdan',
    Adress: 'Palais des sports Marcel Cerdan, Levallois-Perret',
    Access: 'Ticketing',
    Link: 'https://lesmariannes92.com',
    Original_Price: '105€',
    Our_Price: '84€',
    totalTickets: 3200,
    soldTickets: 1980,
    imageUrl: '/lovable-uploads/498f232f-981f-4bb2-ab0f-d9d08551a8fb.png',
  },
  {
    ID_event: 16,
    Event: 'PSG Handball - Dunkerque / Journée 1 StarLigue',
    Date: '2026-09-07',
    Organization: 'PSG Handball',
    Sport: 'Handball',
    Competition: 'StarLigue',
    Location: 'Stade Pierre de Coubertin',
    Adress: 'Stade Pierre de Coubertin, Paris',
    Access: 'Ticketing',
    Link: 'https://psghandball.com',
    Original_Price: '35€',
    Our_Price: '28€',
    totalTickets: 4200,
    soldTickets: 3120,
    imageUrl: '/lovable-uploads/585f742a-f198-48d5-aaff-54c375f30f55.png',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZERS
// ─────────────────────────────────────────────────────────────────────────────

export const mockOrganizers: MockOrganizer[] = [
  { id: 'org_psg', name: 'Paris Saint-Germain', sport: 'Football', city: 'Paris', websiteUrl: 'https://psg.fr' },
  { id: 'org_paris_basket', name: 'Paris Basketball', sport: 'Basketball', city: 'Paris', websiteUrl: 'https://parisbasketball.com' },
  { id: 'org_rpm', name: 'Rolex Paris Masters', sport: 'Tennis', city: 'Nanterre', websiteUrl: 'https://rolexparismasters.com' },
  { id: 'org_mariannes', name: 'Les Mariannes 92', sport: 'Volleyball', city: 'Levallois-Perret', websiteUrl: 'https://lesmariannes92.com' },
  { id: 'org_psg_hand', name: 'PSG Handball', sport: 'Handball', city: 'Paris', websiteUrl: 'https://psghandball.com' },
];

export const organizationToOrgId: Record<string, string> = {
  'Paris Saint-Germain': 'org_psg',
  'Paris Basketball': 'org_paris_basket',
  'Rolex Paris Masters': 'org_rpm',
  'Les Mariannes 92': 'org_mariannes',
  'PSG Handball': 'org_psg_hand',
};

// ─────────────────────────────────────────────────────────────────────────────
// CSE COMPANY & BENEFICIAIRES (démo : Orus)
// ─────────────────────────────────────────────────────────────────────────────

export const mockCseCompany: MockCseCompany = {
  id: 'cse_orus',
  name: 'Orus',
  totalBudget: 50000,
  consumedBudget: 18500,
  monthlySpending: 6200,
};

export const mockBeneficiaries: MockBeneficiary[] = [
  { id: 1, userId: 'usr_marie', firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@orus.fr', cseCompanyId: 'cse_orus', allocatedBudget: 500, consumedBudget: 180, status: 'active', lastActivity: '2026-05-20', favoriteEvents: ['Football', 'Tennis'] },
  { id: 2, userId: 'usr_pierre', firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@orus.fr', cseCompanyId: 'cse_orus', allocatedBudget: 500, consumedBudget: 320, status: 'active', lastActivity: '2026-05-18', favoriteEvents: ['Football', 'Basketball'] },
  { id: 3, userId: 'usr_sophie', firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@orus.fr', cseCompanyId: 'cse_orus', allocatedBudget: 500, consumedBudget: 450, status: 'active', lastActivity: '2026-05-22', favoriteEvents: ['Tennis', 'Handball'] },
  { id: 4, userId: 'usr_lucas', firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@orus.fr', cseCompanyId: 'cse_orus', allocatedBudget: 500, consumedBudget: 84, status: 'active', lastActivity: '2026-05-15', favoriteEvents: ['Volleyball'] },
  { id: 5, userId: 'usr_emma', firstName: 'Emma', lastName: 'Laurent', email: 'emma.laurent@orus.fr', cseCompanyId: 'cse_orus', allocatedBudget: 500, consumedBudget: 0, status: 'inactive', lastActivity: '2026-04-30', favoriteEvents: [] },
];

// ─────────────────────────────────────────────────────────────────────────────
// RESERVATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const mockReservations: MockReservation[] = [
  { id: 1, beneficiaryId: 1, eventId: 11, date: '2026-05-20', quantity: 2, originalPrice: 90, subsidizedAmount: 18, finalPrice: 72, status: 'confirmed' },
  { id: 2, beneficiaryId: 2, eventId: 13, date: '2026-05-18', quantity: 1, originalPrice: 80, subsidizedAmount: 16, finalPrice: 64, status: 'confirmed' },
  { id: 3, beneficiaryId: 3, eventId: 16, date: '2026-05-22', quantity: 4, originalPrice: 140, subsidizedAmount: 28, finalPrice: 112, status: 'confirmed' },
  { id: 4, beneficiaryId: 4, eventId: 15, date: '2026-05-15', quantity: 1, originalPrice: 105, subsidizedAmount: 21, finalPrice: 84, status: 'confirmed' },
  { id: 5, beneficiaryId: 1, eventId: 12, date: '2026-04-12', quantity: 1, originalPrice: 250, subsidizedAmount: 50, finalPrice: 200, status: 'confirmed' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL MESSAGES (dashboard organisateur)
// ─────────────────────────────────────────────────────────────────────────────

export const mockSocialMessages: MockSocialMessage[] = [
  { id: 1, name: 'Marie Dubois', message: 'Quand sortent les billets pour le prochain match ?', time: '5 min', unread: true },
  { id: 2, name: 'Pierre Martin', message: 'Merci pour ce super événement !', time: '1h', unread: false },
  { id: 3, name: 'Sophie Laurent', message: 'Y aura-t-il des places VIP disponibles ?', time: '2h', unread: true },
  { id: 4, name: 'Lucas Moreau', message: 'Félicitations pour la victoire !', time: '3h', unread: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const getEventById = (id: number): MockEvent | null =>
  mockEvents.find((e) => e.ID_event === id) ?? null;

export const getEventsByOrganization = (organizationName: string): MockEvent[] =>
  mockEvents.filter((e) => e.Organization === organizationName);

export const getReservationsByBeneficiary = (beneficiaryId: number): MockReservation[] =>
  mockReservations.filter((r) => r.beneficiaryId === beneficiaryId);

export const getReservationsByCseCompany = (cseCompanyId: string): MockReservation[] => {
  const beneficiaryIds = mockBeneficiaries
    .filter((b) => b.cseCompanyId === cseCompanyId)
    .map((b) => b.id);
  return mockReservations.filter((r) => beneficiaryIds.includes(r.beneficiaryId));
};

export const computeCseStats = (cseCompanyId: string) => {
  const beneficiaries = mockBeneficiaries.filter((b) => b.cseCompanyId === cseCompanyId);
  const reservations = getReservationsByCseCompany(cseCompanyId);

  const sportCount: Record<string, number> = {};
  const orgCount: Record<string, number> = {};
  for (const r of reservations) {
    const ev = getEventById(r.eventId);
    if (!ev) continue;
    sportCount[ev.Sport] = (sportCount[ev.Sport] ?? 0) + r.quantity;
    orgCount[ev.Organization] = (orgCount[ev.Organization] ?? 0) + r.quantity;
  }

  return {
    totalBeneficiaries: beneficiaries.length,
    activeBeneficiaries: beneficiaries.filter((b) => b.status === 'active').length,
    inactiveBeneficiaries: beneficiaries.filter((b) => b.status === 'inactive').length,
    totalTicketsPurchased: reservations.reduce((s, r) => s + r.quantity, 0),
    totalSpent: reservations.reduce((s, r) => s + r.finalPrice, 0),
    averageSpending:
      beneficiaries.length > 0
        ? Math.round(
            beneficiaries.reduce((s, b) => s + b.consumedBudget, 0) / beneficiaries.length
          )
        : 0,
    topSports: Object.entries(sportCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sport, count]) => ({ sport, count })),
    topOrganizations: Object.entries(orgCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([organization, count]) => ({ organization, count })),
  };
};

export const computeOrganizerStats = (organizationName: string) => {
  const events = getEventsByOrganization(organizationName);

  const totalRevenue = events.reduce(
    (sum, e) => sum + e.soldTickets * parseInt(e.Our_Price.replace('€', ''), 10),
    0
  );
  const totalSold = events.reduce((sum, e) => sum + e.soldTickets, 0);
  const totalCapacity = events.reduce((sum, e) => sum + e.totalTickets, 0);
  const averagePrice =
    events.length > 0
      ? Math.round(
          events.reduce((s, e) => s + parseInt(e.Our_Price.replace('€', ''), 10), 0) /
            events.length
        )
      : 0;

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.Date) > now).length;

  return {
    events,
    totalRevenue,
    totalTicketsSold: totalSold,
    averageTicketPrice: averagePrice,
    upcomingEvents,
    fillRate: totalCapacity > 0 ? totalSold / totalCapacity : 0,
  };
};
