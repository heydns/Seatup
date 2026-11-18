/**
 * ClubOnboarding — Wizard d'intégration d'un nouveau club (Back-office SeatUp)
 * ─────────────────────────────────────────────────────────────────────────
 * Permet à Alex (ou tout seatup_admin) d'intégrer un nouveau club en
 * autonomie, sans passer par du SQL manuel.
 *
 * Wizard en 4 étapes :
 *   1. Infos du club (nom, sport, ville, description, logo URL)
 *   2. Choix du mode d'intégration :
 *      - A. API billetterie (Tickie, Weezevent, etc.)
 *      - B. Saisie manuelle par le club (le club se connecte et saisit)
 *      - C. Modèle revendeur (SeatUp achète en gros, revend)
 *   3. Config spécifique selon le mode choisi
 *   4. Résumé + création en DB + instructions à transmettre
 *
 * Route : /admin/seatup/onboard-club
 * Protection : seatup_admin only
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Globe,
  Users,
  Package,
  Copy,
  Loader2,
  ShieldAlert,
  Info,
  Mail,
  Key,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useUserRoles } from '@/contexts/UserRolesContext';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

// 4 modes d'intégration — alignés sur la stratégie clubs d'Alex (nov 2026)
// api              = Chemin A : club avec API billetterie accessible (ex Tickie) → sync + redirect
// embedded_iframe  = Chemin B : club avec billetterie intégrable en iframe (V1.5 — attend confirmation Tickie)
// self_managed     = Chemin C : club sans prestataire adapté → admin saisit ses events dans SeatUp
// consignment      = Chemin D : dépôt-vente → club donne les billets gratos, on paye les vendus post-event
type Mode = 'api' | 'embedded_iframe' | 'self_managed' | 'consignment';

const SPORTS = [
  'Football',
  'Basketball',
  'Tennis',
  'Rugby',
  'Handball',
  'Volleyball',
  'Course à pied',
  'Natation',
  'Autre',
];

const API_PARTNERS = [
  { value: 'tickie', label: 'Tickie / Vivenu', doc: 'https://tickie-api.gitbook.io/api-reference' },
  { value: 'weezevent', label: 'Weezevent', doc: 'https://api.weezevent.com/' },
  { value: 'yurplan', label: 'Yurplan', doc: 'https://docs.yurplan.com/' },
  { value: 'billetweb', label: 'Billetweb', doc: '' },
  { value: 'other', label: 'Autre API', doc: '' },
];

interface FormData {
  // Step 1
  name: string;
  sport: string;
  city: string;
  description: string;
  logoUrl: string;

  // Step 2
  mode: Mode | '';

  // Step 3 — Mode A (API)
  apiPartner: string;
  apiKeyNote: string; // Note pour Alex, PAS stockée en clair (secrets Supabase)

  // Step 3 — Mode B (Self-managed)
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;

  // Step 3 — Mode D (Dépôt-vente / Consignment)
  consignmentNote: string;

  // Step 3 — Mode B (Embedded iframe) — V1.5
  iframePartner: string;
  iframeNote: string;
}

const initialData: FormData = {
  name: '',
  sport: '',
  city: '',
  description: '',
  logoUrl: '',
  mode: '',
  apiPartner: '',
  apiKeyNote: '',
  adminEmail: '',
  adminFirstName: '',
  adminLastName: '',
  consignmentNote: '',
  iframePartner: '',
  iframeNote: '',
};

const randomTempPassword = () => {
  // Password temporaire 16 chars (mix alphanum + symboles)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';
  let pwd = '';
  for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
};

const ClubOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    organizerId: string;
    tempPassword?: string;
    adminEmail?: string;
  } | null>(null);

  const isSeatupAdmin = hasRole('seatup_admin');
  const isCheckingAccess = authLoading || rolesLoading;

  // ─── Guard ────────────────────────────────────────────────────────────
  if (isCheckingAccess) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }
  if (!user) {
    navigate('/auth?returnTo=/admin/seatup/onboard-club');
    return null;
  }
  if (!isSeatupAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                Cette page est réservée aux super admins SeatUp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => setData((d) => ({ ...d, [k]: v }));

  // ─── Validation par étape ────────────────────────────────────────────
  const step1Valid = data.name.trim() && data.sport;
  const step2Valid = !!data.mode;
  const step3Valid = (() => {
    if (data.mode === 'api') return !!data.apiPartner;
    if (data.mode === 'embedded_iframe') return !!data.iframePartner;
    if (data.mode === 'self_managed')
      return (
        data.adminEmail.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail.trim()) &&
        data.adminFirstName.trim() &&
        data.adminLastName.trim()
      );
    if (data.mode === 'consignment') return true;
    return false;
  })();

  // ─── Submit final — crée org + user si besoin ────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Créer l'organizer
      const { data: organizer, error: orgError } = await supabase
        .from('organizers')
        .insert({
          name: data.name.trim(),
          sport: data.sport,
          description: data.description.trim() || null,
          city: data.city.trim() || null,
          logo_url: data.logoUrl.trim() || null,
        })
        .select('id')
        .single();

      if (orgError || !organizer) {
        console.error('[Onboarding] Organizer creation error:', orgError);
        toast.error(`Erreur création club : ${orgError?.message ?? 'inconnue'}`);
        setIsSubmitting(false);
        return;
      }

      const organizerId = organizer.id;

      // 2. Si mode Self-managed : créer le user admin + lier role
      let tempPassword: string | undefined;
      let adminEmail: string | undefined;

      if (data.mode === 'self_managed') {
        const trimmedEmail = data.adminEmail.trim().toLowerCase();
        tempPassword = randomTempPassword();

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: tempPassword,
          options: {
            data: {
              first_name: data.adminFirstName.trim(),
              last_name: data.adminLastName.trim(),
              role: 'organizer_admin',
              company_name: data.name.trim(),
            },
          },
        });

        if (signUpError) {
          console.error('[Onboarding] signUp error:', signUpError);
          toast.error(`Erreur création admin : ${signUpError.message}`);
          // L'organizer est créé mais le user non — on continue, l'admin SeatUp pourra
          // créer le user manuellement plus tard. On affiche le warning.
        } else if (signUpData.user) {
          // Lier le user à l'organizer via user_roles
          const { error: roleError } = await supabase.from('user_roles').insert({
            user_id: signUpData.user.id,
            role_type: 'organizer_admin',
            org_id: organizerId,
            cse_role: null,
          });

          if (roleError) {
            console.error('[Onboarding] user_roles insert error:', roleError);
            toast.error('Admin créé mais rôle pas assigné — corriger manuellement');
          }

          // Update le profile pour lier au bon organizer
          await supabase
            .from('profiles')
            .update({ organizer_id: organizerId })
            .eq('id', signUpData.user.id);

          adminEmail = trimmedEmail;
        }
      }

      // 3. Stocker la note de résumé dans organizer.description si besoin
      // (optionnel, on peut ajouter une colonne `internal_notes` plus tard)

      setResult({ organizerId, tempPassword, adminEmail });
      setStep(4);
      toast.success(`Club "${data.name}" créé avec succès 🎉`);
    } catch (err) {
      console.error('[Onboarding] Unexpected error:', err);
      toast.error('Erreur technique — vérifier la console');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copié !`));
  };

  // ─── Rendu ────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Retour */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/seatup')} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au back-office
          </Button>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ═══ ÉTAPE 1 : Infos du club ═══════════════════════════════════ */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-monument flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Infos du club
                </CardTitle>
                <CardDescription>
                  Les informations publiques du club qui apparaîtront sur SeatUp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du club <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Ex : Paris Saint-Germain, Les Jokers d'Issy…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sport">Sport principal <span className="text-destructive">*</span></Label>
                    <Select value={data.sport} onValueChange={(v) => update('sport', v)}>
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="z-50 bg-white">
                        {SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={data.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Ex : Paris, Issy-les-Moulineaux…"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description courte</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Quelques mots sur le club (ambiance, palmarès, affiliations…)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL du logo (optionnel)</Label>
                  <Input
                    id="logoUrl"
                    value={data.logoUrl}
                    onChange={(e) => update('logoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu pourras uploader un vrai logo plus tard via Supabase Storage.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="hero" onClick={() => setStep(2)} disabled={!step1Valid} className="gap-2">
                    Suivant <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ ÉTAPE 2 : Choix du mode ═══════════════════════════════════ */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-monument">Mode d'intégration</CardTitle>
                <CardDescription>
                  Comment le club fournit ses événements à SeatUp ?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ModeTile
                  active={data.mode === 'api'}
                  onClick={() => update('mode', 'api')}
                  icon={<Globe className="h-5 w-5" />}
                  title="A. API billetterie accessible"
                  description="Le club utilise une billetterie pro avec API (Tickie, Weezevent…). SeatUp sync les events et redirige vers leur checkout."
                  bestFor="Clubs pros avec billetterie pro installée"
                />
                <ModeTile
                  active={data.mode === 'embedded_iframe'}
                  onClick={() => update('mode', 'embedded_iframe')}
                  icon={<Globe className="h-5 w-5" />}
                  title="B. Billetterie intégrable (iframe) — V1.5"
                  description="Le club a une billetterie compatible iframe (ex: Tickie en cours). On embarque leur checkout DANS SeatUp — UX reste 100% SeatUp."
                  bestFor="Clubs pros, intégration propre (en attente confirmation Tickie)"
                />
                <ModeTile
                  active={data.mode === 'self_managed'}
                  onClick={() => update('mode', 'self_managed')}
                  icon={<Users className="h-5 w-5" />}
                  title="C. Saisie par le club"
                  description="On crée un compte admin pour le club qui saisit ses events directement dans SeatUp via notre wizard."
                  bestFor="Clubs sans prestataire billetterie adapté"
                />
                <ModeTile
                  active={data.mode === 'consignment'}
                  onClick={() => update('mode', 'consignment')}
                  icon={<Package className="h-5 w-5" />}
                  title="D. Dépôt-vente (pas d'achat de stock)"
                  description="Le club nous donne les billets gratuitement. Post-event, on règle au club UNIQUEMENT les billets vendus. Zéro risque de trésorerie pour SeatUp."
                  bestFor="SULF / Paris 92 / petits clubs — modèle sans engagement"
                />

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                  <Button variant="hero" onClick={() => setStep(3)} disabled={!step2Valid} className="gap-2">
                    Suivant <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ ÉTAPE 3 : Config spécifique au mode ═══════════════════════ */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-monument">Configuration</CardTitle>
                <CardDescription>
                  {data.mode === 'api' && 'Détails de l\'API billetterie'}
                  {data.mode === 'embedded_iframe' && 'Partenaire billetterie compatible iframe (V1.5)'}
                  {data.mode === 'self_managed' && 'Compte admin à créer pour le club'}
                  {data.mode === 'consignment' && 'Note interne sur le deal dépôt-vente'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ─── Mode A : API ─────────────────────────────────── */}
                {data.mode === 'api' && (
                  <>
                    <div className="space-y-2">
                      <Label>Partenaire billetterie</Label>
                      <Select value={data.apiPartner} onValueChange={(v) => update('apiPartner', v)}>
                        <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="z-50 bg-white">
                          {API_PARTNERS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Note pour toi (ne pas coller la clé API ici)</Label>
                      <Textarea
                        value={data.apiKeyNote}
                        onChange={(e) => update('apiKeyNote', e.target.value)}
                        placeholder="Ex : Clé API reçue par mail le 12/11, Secret Shop créé pour SeatUp, à ajouter dans Supabase Secrets sous TICKIE_API_KEY_LESJOKERS"
                        rows={3}
                      />
                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <strong>Important</strong> : la vraie clé API doit être ajoutée dans
                          <strong> Supabase Secrets</strong> (Dashboard → Functions → Secrets),
                          pas dans ce formulaire. Ce champ est juste pour ta note mémo.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </>
                )}

                {/* ─── Mode B : Self-managed ────────────────────────── */}
                {data.mode === 'self_managed' && (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Un compte admin sera créé pour le club. Un password temporaire sera
                        affiché à la fin — tu devras le transmettre au club de manière
                        sécurisée (jamais par email non chiffré).
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="adminFirstName">Prénom admin <span className="text-destructive">*</span></Label>
                        <Input
                          id="adminFirstName"
                          value={data.adminFirstName}
                          onChange={(e) => update('adminFirstName', e.target.value)}
                          placeholder="Ex : Olivier"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminLastName">Nom admin <span className="text-destructive">*</span></Label>
                        <Input
                          id="adminLastName"
                          value={data.adminLastName}
                          onChange={(e) => update('adminLastName', e.target.value)}
                          placeholder="Ex : Dupont"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email admin <span className="text-destructive">*</span></Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={data.adminEmail}
                        onChange={(e) => update('adminEmail', e.target.value)}
                        placeholder="admin@club.fr"
                      />
                      <p className="text-xs text-muted-foreground">
                        Le club se connectera avec cet email (OTP par mail).
                      </p>
                    </div>
                  </>
                )}

                {/* ─── Mode B : Embedded iframe (V1.5) ────────────── */}
                {data.mode === 'embedded_iframe' && (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Mode V1.5 — pas encore live.</strong> Tickie teste actuellement
                        ce mode avec un autre club. Dès qu'Alex a la confirmation technique
                        de Maiolini (CEO Tickie), on pourra activer cette intégration en
                        1-2 jours de dev.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Partenaire billetterie</Label>
                      <Select value={data.iframePartner} onValueChange={(v) => update('iframePartner', v)}>
                        <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="z-50 bg-white">
                          <SelectItem value="tickie">Tickie / Vivenu (en test)</SelectItem>
                          <SelectItem value="other">Autre (à évaluer)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Note mémo</Label>
                      <Textarea
                        value={data.iframeNote}
                        onChange={(e) => update('iframeNote', e.target.value)}
                        placeholder="Ex : Contact Alex ↔ Maiolini pour demander l'URL de l'iframe + les paramètres. Référence : mail Maiolini du 17/11."
                        rows={3}
                      />
                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <strong>Étapes pour activer ce mode</strong> : (1) demander la doc
                          technique de l'iframe au partenaire, (2) ajouter un composant
                          TickieCheckoutIframe côté SeatUp, (3) négocier le modèle économique
                          (commission SeatUp sur chaque vente).
                        </AlertDescription>
                      </Alert>
                    </div>
                  </>
                )}

                {/* ─── Mode D : Dépôt-vente (consignment) ───────── */}
                {data.mode === 'consignment' && (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Modèle dépôt-vente</strong> : le club nous donne les billets
                        gratuitement. On les vend aux CSE depuis SeatUp. Post-event, on
                        reverse au club UNIQUEMENT ce qu'on a vendu, et on "retourne" (en
                        pratique on annule) les billets invendus. <strong>Zéro avance de
                        trésorerie pour SeatUp, zéro engagement pour le club.</strong>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Note interne sur le deal</Label>
                      <Textarea
                        value={data.consignmentNote}
                        onChange={(e) => update('consignmentNote', e.target.value)}
                        placeholder="Ex : SULF / Paris 92 — 50 billets par match, prix de vente SeatUp 30€, commission SeatUp 15%. Contact club : Jean Dupont 06 12 34 56 78. E-billets récupérés sur leur extranet. Reversement post-event sous 15 jours sur IBAN du club."
                        rows={5}
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Checklist dépôt-vente</strong> :
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Volume estimé par event</li>
                          <li>Prix de vente SeatUp (incluant marge)</li>
                          <li>% commission SeatUp</li>
                          <li>Source des e-billets (PDF, QR, extranet club…)</li>
                          <li>Fréquence de reversement au club (hebdo / mensuel / post-event)</li>
                          <li>IBAN du club pour les reversements</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={!step3Valid || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création…
                      </>
                    ) : (
                      <>
                        Créer le club <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ ÉTAPE 4 : Résumé + instructions ═══════════════════════════ */}
          {step === 4 && result && (
            <Card>
              <CardHeader>
                <CardTitle className="font-monument flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Club créé !
                </CardTitle>
                <CardDescription>
                  Voici les prochaines étapes à suivre selon le mode choisi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
                  <p className="font-semibold text-green-900">{data.name}</p>
                  <div className="text-xs text-green-800 space-y-1">
                    <p>
                      <strong>ID organizer :</strong>{' '}
                      <code className="bg-white px-1 rounded">{result.organizerId}</code>{' '}
                      <button
                        onClick={() => copyToClipboard(result.organizerId, 'ID organizer')}
                        className="ml-1 text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copier
                      </button>
                    </p>
                    <p><strong>Sport :</strong> {data.sport}</p>
                    <p><strong>Mode :</strong> {
                      data.mode === 'api' ? 'A. API billetterie accessible' :
                      data.mode === 'embedded_iframe' ? 'B. Billetterie intégrable (iframe) — V1.5' :
                      data.mode === 'self_managed' ? 'C. Saisie par le club' :
                      'D. Dépôt-vente'
                    }</p>
                  </div>
                </div>

                {/* Mode A : instructions API */}
                {data.mode === 'api' && (
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">Prochaines étapes :</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Ajouter la clé API dans Supabase Secrets (dashboard Functions)</li>
                        <li>Configurer un Secret Shop côté partenaire billetterie pour les tarifs CSE</li>
                        <li>Mettre à jour (ou créer) l'Edge Function de sync avec l'organizer_id ci-dessus</li>
                        <li>Lancer le sync manuellement une première fois</li>
                        <li>Vérifier que les events apparaissent dans /events</li>
                      </ol>
                      {data.apiKeyNote && (
                        <p className="pt-2 border-t">
                          <strong>Ta note :</strong> {data.apiKeyNote}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mode B : password temporaire + instructions */}
                {data.mode === 'self_managed' && result.adminEmail && result.tempPassword && (
                  <>
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription className="text-xs space-y-2">
                        <p className="font-semibold">Compte admin créé</p>
                        <div className="bg-white rounded p-3 space-y-2 border">
                          <div>
                            <strong>Email :</strong> {result.adminEmail}
                            <button
                              onClick={() => copyToClipboard(result.adminEmail!, 'Email')}
                              className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" /> Copier
                            </button>
                          </div>
                          <div>
                            <strong>Password temporaire :</strong>{' '}
                            <code className="bg-gray-100 px-1 rounded">{result.tempPassword}</code>
                            <button
                              onClick={() => copyToClipboard(result.tempPassword!, 'Password')}
                              className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" /> Copier
                            </button>
                          </div>
                        </div>
                        <p className="pt-1">
                          ⚠️ Transmettre ces identifiants de manière <strong>sécurisée</strong>
                          (pas d'email non chiffré). Le club se connectera via OTP email
                          (pas besoin du password).
                        </p>
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs space-y-2">
                        <p className="font-semibold">Message à envoyer au club :</p>
                        <div className="bg-white rounded p-3 border">
                          <p>Bonjour {data.adminFirstName},</p>
                          <br />
                          <p>
                            Votre espace SeatUp pour <strong>{data.name}</strong> est prêt.
                            Connectez-vous ici : https://seatup.co/auth
                          </p>
                          <p>
                            Email : <strong>{result.adminEmail}</strong><br />
                            Vous recevrez un code par email pour vous connecter (pas besoin
                            de mot de passe).
                          </p>
                          <br />
                          <p>À bientôt,<br />L'équipe SeatUp</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {/* Mode B : iframe (V1.5) */}
                {data.mode === 'embedded_iframe' && (
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">Prochaines étapes (V1.5) :</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Attendre la confirmation technique du partenaire (ex: Tickie / Maiolini) sur le format de l'iframe</li>
                        <li>Demander la doc technique : URL d'embed, paramètres, événements JS postMessage</li>
                        <li>Négocier le modèle économique (commission SeatUp reversée par le partenaire)</li>
                        <li>Coder le composant {' '}
                          <code className="bg-white px-1 rounded">TickieCheckoutIframe</code> côté SeatUp (~1-2 jours)
                        </li>
                        <li>Mettre à jour les events du club avec {' '}
                          <code className="bg-white px-1 rounded">organizer_id = {result.organizerId}</code>
                          {' '}et {' '}
                          <code className="bg-white px-1 rounded">mode_distribution = 'checkout_seatup'</code>
                        </li>
                      </ol>
                      {data.iframeNote && (
                        <p className="pt-2 border-t">
                          <strong>Ta note :</strong> {data.iframeNote}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mode D : dépôt-vente (consignment) */}
                {data.mode === 'consignment' && (
                  <Alert>
                    <Package className="h-4 w-4" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">Prochaines étapes dépôt-vente :</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Récupérer les e-billets du club gratuitement (PDF, QR, extranet club)</li>
                        <li>Stocker les e-billets dans Supabase Storage</li>
                        <li>Créer les events manuellement dans la DB avec {' '}
                          <code className="bg-white px-1 rounded">organizer_id = {result.organizerId}</code>
                        </li>
                        <li>Vendre aux CSE depuis SeatUp (encaissement SeatUp)</li>
                        <li>Post-event : reverser au club le montant des billets VENDUS uniquement</li>
                        <li>"Retourner" / annuler les billets invendus (pas de paiement au club dessus)</li>
                      </ol>
                      {data.consignmentNote && (
                        <p className="pt-2 border-t">
                          <strong>Ta note :</strong> {data.consignmentNote}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setData(initialData);
                      setResult(null);
                    }}
                  >
                    Intégrer un autre club
                  </Button>
                  <Button variant="hero" onClick={() => navigate('/admin/seatup')} className="gap-2">
                    Retour au back-office <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Sous-composant : tuile de choix de mode ──────────────────────────

const ModeTile = ({
  active,
  onClick,
  icon,
  title,
  description,
  bestFor,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  bestFor: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
      active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-primary mt-2">
          <strong>Idéal pour :</strong> {bestFor}
        </p>
      </div>
      {active && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
    </div>
  </button>
);

export default ClubOnboarding;
