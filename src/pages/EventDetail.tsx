/**
 * EventDetail — version hybride Supabase + mockData
 * ─────────────────────────────────────────────────────────────────────────
 * Détecte si l'id URL est un UUID (event créé via wizard Marchand, table
 * Supabase) ou un number (fixtures mockData). Fetch depuis la bonne source
 * et normalise vers un shape MockEvent unique pour le rendu.
 */

import { useEffect, useState } from 'react';
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
import { ArrowLeft, Calendar, MapPin, Users, Globe, Share2, Heart, Ticket, Wallet, Loader2, Check, CreditCard, Lock, ShieldCheck, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { getEventById, type MockEvent } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useReservations } from '@/contexts/ReservationsContext';
import { useAuth } from '@/components/AuthProvider';

// ─── Détection UUID (Supabase) vs number (mockData) ──────────────────────
const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// Fetch depuis Supabase et map vers le format MockEvent
// On embarque aussi les champs V1 pour le mode distribution (Tickie/externe)
const fetchSupabaseEvent = async (uuid: string): Promise<MockEvent | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date, sport, competition, location_name, location_address, original_price, our_price, total_tickets, sold_tickets, image_url, external_link, description, conditions_specifiques, mode_distribution, external_source, external_url, organizer:organizers(name)')
    .eq('id', uuid)
    .maybeSingle();

  if (error || !data) return null;

  const e: any = data;
  return {
    ID_event: e.id, // uuid, mais cast pour le type MockEvent (le composant s'en fout)
    Event: e.title,
    Date: e.event_date,
    Organization: e.organizer?.name ?? '',
    Sport: e.sport ?? 'Autre',
    Competition: e.competition ?? '',
    Location: e.location_name ?? '',
    Adress: e.location_address ?? '',
    Access: 'Ticketing',
    Link: e.external_link ?? e.external_url ?? '',
    Original_Price: e.original_price ? `${e.original_price}€` : '0€',
    Our_Price: e.our_price ? `${e.our_price}€` : '0€',
    totalTickets: e.total_tickets ?? 0,
    soldTickets: e.sold_tickets ?? 0,
    imageUrl: e.image_url,
    // Champs V1 pour distribution externe
    mode_distribution: e.mode_distribution ?? 'checkout_seatup',
    external_source: e.external_source ?? null,
    external_url: e.external_url ?? null,
  } as any;
};

// Génère un seatup_ref unique (ex "ABC12DEF") pour tracker les clics sortants
const generateSeatupRef = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 8; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)];
  return ref;
};

// Tracke un clic sortant (vers Tickie, etc.) en DB puis redirige
const trackAndRedirect = async (eventId: string, externalSource: string, externalUrl: string, userId: string | null) => {
  const seatup_ref = generateSeatupRef();
  // Ajoute le ref à l'URL pour que le partenaire puisse remonter la conversion
  const urlWithRef = externalUrl.includes('?')
    ? `${externalUrl}&seatup_ref=${seatup_ref}`
    : `${externalUrl}?seatup_ref=${seatup_ref}`;

  // Log asynchrone (ne bloque pas la redirection)
  supabase.from('outbound_clicks').insert({
    event_id: eventId,
    user_id: userId,
    seatup_ref,
    external_source: externalSource,
    external_url: urlWithRef,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  }).then(({ error }) => {
    if (error) console.warn('[outbound_click] track failed:', error);
  });

  // Redirige dans un nouvel onglet
  window.open(urlWithRef, '_blank', 'noopener,noreferrer');
};

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reserve, wallet, topUpWallet } = useReservations();
  const { user } = useAuth(); // Vitrine publique V1 : fiche event accessible sans login

  const [event, setEvent] = useState<MockEvent | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Choix du moyen de paiement — par défaut cagnotte si elle peut couvrir tout
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cb'>('wallet');
  // CB (mocked — pas de Stripe SDK réel, juste UX propre)
  const [cbNumber, setCbNumber] = useState('4242 4242 4242 4242');
  const [cbExpiry, setCbExpiry] = useState('12/28');
  const [cbCvc, setCbCvc] = useState('123');

  // ─── Chargement de l'event (Supabase ou mockData) ─────────────────
  useEffect(() => {
    if (!id) {
      setIsFetching(false);
      return;
    }
    (async () => {
      setIsFetching(true);
      try {
        if (isUuid(id)) {
          // Event créé via wizard → Supabase
          const ev = await fetchSupabaseEvent(id);
          setEvent(ev);
        } else {
          // Fixture (ID numérique) → mockData
          const numId = parseInt(id, 10);
          if (!isNaN(numId)) {
            setEvent(getEventById(numId));
          } else {
            setEvent(null);
          }
        }
      } catch (err) {
        console.error('Load event error:', err);
        setEvent(null);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [id]);

  // ─── Loader ───────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  // ─── Event non trouvé ─────────────────────────────────────────────
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

  const originalPrice = parseInt((event.Original_Price ?? '0').replace('€', ''), 10);
  const subsidizedPrice = parseInt((event.Our_Price ?? '0').replace('€', ''), 10);
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
    // Par défaut : cagnotte si elle peut au moins participer, sinon CB
    setPaymentMethod(wallet.remainingBudget > 0 ? 'wallet' : 'cb');
    setIsModalOpen(true);
  };

  // Calcul du split en fonction du mode choisi
  const computeSplit = () => {
    if (paymentMethod === 'cb') {
      // 100% CB : la cagnotte n'est PAS utilisée
      return { walletUsed: 0, cbUsed: totalCost };
    }
    // Mode wallet : la cagnotte couvre ce qu'elle peut, la CB complète si besoin
    const walletUsed = Math.min(totalCost, wallet.remainingBudget);
    const cbUsed = Math.max(0, totalCost - walletUsed);
    return { walletUsed, cbUsed };
  };

  const confirmReservation = async () => {
    const { walletUsed, cbUsed } = computeSplit();

    // Validation CB si nécessaire
    if (cbUsed > 0) {
      if (!cbNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        toast.error('Numéro de carte invalide');
        return;
      }
      if (!cbExpiry.match(/^\d{2}\/\d{2}$/)) {
        toast.error('Date d\'expiration invalide (format MM/AA)');
        return;
      }
      if (!cbCvc.match(/^\d{3,4}$/)) {
        toast.error('CVC invalide');
        return;
      }
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, cbUsed > 0 ? 2000 : 1200));

    // Ajuste la cagnotte selon le split :
    // - Si walletUsed > 0 et cbUsed = 0 : reserve() débite normalement
    // - Si walletUsed = 0 et cbUsed > 0 : on top-up la cagnotte de totalCost (simule CB), reserve débite
    // - Si les deux : on top-up de cbUsed pour couvrir la partie CB
    if (cbUsed > 0) {
      topUpWallet(cbUsed);
    }

    const reservation = reserve(event.ID_event as any, quantity);
    setIsProcessing(false);

    if (!reservation) {
      if (cbUsed > 0) topUpWallet(-cbUsed);
      toast.error('Erreur de réservation');
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

  // Disponibilité — utilise totalTickets/soldTickets si dispo, sinon défauts
  const totalTix = (event as any).totalTickets ?? 0;
  const soldTix = (event as any).soldTickets ?? 0;
  const remainingTix = Math.max(0, totalTix - soldTix);
  const fillRate = totalTix > 0 ? Math.round((soldTix / totalTix) * 100) : 0;
  const isFull = totalTix > 0 && remainingTix === 0;

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
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </button>
                {isFull && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Complet
                  </div>
                )}
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

                {totalTix > 0 && (
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-monument mb-4">Disponibilité</h2>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Billets restants</span>
                        <span className="font-semibold">
                          {remainingTix.toLocaleString('fr-FR')} / {totalTix.toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all"
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {fillRate}% des places déjà vendues
                      </p>
                    </div>
                  </div>
                )}

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
                    {/*
                      V1 — Logique CTA Réserver :
                      - Mode distribution = 'checkout_external' (Tickie, etc.)
                        → Toujours un redirect vers la billetterie externe,
                          loggué ou pas (pas de wallet applicable).
                      - Mode distribution = 'checkout_seatup' (SeatUp direct)
                        → Si pas loggué : CTA "Se connecter pour réserver"
                        → Si loggué : ouvre la modale de réservation
                    */}
                    {(() => {
                      const modeDistribution =
                        (event as any).mode_distribution ?? 'checkout_seatup';
                      const externalSource = (event as any).external_source ?? null;
                      const externalUrl = (event as any).external_url ?? null;

                      // Flow redirect (Tickie) — tout le monde est redirigé
                      if (modeDistribution === 'checkout_external' && externalUrl) {
                        return (
                          <Button
                            variant="hero"
                            size="lg"
                            className="w-full gap-2"
                            onClick={() =>
                              trackAndRedirect(
                                String(event.ID_event),
                                externalSource ?? 'external',
                                externalUrl,
                                user?.id ?? null
                              )
                            }
                            disabled={isFull}
                          >
                            <Globe className="h-5 w-5" />
                            {isFull ? 'Complet' : `Réserver sur ${event.Organization || 'le site du club'}`}
                          </Button>
                        );
                      }

                      // Flow checkout SeatUp normal
                      if (!user) {
                        return (
                          <Button
                            variant="hero"
                            size="lg"
                            className="w-full gap-2"
                            onClick={() =>
                              navigate(`/auth?returnTo=${encodeURIComponent(`/event/${id}`)}`)
                            }
                            disabled={isFull}
                          >
                            <LogIn className="h-5 w-5" />
                            {isFull ? 'Complet' : 'Se connecter pour réserver'}
                          </Button>
                        );
                      }

                      return (
                        <Button
                          variant="hero"
                          size="lg"
                          className="w-full gap-2"
                          onClick={openReservationModal}
                          disabled={isFull}
                        >
                          <Ticket className="h-5 w-5" />
                          {isFull ? 'Complet' : 'Réserver maintenant'}
                        </Button>
                      );
                    })()}
                    <Button variant="sport" size="lg" className="w-full gap-2">
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                  </div>

                  {/* Message aux visiteurs non loggués pour expliquer la valeur */}
                  {!user && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                      <p className="font-medium text-primary mb-1">
                        💼 Vous êtes salarié d'un CSE partenaire ?
                      </p>
                      <p>
                        Connectez-vous pour bénéficier des <strong>tarifs remisés</strong> et
                        payer avec votre <strong>cagnotte CSE</strong>.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                    <p className="mb-2">✅ Prix final, pas de frais cachés</p>
                    <p className="mb-2">✅ Annulation gratuite sous 24h</p>
                    <p>✅ Billets sécurisés via votre CSE</p>
                  </div>
                </div>

                {/* Carte wallet visible UNIQUEMENT pour les users loggués */}
                {user && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                    <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={isProcessing || quantity === 1}>−</Button>
                    <div className="flex-1 text-center font-monument text-2xl">{quantity}</div>
                    <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(10, q + 1))} disabled={isProcessing || quantity === 10}>+</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{subsidizedPrice}€ par billet · max 10</p>
                </div>

                {/* ─── Récap prix ─────────────────────────────── */}
                <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix billetterie publique</span>
                    <span className="line-through text-muted-foreground">
                      {originalPrice * quantity}€
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Réduction CSE</span>
                    <span>−{totalSavings}€</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-base">
                    <span>Total à régler</span>
                    <span className="text-primary">{totalCost}€</span>
                  </div>
                </div>

                {/* ─── Choix du moyen de paiement ─────────────── */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moyen de paiement</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      disabled={isProcessing || wallet.remainingBudget === 0}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Wallet className={`h-5 w-5 ${paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">Cagnotte CSE</span>
                      <span className="text-xs text-muted-foreground">
                        {wallet.remainingBudget}€ dispo
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cb')}
                      disabled={isProcessing}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                        paymentMethod === 'cb'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 ${paymentMethod === 'cb' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">Carte bancaire</span>
                      <span className="text-xs text-muted-foreground">100% CB</span>
                    </button>
                  </div>
                </div>

                {/* ─── Répartition détaillée du split ─────────── */}
                {(() => {
                  const { walletUsed, cbUsed } = computeSplit();
                  return (
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3 text-sm">
                      {walletUsed > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-primary font-medium">
                            <Wallet className="h-4 w-4" />
                            Cagnotte CSE
                          </span>
                          <span className="font-semibold">−{walletUsed}€</span>
                        </div>
                      )}
                      {cbUsed > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-secondary font-medium">
                            <CreditCard className="h-4 w-4" />
                            Carte bancaire
                          </span>
                          <span className="font-semibold">−{cbUsed}€</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground pt-1 border-t border-primary/10">
                        {paymentMethod === 'cb'
                          ? '💳 Paiement 100% par carte, votre cagnotte reste intacte.'
                          : cbUsed === 0
                          ? '✅ 100% pris en charge par votre cagnotte, aucun paiement CB requis.'
                          : `⚠️ Votre cagnotte couvre ${walletUsed}€, il reste ${cbUsed}€ à régler par CB.`}
                      </p>
                    </div>
                  );
                })()}

                {/* ─── Formulaire CB si CB utilisée ─────────── */}
                {computeSplit().cbUsed > 0 && (
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Paiement par carte bancaire
                      </p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Paiement sécurisé
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cbn" className="text-xs">Numéro de carte</Label>
                      <Input
                        id="cbn"
                        value={cbNumber}
                        onChange={(e) => setCbNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="cbe" className="text-xs">Date d'expiration</Label>
                        <Input
                          id="cbe"
                          value={cbExpiry}
                          onChange={(e) => setCbExpiry(e.target.value)}
                          placeholder="MM/AA"
                          disabled={isProcessing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cbc" className="text-xs">CVC</Label>
                        <Input
                          id="cbc"
                          value={cbCvc}
                          onChange={(e) => setCbCvc(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                      Vos données sont chiffrées et transitent par notre PSP.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isProcessing}>
                  Annuler
                </Button>
                <Button variant="hero" onClick={confirmReservation} disabled={isProcessing} className="gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Paiement…
                    </>
                  ) : (
                    <>
                      <Ticket className="h-4 w-4" />
                      {(() => {
                        const { cbUsed } = computeSplit();
                        if (cbUsed === totalCost) return `Payer ${totalCost}€ par CB`;
                        if (cbUsed > 0) return `Payer ${cbUsed}€ par CB`;
                        return 'Confirmer';
                      })()}
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
              <p className="text-muted-foreground text-sm">Vos billets sont disponibles dans votre espace personnel.</p>
              <p className="text-xs text-muted-foreground mt-3">Redirection en cours…</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
