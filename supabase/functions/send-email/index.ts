import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendEmailRequest {
  recipients: string[];
  subject: string;
  html: string;
}

serve(async (req: Request): Promise<Response> => {
  // Gestione preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Metodo non consentito. Usa POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: SendEmailRequest;

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "JSON non valido nel body della richiesta." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Validazione campi obbligatori
  const { recipients, subject, html } = body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "Il campo 'recipients' deve essere un array non vuoto di indirizzi email." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "Il campo 'subject' e' obbligatorio e deve essere una stringa non vuota." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!html || typeof html !== "string" || html.trim().length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "Il campo 'html' e' obbligatorio e deve essere una stringa non vuota." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Validazione formato email (regex base)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = recipients.filter((r) => !emailRegex.test(r));
  if (invalidEmails.length > 0) {
    return new Response(
      JSON.stringify({ success: false, error: `Indirizzi email non validi: ${invalidEmails.join(", ")}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  if (!smtpPassword) {
    return new Response(
      JSON.stringify({ success: false, error: "Configurazione SMTP mancante: SMTP_PASSWORD non impostata." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const errors: { recipient: string; error: string }[] = [];
  let sent = 0;

  const client = new SMTPClient({
    connection: {
      hostname: "es1003.siteground.eu",
      port: 465,
      tls: true,
      auth: {
        username: "info@raasautomazioni.it",
        password: smtpPassword,
      },
    },
  });

  try {
    for (const recipient of recipients) {
      try {
        await client.send({
          from: "info@raasautomazioni.it",
          to: recipient,
          subject: subject,
          content: "auto",
          html: html,
        });
        sent++;
      } catch (err) {
        errors.push({
          recipient,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } finally {
    await client.close();
  }

  const success = sent > 0;
  const status = errors.length === 0 ? 200 : (sent > 0 ? 207 : 500);

  return new Response(
    JSON.stringify({ success, sent, errors }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
