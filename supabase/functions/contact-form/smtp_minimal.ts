/**
 * SMTP su TLS (porta 465) con lettura corretta delle risposte multilinea (RFC 5321).
 * SiteGround invia es. "250-es1003.siteground.eu Hello ..." su più righe; deno.land/x/smtp leggeva male.
 */

const enc = new TextEncoder();

export interface SmtpTlsSendParams {
  host: string;
  port: number;
  /** Dominio per EHLO (es. mail.raasautomazioni.it) */
  ehloName: string;
  user: string;
  pass: string;
  mailFrom: string;
  rcptTo: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}

class LineReader {
  private buf = "";
  private dec = new TextDecoder();
  constructor(private conn: Deno.TlsConn) {}

  async readLine(): Promise<string | null> {
    const tmp = new Uint8Array(2048);
    while (true) {
      const i = this.buf.indexOf("\n");
      if (i >= 0) {
        let line = this.buf.slice(0, i);
        this.buf = this.buf.slice(i + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        return line;
      }
      const n = await this.conn.read(tmp);
      if (n === null) {
        return this.buf.length ? this.buf.replace(/\r$/, "") : null;
      }
      this.buf += this.dec.decode(tmp.subarray(0, n), { stream: true });
    }
  }
}

async function writeRaw(conn: Deno.TlsConn, s: string) {
  await conn.write(enc.encode(s));
}

/** Consuma tutte le righe di una risposta SMTP fino alla riga finale (es. 220 / 250). */
async function expectMultiline(lr: LineReader, wantCode: number) {
  while (true) {
    const line = await lr.readLine();
    if (line === null) throw new Error("SMTP: connessione chiusa inattesa");
    const code = parseInt(line.slice(0, 3), 10);
    if (Number.isNaN(code)) throw new Error(`SMTP risposta non valida: ${line.slice(0, 120)}`);
    if (code !== wantCode) {
      throw new Error(`SMTP atteso ${wantCode}, ricevuto ${code}: ${line.slice(0, 200)}`);
    }
    // Continuazione: quarto carattere '-' (es. "250-...")
    if (line.length >= 4 && line.charAt(3) === "-") continue;
    break;
  }
}

async function expectOne(lr: LineReader, wantCode: number) {
  const line = await lr.readLine();
  if (line === null) throw new Error("SMTP: EOF");
  const code = parseInt(line.slice(0, 3), 10);
  if (code !== wantCode) {
    throw new Error(`SMTP atteso ${wantCode}, ricevuto ${code}: ${line.slice(0, 200)}`);
  }
}

function b64Login(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** Punto a inizio riga nel corpo → RFC escape */
function dotStuff(s: string): string {
  return s.replace(/^\./gm, "..");
}

export async function sendMailSmtpTls(p: SmtpTlsSendParams): Promise<void> {
  const conn = await Deno.connectTls({ hostname: p.host, port: p.port });
  try {
    const lr = new LineReader(conn);

    await expectMultiline(lr, 220);

    await writeRaw(conn, `EHLO ${p.ehloName}\r\n`);
    await expectMultiline(lr, 250);

    await writeRaw(conn, "AUTH LOGIN\r\n");
    await expectOne(lr, 334);

    await writeRaw(conn, `${b64Login(p.user)}\r\n`);
    await expectOne(lr, 334);

    await writeRaw(conn, `${b64Login(p.pass)}\r\n`);
    await expectOne(lr, 235);

    const fromAddr = p.mailFrom.includes("<") ? p.mailFrom.match(/<([^>]+)>/)?.[1] || p.mailFrom : p.mailFrom;
    const toAddr = p.rcptTo.includes("<") ? p.rcptTo.match(/<([^>]+)>/)?.[1] || p.rcptTo : p.rcptTo;

    await writeRaw(conn, `MAIL FROM:<${fromAddr}>\r\n`);
    await expectMultiline(lr, 250);

    await writeRaw(conn, `RCPT TO:<${toAddr}>\r\n`);
    await expectMultiline(lr, 250);

    await writeRaw(conn, "DATA\r\n");
    await expectOne(lr, 354);

    const boundary = "raas" + Date.now().toString(36);
    const headers =
      `From: ${p.mailFrom}\r\n` +
      `To: <${toAddr}>\r\n` +
      `Subject: ${p.subject.replace(/[\r\n]/g, " ")}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: multipart/alternative; boundary="${boundary}"\r\n` +
      `\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n` +
      `\r\n` +
      dotStuff(p.textBody) +
      `\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: text/html; charset=utf-8\r\n` +
      `\r\n` +
      dotStuff(p.htmlBody) +
      `\r\n` +
      `--${boundary}--\r\n` +
      `.\r\n`;

    await writeRaw(conn, headers);
    await expectMultiline(lr, 250);

    await writeRaw(conn, "QUIT\r\n");
  } finally {
    try {
      conn.close();
    } catch {
      /* ignore */
    }
  }
}
