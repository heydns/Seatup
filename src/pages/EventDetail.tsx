/**
 * EventDetail — version fake data + purchase flow réel
 * ─────────────────────────────────────────────────────────────────────────
 * REMPLACE entièrement src/pages/EventDetail.tsx
 *
 * Changements vs la version Lovable d'origine :
 *  ✓ Plus aucun appel Supabase pour les events (tout vient de mockData)
 *  ✓ Plus aucun fallback dupliqué (le code est 3x plus court)
 *  ✓ Bouton "Réserver maintenant" → ouvre un modal de paiement mocké
 *  ✓ La réservation est créée via useReservations() → débite la cagnotte
 *    → apparaît dans BeneficiaryHome "Mes billets" → impacte les stats CSE
 *  ✓ Toast de confirmation + redirection optionnelle vers /home
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Calendar, MapPin, Users, Globe, Share2, Heart, Ticket, Wallet, Loader2, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { getEventById } from '@/data/mockData';
import { useReservations } from '@/contexts/ReservationsContext';

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reserve, wallet } = useReservations();

  const event = id ? getEventById(parseInt(id, 10)) : null;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!event) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-monument mb-4">Événement non trouvé</h1>
            <p className="text-muted-foreground mb-4">
              Aucun événement trouvé avec l'ID : {id}
            </p>
            <Link to="/events">
              <Button variant="sport">Retour aux événements</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const originalPrice = parseInt(event.Original_Price.replace('€', ''), 10);
  const subsidizedPrice = parseInt(event.Our_Price.replace('€', ''), 10);
  const savings = originalPrice - subsidizedPrice;
  const totalCost = subsidizedPrice * quantity;
  const totalSavings = savings * quantity;
  const canAfford = totalCost <= wallet.remainingBudget;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const openReservationModal = () => {
    setQuantity(1);
    setIsSuccess(false);
    setIsProcessing(false);
    setIsModalOpen(true);
  };

  const confirmReservation = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const reservation = reserve(event.ID_event, quantity);

    setIsProcessing(false);

    if (!reservation) {
      toast.error('Solde insuffisant', {
        description: `Il vous manque ${(totalCost - wallet.remainingBudget).toFixed(0)}€ sur votre cagnotte.`,
      });
      return;
    }

    setIsSuccess(true);
    toast.success('Réservation confirmée 🎉', {
      description: `${quantity} billet${quantity > 1 ? 's' : ''} pour ${event.Event}`,
    });

    setTimeout(() => {
      setIsModalOpen(false);
      navigate('/home');
    }, 2000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/events">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour aux événements
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative mb-8">
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.Event} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Ticket className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-colors"
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.Sport}
                    </span>
                    {event.Competition && (
                      <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                        {event.Competition}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-monument mb-4">{event.Event}</h1>
                  {event.Organization && (
                    <p className="text-lg text-muted-foreground">
                      Organisé par{' '}
                      <Link
                        to={`/organizer/${encodeURIComponent(event.Organization)}`}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {event.Organization}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Date</h3>
                        <p className="text-muted-foreground">{formatDate(event.Date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Lieu</h3>
                        <p className="text-muted-foreground">{event.Location}</p>
                        {event.Adress && <p className="text-sm text-muted-foreground">{event.Adress}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Accès</h3>
                        <p className="text-muted-foreground">{event.Access}</p>
                      </div>
                    </div>
                    {event.Link && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold">Site officiel</h3>
                          <a href={event.Link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Voir le site officiel
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-monument mb-4">Disponibilité</h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Billets restants</span>
                      <span className="font-semibold">
                        {(event.totalTickets - event.soldTickets).toLocaleString('fr-FR')} /{' '}
                        {event.totalTickets.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all"
                        style={{
                          width: `${Math.round((event.soldTickets / event.totalTickets) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round((event.soldTickets / event.totalTickets) * 100)}% des places déjà vendues
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-monument mb-4">À propos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Vivez le {event.Sport.toLowerCase()} dans toute sa splendeur lors de cet
                    événement exceptionnel à {event.Location}. Une occasion unique de partager
                    des émotions fortes — entre collègues, en famille ou entre amis — avec des
                    tarifs négociés pour les salariés.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="card-sport">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      À partir de {subsidizedPrice}€
                    </div>
                    <div className="text-lg text-muted-foreground line-through">{originalPrice}€</div>
                    <div className="text-sm text-green-600 font-medium">
                      Économisez {savings}€ grâce à votre CSE
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="hero" size="lg" className="w-full gap-2" onClick={openReservationModal}>
                      <Ticket className="h-5 w-5" />
                      Réserver maintenant
                    </Button>
                    <Button variant="sport" size="lg" className="w-full gap-2">
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                    <p className="mb-2">✅ Prix final, pas de frais cachés</p>
                    <p className="mb-2">✅ Annulation gratuite sous 24h</p>
                    <p>✅ Billets sécurisés via votre CSE</p>
                  </div>
                </div>

                <div className="card-sport">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Wallet className="h-4 w-4" />
                    Votre cagnotte
                  </div>
                  <div className="text-2xl font-monument font-bold text-brand">
                    {wallet.remainingBudget}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    sur {wallet.totalBudget}€ alloués cette année
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          {!isSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-monument">Réserver vos billets</DialogTitle>
                <DialogDescription>
                  {event.Event} — {formatDate(event.Date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre de billets</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isProcessing || quantity === 1}
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center font-monument text-2xl">{quantity}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={isProcessing || quantity === 10}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subsidizedPrice}€ par billet · max 10
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix billetterie publique</span>
                    <span className="line-through text-muted-foreground">{originalPrice * quantity}€</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Réduction CSE</span>
                    <span>−{totalSavings}€</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-base">
                    <span>Total à débiter</span>
                    <span className="text-primary">{totalCost}€</span>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-3 text-sm flex items-center justify-between ${
                    canAfford ? 'bg-blue-50 text-blue-900' : 'bg-red-50 text-red-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Cagnotte après achat
                  </span>
                  <span className="font-semibold">
                    {(wallet.remainingBudget - totalCost).toLocaleString('fr-FR')}€
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isProcessing}>
                  Annuler
                </Button>
                <Button variant="hero" onClick={confirmReservation} disabled={!canAfford || isProcessing} className="gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Paiement…
                    </>
                  ) : (
                    <>
                      <Ticket className="h-4 w-4" />
                      Confirmer & payer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-monument mb-2">Réservation confirmée !</h3>
              <p className="text-muted-foreground text-sm">
                Vos billets sont disponibles dans votre espace personnel.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Redirection en cours…
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
