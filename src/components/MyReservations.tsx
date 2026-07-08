/**
 * MyReservations — section "Mes billets" pour BeneficiaryHome
 * ─────────────────────────────────────────────────────────────────────────
 * Drop ce composant dans src/components/MyReservations.tsx puis ajoute-le
 * à BeneficiaryHome.tsx :
 *
 *   import MyReservations from '@/components/MyReservations';
 *   ...
 *   <MyReservations />
 *
 * Affiche 2 onglets : "À venir" (avec QR code mocké) et "Passés".
 * Lit la donnée depuis useReservations() — donc sync auto avec EventDetail.
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Ticket, QrCode, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useReservations, type UserReservation } from '@/contexts/ReservationsContext';

function ReservationCard({
  reservation,
  upcoming,
  onCancel,
}: {
  reservation: UserReservation;
  upcoming: boolean;
  onCancel?: (id: number) => void;
}) {
  const { event } = reservation;
  if (!event) return null;

  return (
    <div className="card-event group">
      <div className="grid md:grid-cols-[200px_1fr_auto] gap-4 p-4">
        <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-lg bg-gray-100">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.Event}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Ticket className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-white">{event.Sport}</Badge>
            {reservation.status === 'cancelled' && (
              <Badge variant="outline" className="text-red-600 border-red-200">
                Annulée
              </Badge>
            )}
          </div>
          <h3 className="font-monument font-semibold text-lg line-clamp-2">
            {event.Event}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(event.Date).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.Location}
            </span>
            <span className="flex items-center gap-1">
              <Ticket className="h-4 w-4" />
              {reservation.quantity} billet{reservation.quantity > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground line-through">
              {reservation.originalPrice}€
            </span>
            <span className="font-semibold text-brand">
              {reservation.finalPrice}€ payés
            </span>
            <span className="text-xs text-green-600">
              −{reservation.subsidizedAmount}€ CSE
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2">
          {upcoming && reservation.status === 'confirmed' ? (
            <>
              <Button variant="hero" size="sm" className="gap-2">
                <QrCode className="h-4 w-4" />
                Mon billet
              </Button>
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-red-600 hover:border-red-200"
                  onClick={() => onCancel(reservation.id)}
                >
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
              )}
            </>
          ) : (
            <Link to={`/event/${event.ID_event}`}>
              <Button variant="sport" size="sm" className="gap-2 w-full">
                Revoir
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyReservations() {
  const { upcomingReservations, pastReservations, cancel } = useReservations();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const handleCancel = (id: number) => {
    cancel(id);
    toast.success('Réservation annulée', {
      description: 'Le montant a été recrédité sur votre cagnotte.',
    });
  };

  const totalCount = upcomingReservations.length + pastReservations.length;

  return (
    <section>
      <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-monument text-brand mb-2">
              <Ticket className="inline-block mr-3 h-6 w-6" />
              Mes Billets
            </h2>
            <p className="text-muted-foreground">
              {totalCount === 0
                ? "Aucun billet pour l'instant — découvrez les événements à venir"
                : `${upcomingReservations.length} à venir · ${pastReservations.length} passés`}
            </p>
          </div>
          <Link to="/events">
            <Button variant="sport" size="lg" className="group">
              Explorer
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {totalCount === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-monument text-lg mb-2">
              Vos premières émotions vous attendent
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Parcourez le catalogue d'événements et réservez vos billets en quelques clics
              avec votre cagnotte CSE.
            </p>
            <Link to="/events">
              <Button variant="hero" size="lg" className="gap-2">
                <Ticket className="h-5 w-5" />
                Voir les événements
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'past')}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                À venir
                {upcomingReservations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {upcomingReservations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">
                Passés
                {pastReservations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pastReservations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingReservations.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Aucun billet à venir.
                </p>
              ) : (
                upcomingReservations.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    upcoming={true}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastReservations.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Aucun billet passé.
                </p>
              ) : (
                pastReservations.map((r) => (
                  <ReservationCard key={r.id} reservation={r} upcoming={false} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
}
