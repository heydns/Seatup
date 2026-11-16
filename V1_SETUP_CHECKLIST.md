# SeatUp V1 — Checklist de setup & QA

> Guide pas-à-pas pour finaliser la V1 avant mise en prod.
> À jour au 2026-11-13.

## 🧰 1. Installer les nouvelles dépendances npm

Dans PowerShell, dans `C:\Users\k\Desktop\Seatup\seatup-sport-vivre` :

```powershell
npm install @sentry/react @stripe/stripe-js @stripe/react-stripe-js
```

(Si plus tard tu veux ajouter le support XLSX pour l'import bénéficiaires :
`npm install xlsx`.)

## 📄 2. Appliquer la migration SQL V1

1. Ouvre https://supabase.com/dashboard/project/xbiyyhhnxxxdydtdtgsk/sql/new
2. Ouvre le fichier `supabase-migration-v1.sql` à la racine du repo
3. Copie-colle **tout le contenu** dans le SQL Editor
4. Clique **Run**
5. Vérifie : `SELECT COUNT(*) FROM user_roles;` doit être égal au nombre de profiles existants
6. Vérifie : `SELECT * FROM get_my_roles();` depuis un compte authentifié

## 🔐 3. Configurer les Supabase Secrets

Va sur https://supabase.com/dashboard/project/xbiyyhhnxxxdydtdtgsk/settings/functions
puis **Edge Functions → Secrets**. Ajoute :

| Secret name | Valeur |
|---|---|
| `RESEND_API_KEY` | *(ta clé Resend, voir note privée)* |
| `STRIPE_SECRET_KEY` | *(ta clé Stripe secret `sk_test_...`, voir note privée)* |
| `STRIPE_WEBHOOK_SECRET` | *(whsec_... après avoir créé le webhook Stripe, étape 7)* |
| `TICKIE_API_KEY` | *(clé API Tickie fournie par Alexandre Maiolini, voir note privée)* |

> ⚠️ **Ne jamais commit de vraies clés dans ce fichier.** Les valeurs ont été
> partagées en privé via chat. Si besoin, régénère-les depuis les dashboards
> des services concernés.

## 📧 4. Configurer SMTP Resend dans Supabase Auth

1. Va sur https://supabase.com/dashboard/project/xbiyyhhnxxxdydtdtgsk/settings/auth
2. Section **SMTP Settings** → **Enable Custom SMTP**
3. Configure :
   - **Sender name** : `SeatUp`
   - **Sender email** : `noreply@seatup.co`
   - **Host** : `smtp.resend.com`
   - **Port** : `465`
   - **Username** : `resend`
   - **Password** : *(ta clé Resend, cf. note privée)*
   - **Minimum interval between emails per user** : `60` seconds
4. **Save**

## 📨 5. Configurer le template Magic Link OTP

1. Va sur https://supabase.com/dashboard/project/xbiyyhhnxxxdydtdtgsk/auth/templates
2. Clique sur **Magic Link**
3. **Subject** : `Votre code SeatUp : {{ .Token }}`
4. **Body** : remplace tout par :

```html
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f7fa;padding:40px;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#3A7BFF 0%,#C81D85 100%);padding:40px;text-align:center;">
      <h1 style="color:#fff;margin:0;">SeatUp</h1>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#0F1F3C;">Votre code de connexion</h2>
      <p>Voici votre code à usage unique :</p>
      <div style="background:#f5f7fa;border:2px dashed #3A7BFF;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
        <p style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:#3A7BFF;margin:0;">{{ .Token }}</p>
      </div>
      <p style="color:#666;font-size:13px;">Ce code expire dans 10 minutes.</p>
    </div>
  </div>
</body>
</html>
```

5. **Save**

## 🧩 6. Déployer les Edge Functions

Installe le CLI Supabase si pas déjà fait :
```powershell
npm install -g supabase
```

Login :
```powershell
supabase login
supabase link --project-ref xbiyyhhnxxxdydtdtgsk
```

Deploy toutes les fonctions :
```powershell
supabase functions deploy send-otp-email --no-verify-jwt
supabase functions deploy stripe-create-setup-intent
supabase functions deploy stripe-create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy tickie-sync
```

## 💳 7. Configurer le webhook Stripe

1. Dashboard Stripe → **Developers** → **Webhooks** → **Add endpoint**
2. **URL** : `https://xbiyyhhnxxxdydtdtgsk.supabase.co/functions/v1/stripe-webhook`
3. **Events à écouter** :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `setup_intent.succeeded`
4. Clique **Add endpoint**
5. Copie le **Signing secret** (`whsec_...`)
6. Ajoute-le dans Supabase Secrets sous `STRIPE_WEBHOOK_SECRET`

## 📆 8. Calendly (optionnel pour V1)

Quand tu as l'URL d'embed Calendly, ajoute-la dans `.env.local` :
```
VITE_CALENDLY_URL=https://calendly.com/alexandre-seatup/demo-seatup
```

Si pas configuré, la page `/contact` affiche juste le formulaire classique.

## 🧪 9. QA Checklist de recette (bénéficiaire)

À tester **avant** de pousser en prod :

- [ ] Je vais sur `/` sans être loggué → homepage publique s'affiche
- [ ] Je vais sur `/events` sans être loggué → liste des events s'affiche
- [ ] Je clique sur une carte d'event → fiche event s'affiche (pas de blocage)
- [ ] Je clique "Réserver" sur une carte → navigation vers la fiche
- [ ] Sur la fiche, le CTA dit "Se connecter pour réserver" (pas loggué)
- [ ] Je clique → je suis redirigé vers `/auth?returnTo=/event/:id`
- [ ] Je saisis mon email → je reçois un code par mail
- [ ] Je saisis le code → je suis authentifié
- [ ] Je suis redirigé vers la fiche event d'origine
- [ ] Le CTA devient "Réserver maintenant"
- [ ] Je clique → modale de réservation s'ouvre
- [ ] Je choisis cagnotte 100% → confirmation → billet dans "Mes billets"
- [ ] Je choisis CB → j'arrive sur Stripe → paiement test (`4242 4242 4242 4242`)
- [ ] Billet apparaît dans "Mes billets"

## 🧪 10. QA Checklist CSE admin

- [ ] Je me log en tant que CSE admin
- [ ] Le header affiche le SpaceSwitcher si j'ai plusieurs rôles
- [ ] Je peux "Importer des bénéficiaires" via CSV
- [ ] Le CSV est validé : lignes OK en vert, erreurs en rouge
- [ ] Je peux télécharger le template CSV
- [ ] Je peux télécharger le rapport d'erreurs
- [ ] L'import fonctionne pour les lignes valides

## 🧪 11. QA Checklist organisateur

- [ ] Je peux créer un événement via le wizard
- [ ] Sur mobile, le dropdown Sport ne chevauche PAS les champs Date/Heure
- [ ] L'event créé apparaît dans `/events` publiquement
- [ ] Le dashboard affiche les KPIs de l'activité
- [ ] Le panel "Activité de mon organisation" s'affiche (si bénéfs ont acheté)

## 🧪 12. QA Checklist vitrine publique

- [ ] Ouvrir la vitrine en mode privé (pas de session)
- [ ] La vitrine (sans LogoTicker) s'affiche correctement
- [ ] Les cartes event sont cliquables et redirigent correctement
- [ ] Les prix publics sont affichés
- [ ] Le CTA Réserver mène au login (pas à la modale directement)

## 🧪 13. QA Checklist Tickie

- [ ] Déployer `tickie-sync` : `supabase functions deploy tickie-sync`
- [ ] Trigger manuellement via Supabase dashboard → Functions → tickie-sync → Invoke
- [ ] Vérifier qu'il y a des events dans `events` avec `external_source = 'tickie'`
- [ ] Sur la fiche d'un event Tickie : CTA Réserver dit "Réserver sur Les Jokers"
- [ ] Clic sur le CTA → nouvel onglet vers URL Tickie + ligne dans `outbound_clicks`

## 🚀 14. Déploiement final

```powershell
git add .
git commit -m "V1 complete — auth OTP, vitrine publique, Stripe, Tickie, Sentry"
git push origin v1-prod
```

Puis dans Vercel :
- Settings → Branches → Production Branch : `v1-prod` (ou merge vers main et deploy)
- Deploy
- Vérifier https://seatup.co en prod

## 🔒 15. Upgrades payants (par Alex)

Dernier step avant d'ouvrir aux vrais users :
- [ ] **Supabase Pro** (25$/mois) : backups + no auto-pause
- [ ] **Vercel Pro** (20$/mois) : analytics + support
- [ ] Vérifier que la domain `seatup.co` pointe bien vers Vercel

---

**Fait tout ça dans l'ordre, et la V1 est en prod.** 🎉

Si un step bloque, ping-moi avec le message d'erreur exact.
