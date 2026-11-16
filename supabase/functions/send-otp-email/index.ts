// ═══════════════════════════════════════════════════════════════════════════
// Supabase Edge Function : send-otp-email
// ═══════════════════════════════════════════════════════════════════════════
// Envoie un code OTP (6 chiffres) par email via Resend.
// Utilisé par le flow d'auth OTP de SeatUp.
//
// Variables d'environnement requises (Supabase Secrets) :
//   - RESEND_API_KEY : clé API Resend
//
// Body attendu (POST JSON) :
//   { email: "user@example.com", code: "123456" }
//
// Rate limiting :
//   Supabase Auth gère déjà un rate limit natif sur signInWithOtp.
//   On ajoute aussi un check dans la table otp_logs (fonction check_otp_rate_limit).
//
// Deploy :
//   npx supabase functions deploy send-otp-email --no-verify-jwt
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FROM_EMAIL = 'SeatUp <noreply@seatup.co>';
const OTP_EXPIRY_MINUTES = 10;

interface RequestBody {
  email: string;
  code: string;
}

// Template HTML de l'email OTP, branding Seatup (gradient brand)
const buildEmailHtml = (code: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Votre code de connexion SeatUp</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f7fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(15,31,60,0.08);">

          <!-- Header avec gradient brand -->
          <tr>
            <td style="background:linear-gradient(135deg,#3A7BFF 0%,#C81D85 100%);padding:40px 30px;text-align:center;">
              <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;letter-spacing:-0.5px;">
                SeatUp
              </h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">
                Vivez le sport
              </p>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#0F1F3C;font-size:22px;font-weight:600;margin:0 0 16px;">
                Votre code de connexion
              </h2>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Voici votre code à usage unique pour vous connecter à votre espace SeatUp :
              </p>

              <!-- Code OTP en gros, fond coloré -->
              <div style="background:#f5f7fa;border:2px dashed #3A7BFF;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                <p style="font-family:'Courier New',monospace;font-size:42px;font-weight:700;letter-spacing:12px;color:#3A7BFF;margin:0;">
                  ${code}
                </p>
              </div>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;">
                Ce code expire dans <strong style="color:#0F1F3C;">${OTP_EXPIRY_MINUTES} minutes</strong>.
                Il ne peut être utilisé qu'une seule fois.
              </p>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
                Vous n'avez pas demandé ce code ? Ignorez simplement cet email — personne
                ne pourra accéder à votre compte sans ce code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">
                © 2026 SeatUp — La billetterie sport pour les salariés
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                <a href="https://seatup.co" style="color:#3A7BFF;text-decoration:none;">seatup.co</a>
                &middot;
                <a href="mailto:alexandre@seatup.co" style="color:#3A7BFF;text-decoration:none;">alexandre@seatup.co</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

const buildEmailText = (code: string) => `
Votre code de connexion SeatUp

Voici votre code à usage unique pour vous connecter à votre espace :

${code}

Ce code expire dans ${OTP_EXPIRY_MINUTES} minutes et ne peut être utilisé qu'une seule fois.

Vous n'avez pas demandé ce code ? Ignorez simplement cet email.

— L'équipe SeatUp
https://seatup.co
`.trim();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('[send-otp-email] RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'email and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Code must be exactly 6 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Appel API Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Votre code SeatUp : ${code}`,
        html: buildEmailHtml(code),
        text: buildEmailText(code),
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('[send-otp-email] Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await resendResponse.json();
    console.log('[send-otp-email] Email sent successfully:', { email, resendId: result.id });

    return new Response(
      JSON.stringify({ success: true, resendId: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[send-otp-email] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
