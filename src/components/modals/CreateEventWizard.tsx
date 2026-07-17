import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalIcon,
  MapPin,
  Ticket,
  Euro,
  Image as ImageIcon,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * CreateEventWizard — Prio 1 Marchand #12 : Créer un événement
 * ─────────────────────────────────────────────────────────────────────────
 * Wizard 3 étapes :
 *  1. Infos principales (titre, sport, date, description)
 *  2. Lieu + Billetterie (lieu, quotas, prix)
 *  3. Visuel + Récap + Publication (upload image, brouillon ou publié)
 *
 * Insert dans public.events, image dans bucket Storage 'event-images'.
 */

export interface EditableEvent {
  id: string;
  title: string;
  sport: string;
  competition?: string | null;
  event_date: string;
  description?: string | null;
  location_name: string;
  location_address?: string | null;
  total_tickets: number;
  sold_tickets: number;
  original_price: number;
  our_price: number;
  image_url?: string | null;
  conditions_specifiques?: string | null;
  status?: string;
  is_published?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId: string;
  organizerName: string;
  eventToEdit?: EditableEvent | null;
  onSuccess?: () => void;
}

const SPORTS = [
  'Football',
  'Basketball',
  'Tennis',
  'Rugby',
  'Handball',
  'Volleyball',
  'Course à pied',
  'Autre',
];

const COMPETITIONS: Record<string, string[]> = {
  Football: ['Ligue 1', 'Ligue 2', 'Ligue des Champions', 'Coupe de France', 'Autre'],
  Basketball: ['Betclic Élite', 'Pro B', 'EuroLeague', 'Autre'],
  Tennis: ['ATP Masters 1000', 'Grand Chelem', 'ATP 250', 'Autre'],
  Rugby: ['Top 14', 'Pro D2', 'Coupe du Monde', 'Autre'],
  Handball: ['StarLigue', 'LFH', 'Ligue des Champions', 'Autre'],
  Volleyball: ['Ligue A Masculine', 'Ligue A Féminine', 'Autre'],
  'Course à pied': ['Marathon', 'Semi Marathon', '10 km', 'Trail', 'Autre'],
  Autre: ['Autre'],
};

interface FormData {
  title: string;
  sport: string;
  competition: string;
  eventDate: string;
  eventTime: string;
  description: string;
  locationName: string;
  locationAddress: string;
  totalTickets: string;
  originalPrice: string;
  ourPrice: string;
  imageFile: File | null;
  imagePreview: string;
  conditions: string;
  status: 'draft' | 'published';
}

const initialData: FormData = {
  title: '',
  sport: 'Football',
  competition: '',
  eventDate: '',
  eventTime: '20:00',
  description: '',
  locationName: '',
  locationAddress: '',
  totalTickets: '',
  originalPrice: '',
  ourPrice: '',
  imageFile: null,
  imagePreview: '',
  conditions: '',
  status: 'published',
};

export default function CreateEventWizard({
  open,
  onOpenChange,
  organizerId,
  organizerName,
  eventToEdit,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const isEditMode = !!eventToEdit;

  // ── Pré-remplir en mode édition ──
  useEffect(() => {
    if (eventToEdit && open) {
      const dt = new Date(eventToEdit.event_date);
      setData({
        title: eventToEdit.title,
        sport: eventToEdit.sport,
        competition: eventToEdit.competition ?? '',
        eventDate: dt.toISOString().slice(0, 10),
        eventTime: dt.toTimeString().slice(0, 5),
        description: eventToEdit.description ?? '',
        locationName: eventToEdit.location_name,
        locationAddress: eventToEdit.location_address ?? '',
        totalTickets: String(eventToEdit.total_tickets),
        originalPrice: String(eventToEdit.original_price),
        ourPrice: String(eventToEdit.our_price),
        imageFile: null,
        imagePreview: eventToEdit.image_url ?? '',
        conditions: eventToEdit.conditions_specifiques ?? '',
        status: (eventToEdit.status as 'draft' | 'published') ?? 'published',
      });
      setStep(1);
      setCreatedEventId(null);
    } else if (open && !eventToEdit) {
      setData(initialData);
      setStep(1);
    }
  }, [eventToEdit, open]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  // ─── Validation étape 1 ────────────────────────────────────
  const step1Valid =
    data.title.trim() &&
    data.sport &&
    data.eventDate &&
    data.description.trim();

  // ─── Validation étape 2 ────────────────────────────────────
  const step2Valid =
    data.locationName.trim() &&
    parseInt(data.totalTickets) > 0 &&
    parseFloat(data.originalPrice) > 0 &&
    parseFloat(data.ourPrice) > 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde (max 5 MB)');
      return;
    }
    update('imageFile', file);
    const reader = new FileReader();
    reader.onloadend = () => update('imagePreview', reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!data.imageFile) return null;
    const filename = `${organizerId}/${Date.now()}-${data.imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const { error } = await supabase.storage
      .from('event-images')
      .upload(filename, data.imageFile, { upsert: false });
    if (error) throw error;
    const { data: pub } = supabase.storage.from('event-images').getPublicUrl(filename);
    return pub.publicUrl;
  };

  const handlePublish = async (publishStatus: 'draft' | 'published') => {
    if (!user) return;

    // ── Validation quota vs sold en mode édition ──
    if (isEditMode && eventToEdit) {
      const newTotal = parseInt(data.totalTickets);
      if (newTotal < eventToEdit.sold_tickets) {
        toast.error(
          `Le quota (${newTotal}) ne peut pas être inférieur au nombre de billets déjà vendus (${eventToEdit.sold_tickets}).`
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      // Upload seulement si nouvelle image (sinon on garde l'ancienne URL)
      let imageUrl: string | null = eventToEdit?.image_url ?? null;
      if (data.imageFile) {
        imageUrl = await uploadImage();
      }

      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}:00`).toISOString();

      const payload = {
        organizer_id: organizerId,
        title: data.title.trim(),
        description: data.description.trim(),
        sport: data.sport,
        competition: data.competition.trim() || null,
        event_date: eventDateTime,
        location_name: data.locationName.trim(),
        location_address: data.locationAddress.trim() || null,
        total_tickets: parseInt(data.totalTickets),
        original_price: parseFloat(data.originalPrice),
        our_price: parseFloat(data.ourPrice),
        image_url: imageUrl,
        conditions_specifiques: data.conditions.trim() || null,
        status: publishStatus,
        is_published: publishStatus === 'published',
      };

      if (isEditMode && eventToEdit) {
        // ── UPDATE ──
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', eventToEdit.id);
        if (error) throw error;

        setCreatedEventId(eventToEdit.id);
        toast.success('Votre événement a bien été mis à jour.');
      } else {
        // ── INSERT ──
        const { data: inserted, error } = await supabase
          .from('events')
          .insert({ ...payload, sold_tickets: 0 })
          .select()
          .single();
        if (error) throw error;

        setCreatedEventId(inserted.id);
        toast.success(
          publishStatus === 'published' ? '🎉 Événement publié !' : 'Brouillon sauvegardé.'
        );
      }

      onSuccess?.();
    } catch (err: any) {
      console.error(isEditMode ? 'Update event error:' : 'Create event error:', err);
      toast.error(`Erreur : ${err.message ?? 'échec'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setData(initialData);
    setStep(1);
    setCreatedEventId(null);
    onOpenChange(false);
  };

  // ─── Succès ────────────────────────────────────────────────
  if (createdEventId) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-monument mb-2">
              {isEditMode ? 'Événement mis à jour !' : 'Votre événement a bien été créé.'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isEditMode
                ? 'Les modifications sont visibles en temps réel côté bénéficiaires.'
                : data.status === 'published'
                ? "Il est désormais visible dans le catalogue côté bénéficiaires."
                : 'Vous pouvez le retrouver dans vos brouillons pour le compléter plus tard.'}
            </p>
            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-monument flex items-center gap-3">
            {isEditMode ? 'Modifier l\'événement' : 'Créer un événement'}
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              Étape {step} / 3
            </span>
          </DialogTitle>
          {/* Progress bar */}
          <div className="flex gap-1 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* ═══ ÉTAPE 1 : Infos ═════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Infos principales
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'événement <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Ex : Paris SG vs Marseille — Journée 24"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sport <span className="text-destructive">*</span></Label>
                <Select value={data.sport} onValueChange={(v) => update('sport', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Compétition</Label>
                <Select value={data.competition} onValueChange={(v) => update('competition', v)}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>
                    {(COMPETITIONS[data.sport] ?? []).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  value={data.eventDate}
                  onChange={(e) => update('eventDate', e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={data.eventTime}
                  onChange={(e) => update('eventTime', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Détails de l'événement, ambiance, informations pratiques…"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 2 : Lieu + Billetterie ═══════════════════ */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Lieu
            </h3>
            <div className="space-y-2">
              <Label htmlFor="loc">Nom du lieu <span className="text-destructive">*</span></Label>
              <Input
                id="loc"
                value={data.locationName}
                onChange={(e) => update('locationName', e.target.value)}
                placeholder="Ex : Parc des Princes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr">Adresse</Label>
              <Input
                id="addr"
                value={data.locationAddress}
                onChange={(e) => update('locationAddress', e.target.value)}
                placeholder="24 Rue du Commandant Guilbaud, 75016 Paris"
              />
            </div>

            <h3 className="font-semibold text-sm flex items-center gap-2 pt-4">
              <Ticket className="h-4 w-4 text-primary" />
              Billetterie
            </h3>

            <div className="space-y-2">
              <Label htmlFor="qty">Nombre de billets disponibles <span className="text-destructive">*</span></Label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={data.totalTickets}
                onChange={(e) => update('totalTickets', e.target.value)}
                placeholder="47000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="op">Prix public TTC <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    id="op"
                    type="number"
                    min="0"
                    step="1"
                    value={data.originalPrice}
                    onChange={(e) => update('originalPrice', e.target.value)}
                    placeholder="45"
                    className="pr-10"
                  />
                  <Euro className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="np">Prix Seatup TTC <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    id="np"
                    type="number"
                    min="0"
                    step="1"
                    value={data.ourPrice}
                    onChange={(e) => update('ourPrice', e.target.value)}
                    placeholder="36"
                    className="pr-10"
                  />
                  <Euro className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {parseFloat(data.originalPrice) > 0 && parseFloat(data.ourPrice) > 0 && (
              <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
                💡 Réduction affichée aux bénéficiaires :{' '}
                <strong>
                  {Math.round(
                    ((parseFloat(data.originalPrice) - parseFloat(data.ourPrice)) /
                      parseFloat(data.originalPrice)) *
                      100
                  )}
                  %
                </strong>
              </div>
            )}
          </div>
        )}

        {/* ═══ ÉTAPE 3 : Visuel + Récap ════════════════════════ */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Visuel
            </h3>

            <div className="space-y-2">
              <Label htmlFor="img">Image bannière (optionnel — max 5 MB)</Label>
              <Input
                id="img"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {data.imagePreview && (
                <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={data.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cond">Conditions spécifiques (optionnel)</Label>
              <Textarea
                id="cond"
                value={data.conditions}
                onChange={(e) => update('conditions', e.target.value)}
                placeholder="Ex : Interdiction aux mineurs non accompagnés, pièce d'identité requise…"
                rows={2}
              />
            </div>

            <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
              <p className="font-semibold">Récapitulatif</p>
              <p><strong>{data.title}</strong> — {data.sport} — {new Date(data.eventDate).toLocaleDateString('fr-FR')} {data.eventTime}</p>
              <p>{data.locationName}{data.locationAddress ? `, ${data.locationAddress}` : ''}</p>
              <p>{data.totalTickets} billets à <strong>{data.ourPrice}€</strong> (vs {data.originalPrice}€ public)</p>
              <p className="text-xs text-muted-foreground">Organisateur : {organizerName}</p>
            </div>
          </div>
        )}

        {/* ═══ FOOTER Navigation ══════════════════════════════════ */}
        <div className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="hero"
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              className="gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePublish('draft')}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer brouillon'}
              </Button>
              <Button
                variant="hero"
                onClick={() => handlePublish('published')}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Publier
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
