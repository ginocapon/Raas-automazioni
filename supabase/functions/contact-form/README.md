# contact-form

Notifica a **info@raasautomazioni.it** quando un visitatore invia un form contatti. **Solo SMTP** della casella su **mail.raasautomazioni.it** (nessun Brevo / API esterne per l’invio).

## Secret Supabase (obbligatori / opzionali)

| Secret | Obbligatorio | Default |
|--------|--------------|---------|
| `SMTP_PASS` | **Sì** | — |
| `SMTP_HOST` | No | `mail.raasautomazioni.it` |
| `SMTP_PORT` | No | `465` |
| `SMTP_USER` | No | `info@raasautomazioni.it` |
| `SMTP_EHLO` | No | `mail.raasautomazioni.it` (hostname inviato con `EHLO`) |

Se **465** non si connette dall’Edge, prova `SMTP_PORT=587` (dipende da SiteGround).

L’invio usa un client SMTP interno che legge bene le **risposte multilinea** di SiteGround (`250-es1003.siteground.eu Hello …`), a differenza di `deno.land/x/smtp@v0.7.0`.

## Deploy

```bash
supabase secrets set SMTP_PASS=... 
# opzionale:
# supabase secrets set SMTP_HOST=mail.raasautomazioni.it SMTP_PORT=465 SMTP_USER=info@raasautomazioni.it

supabase functions deploy contact-form
```

Puoi **eliminare** dal progetto i secret `BREVO_API_KEY` e `BREVO_SENDER_EMAIL` se non servono ad altre funzioni.

## Verifica problemi

1. Dashboard → Edge Functions → `contact-form` presente?
2. Secret `SMTP_PASS` valorizzato?
3. Log della funzione dopo un invio di prova.
4. Spam su info@.

## Note tecniche

- Modulo `smtp_minimal.ts`: SMTP su TLS senza dipendenza esterna fragile sulle risposte multilinea.
