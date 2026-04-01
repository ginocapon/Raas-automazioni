# -*- coding: utf-8 -*-
"""Genera 4 articoli blog da template revenue: JSON-LD sicuro + main da file body."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "blog" / "articoli" / "revenue-as-a-service-modello-web-agency-2026.html"
BODIES = ROOT / "scripts" / "bodies"

LD_JSON_PATTERN = re.compile(
    r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.DOTALL
)

ARTICLES = [
    {
        "file": "modello-pricing-web-agency-pmi-canone-performance-2026.html",
        "body": "modello-pricing-web-agency-pmi-canone-performance-2026.body.html",
        "title": "Modello Pricing Web Agency PMI: Canone, Retainer e Performance",
        "title_page": "Modello Pricing Web Agency PMI: Canone, Retainer e Performance | RaaS",
        "meta_desc": "Come leggere canone, retainer, progetto e fee legate ai risultati per una PMI: checklist contrattuale, KPI e confronto con il modello RaaS (399€/anno + 3%).",
        "slug": "modello-pricing-web-agency-pmi-canone-performance-2026",
        "keywords": "pricing web agency, canone sito web, retainer marketing, fee performance, modello RaaS, PMI Italia, contratto digitale",
        "hero_badge": "Strategia &amp; Pricing",
        "h1": "Modello Pricing Web Agency per PMI: <span>Canone, Retainer e Performance nel 2026</span>",
        "hero_sub": "Mappa dei modelli pi&ugrave; diffusi (Italia e mercati anglosassoni), come evitare le trappole contrattuali e perch&eacute; un mix fee fissa + variabile allinea gli incentivi, senza copiare i competitor.",
        "date": "31 Marzo 2026",
        "read_mins": "22 min",
        "breadcrumb_name": "Modello Pricing Web Agency PMI 2026",
        "faq": [
            ("Cos'è un retainer rispetto a un canone sito web?", "Il retainer è un corrispettivo periodico per un pacchetto di ore o servizi ricorrenti (consulenza, contenuti, ads). Il canone sito copre hosting, manutenzione e aggiornamenti legati al prodotto digitale. Il contratto deve elencare deliverable, tempi e cosa succede se si superano i limiti."),
            ("Ha senso il solo pagamento a risultato senza fee fissa?", "Dipende da costi operativi e tracciabilità. Senza una fee minima l'agenzia può sotto-investire; senza metriche chiare il cliente perde fiducia. I modelli ibridi (fee contenuta + percentuale su fatturato attribuito) tendono a bilanciare rischio e qualità operativa."),
            ("Quali KPI chiedere prima di firmare?", "Tempi di risposta, pubblicazioni concordate, lead qualificati, traffico organico, Core Web Vitals su URL reali, conversioni da form e chiamate. Ogni KPI deve avere una definizione misurabile e una fonte dati condivisa (Analytics, CRM, report ads)."),
            ("Come si confrontano i prezzi senza dati inventati?", "Si chiede un preventivo comparabile: stesso perimetro (pagine, lingue, e-commerce, integrazioni), stesso livello di manutenzione e stesse ipotesi di traffico. I listini pubblici vanno verificati sui siti ufficiali dei fornitori."),
            ("Il modello RaaS come si colloca?", "RaaS Automazioni applica canone annuo per il sito (Base 399€ + IVA/anno, E-commerce 599€ + IVA/anno) e commissione del 3% sul fatturato da nuovi clienti attribuiti, con dashboard e regole di attribuzione concordate."),
            ("Cosa significa attribuzione in un contratto performance?", "È il metodo con cui si decide quali vendite o lead contano per la commissione: ultimo click, primo touch, modelli misti, finestre temporali. Va scritto nel contratto insieme a procedure di revisione e audit."),
        ],
    },
    {
        "file": "verticalizzazione-digitale-sito-bandi-strategia-pmi-2026.html",
        "body": "verticalizzazione-digitale-sito-bandi-strategia-pmi-2026.body.html",
        "title": "Verticalizzazione Digitale PMI: Sito, Bandi e Coerenza Strategica",
        "title_page": "Verticalizzazione Digitale PMI: Sito e Bandi | RaaS Automazioni",
        "meta_desc": "Perché accostare sito performante, digitalizzazione e bandi a fondo perduto in un'unica strategia PMI: priorità, rischi e sequenza operativa consigliata.",
        "slug": "verticalizzazione-digitale-sito-bandi-strategia-pmi-2026",
        "keywords": "verticalizzazione digitale, bandi PMI, sito web PMI, digitalizzazione, contributi imprese, strategia digitale",
        "hero_badge": "Verticali",
        "h1": "Verticalizzazione Digitale PMI: <span>Sito Web e Bandi nella Stessa Strategia</span>",
        "hero_sub": "Due leve complementari: acquisizione clienti online e accesso a contributi quando compatibili con i bandi ufficiali. Come impostare priorità, messaggio e metriche senza dispersione.",
        "date": "31 Marzo 2026",
        "read_mins": "21 min",
        "breadcrumb_name": "Verticalizzazione digitale PMI 2026",
        "faq": [
            ("Conviene fare prima il sito o il bando?", "Di solito serve una base digitale credibile (sito, tracciamento, privacy) prima di presentare progetti che includono visibilità online; ogni bando ha requisiti specifici nei testi ufficiali."),
            ("I bandi sostituiscono il marketing?", "No: sono strumenti occasionali. Il canale di acquisizione (SEO, GEO, conversione) resta centrale per il fatturato ricorrente."),
            ("Cosa verificare sui contributi?", "Fonti istituzionali, ammissibilità della spesa, scadenze, cumulabilità e obblighi di rendicontazione. Non affidarsi a screenshot senza link al testo ufficiale."),
            ("Come collegare bandi e lead generation?", "Se il progetto finanziato include sito o CRM, allineare obiettivi di conversione e attribuzione lead fin dalla progettazione."),
            ("Cosa copre RaaS in questa verticalizzazione?", "Il percorso sito più performance (listino pubblico) e l'area Bandi come aggregazione orientativa; la consulenza su singolo bando resta distinta dai testi degli avvisi."),
            ("Qual è l'errore più comune?", "Presentare progetti senza metriche di business sul sito: si ottiene un finanziamento ma scarso impatto sul fatturato."),
        ],
    },
    {
        "file": "waas-mercato-italiano-lezioni-concorrenza-2026.html",
        "body": "waas-mercato-italiano-lezioni-concorrenza-2026.body.html",
        "title": "WaaS e Mercato Italiano: Lezioni dai Competitor (Senza Copiare)",
        "title_page": "WaaS Italia: Lezioni dai Competitor | RaaS Automazioni",
        "meta_desc": "Cosa insegnano i player visibili su abbonamenti sito e servizi digitali in Italia: chiarezza di offerta, ricorrenza, fiducia. Spunti per PMI e come differenziarsi con metriche verificabili.",
        "slug": "waas-mercato-italiano-lezioni-concorrenza-2026",
        "keywords": "WaaS, Website as a Service, competitor digitali Italia, web agency PMI, pricing trasparente, Core Web Vitals",
        "hero_badge": "Mercato",
        "h1": "WaaS e Mercato Italiano: <span>Lezioni dai Competitor senza Copiare Contenuti</span>",
        "hero_sub": "Analisi dei pattern (non dei testi) dei brand più visibili: canoni chiari, pacchetti, focus mobile. Trasformare osservazioni di mercato in decisioni sul budget digitale.",
        "date": "31 Marzo 2026",
        "read_mins": "20 min",
        "breadcrumb_name": "WaaS e competitor Italia 2026",
        "faq": [
            ("Perché non copiare articoli dei competitor?", "Per rischio legale, penalizzazioni SEO e perdita di voce autorevole. Si re-interpretano idee e strutture con dati verificabili."),
            ("Cosa imparare dalla loro visibilità?", "Cluster di contenuti, frequenza, chiarezza dei piani tariffari pubblici, proof sociale. Si replicano i principi, non le frasi."),
            ("WaaS e RaaS sono la stessa cosa?", "WaaS enfatizza il sito come servizio in abbonamento; RaaS aggiunge allineamento economico sulla generazione di fatturato attribuito (listino RaaS Automazioni)."),
            ("Come confrontare offerte italiane in modo onesto?", "Richiedere contratto, SLA, cos'è incluso in manutenzione, chi gestisce DNS e backup, come si misurano le conversioni."),
            ("Qual è il segnale di un'offerta credibile?", "Prezzi pubblici, limiti chiari, assenza di promesse assolute su posizionamento Google senza perimetro definito."),
            ("Dove approfondire prestazioni web?", "Documentazione Google su Core Web Vitals e PageSpeed Insights sul proprio dominio."),
        ],
    },
    {
        "file": "checklist-fornitore-digitale-pmi-metriche-contratto-2026.html",
        "body": "checklist-fornitore-digitale-pmi-metriche-contratto-2026.body.html",
        "title": "Checklist Fornitore Digitale PMI: Metriche, Contratto e Trasparenza",
        "title_page": "Checklist Fornitore Digitale PMI 2026 | RaaS Automazioni",
        "meta_desc": "Checklist per scegliere agenzia o partner digitale: metriche, accessi, proprietà codice, backup, privacy e revisioni. Riferimenti a documentazione ufficiale Core Web Vitals.",
        "slug": "checklist-fornitore-digitale-pmi-metriche-contratto-2026",
        "keywords": "checklist fornitore digitale, contratto sito web, GDPR sito, Core Web Vitals, Search Console, vendor lock-in",
        "hero_badge": "Checklist",
        "h1": "Checklist Fornitore Digitale per PMI: <span>Metriche, Contratto e Trasparenza nel 2026</span>",
        "hero_sub": "Domande in call commerciale, elementi in contratto e come evitare vendor lock-in, con riferimento alle linee guida Google sull'esperienza di pagina.",
        "date": "31 Marzo 2026",
        "read_mins": "23 min",
        "breadcrumb_name": "Checklist fornitore digitale PMI",
        "faq": [
            ("Devo avere accesso a Analytics e Search Console?", "Sì, idealmente con proprietà sotto il tuo account aziendale; in alternativa accessi amministrativi documentati e clausola di export dati."),
            ("Cosa chiedere su Core Web Vitals?", "Report su URL reali (mobile e desktop), non solo screenshot; confronto prima e dopo. Fonte: documentazione Google web.dev e Search Central."),
            ("Il codice è mio?", "Verificarlo per iscritto: repository, hosting, licenze font e immagini. La proprietà intellettuale va esplicitata."),
            ("Come regolare le modifiche post-lancio?", "Pacchetto ore incluso, tempi di risposta, canali di ticket e cosa è fuori perimetro a pagamento."),
            ("GDPR: cosa controllare?", "Informativa, cookie, basi giuridiche, DPA se si usano processor terzi."),
            ("Come si integra con RaaS?", "Listino pubblico, dashboard, regole di attribuzione lead e commissione 3% solo su fatturato da nuovi clienti attribuiti."),
        ],
    },
]


def faq_entities(faq_list):
    out = []
    for q, a in faq_list:
        out.append(
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
        )
    return out


def rebuild_ld_json_scripts(text: str, cfg: dict) -> str:
    slug = cfg["slug"]
    base_url = f"https://www.raasautomazioni.it/blog/articoli/{slug}"

    blog = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": cfg["title"],
        "description": cfg["meta_desc"],
        "author": {
            "@type": "Person",
            "name": "Gino Capon",
            "jobTitle": "Fondatore RaaS Automazioni",
            "url": "https://www.raasautomazioni.it/",
        },
        "publisher": {
            "@type": "Organization",
            "name": "RaaS Automazioni",
            "logo": {"@type": "ImageObject", "url": "https://www.raasautomazioni.it/logo.png"},
        },
        "datePublished": "2026-03-31",
        "dateModified": "2026-03-31",
        "mainEntityOfPage": {"@type": "WebPage", "@id": base_url},
        "image": "https://www.raasautomazioni.it/og-image.jpg",
        "inLanguage": "it-IT",
        "isPartOf": {
            "@type": "Blog",
            "name": "Blog RaaS Automazioni",
            "url": "https://www.raasautomazioni.it/blog",
        },
    }

    bc = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.raasautomazioni.it/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.raasautomazioni.it/blog/"},
            {"@type": "ListItem", "position": 3, "name": cfg["breadcrumb_name"], "item": base_url},
        ],
    }

    fq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq_entities(cfg["faq"]),
    }

    new_scripts = [
        json.dumps(blog, ensure_ascii=False, indent=2),
        json.dumps(bc, ensure_ascii=False, indent=2),
        json.dumps(fq, ensure_ascii=False, indent=2),
    ]
    new_idx = 0
    blogposting_seen = 0
    result = []
    last_end = 0

    for m in LD_JSON_PATTERN.finditer(text):
        result.append(text[last_end : m.start()])
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            result.append(m.group(0))
            last_end = m.end()
            continue
        t = data.get("@type")
        if t == "BlogPosting":
            blogposting_seen += 1
            if blogposting_seen == 1:
                result.append(
                    '<script type="application/ld+json">\n    '
                    + new_scripts[0].replace("\n", "\n    ")
                    + "\n    </script>"
                )
                new_idx = 1
            # salta secondo BlogPosting nel template
        elif t == "BreadcrumbList":
            result.append(
                '<script type="application/ld+json">\n    '
                + new_scripts[1].replace("\n", "\n    ")
                + "\n    </script>"
            )
        elif t == "FAQPage":
            result.append(
                '<script type="application/ld+json">\n    '
                + new_scripts[2].replace("\n", "\n    ")
                + "\n    </script>"
            )
        else:
            result.append(m.group(0))
        last_end = m.end()

    result.append(text[last_end:])
    return "".join(result)


def patch(text: str, cfg: dict) -> str:
    slug = cfg["slug"]
    base_url = f"https://www.raasautomazioni.it/blog/articoli/{slug}"

    text = re.sub(r"<title>.*?</title>", f"<title>{cfg['title_page']}</title>", text, count=1)
    text = re.sub(
        r'<meta name="description" content="[^"]*"',
        f'<meta name="description" content="{cfg["meta_desc"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'<link rel="canonical" href="[^"]*"',
        f'<link rel="canonical" href="{base_url}"',
        text,
        count=1,
    )
    text = re.sub(
        r'<link rel="alternate" hreflang="it" href="[^"]*"',
        f'<link rel="alternate" hreflang="it" href="{base_url}"',
        text,
        count=1,
    )
    text = re.sub(
        r'<link rel="alternate" hreflang="en" href="[^"]*"\s*>',
        '<link rel="alternate" hreflang="en" href="https://www.raasautomazioni.it/en/blog/">',
        text,
        count=1,
    )
    text = re.sub(
        r'<link rel="alternate" hreflang="x-default" href="[^"]*"',
        f'<link rel="alternate" hreflang="x-default" href="{base_url}"',
        text,
        count=1,
    )
    text = re.sub(r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{cfg["title"]}"', text, count=1)
    text = re.sub(
        r'<meta property="og:description" content="[^"]*"',
        f'<meta property="og:description" content="{cfg["meta_desc"]}"',
        text,
        count=1,
    )
    text = re.sub(r'<meta property="og:url" content="[^"]*"', f'<meta property="og:url" content="{base_url}"', text, count=1)
    text = re.sub(
        r'<meta name="keywords" content="[^"]*"',
        f'<meta name="keywords" content="{cfg["keywords"]}"',
        text,
        count=1,
    )

    text = rebuild_ld_json_scripts(text, cfg)

    hero = f'''<header class="hero">
    <div class="hero-inner">
        <span class="hero-badge">{cfg["hero_badge"]}</span>
        <h1>{cfg["h1"]}</h1>
        <p class="hero-subtitle">{cfg["hero_sub"]}</p>
        <div class="hero-meta"><span>&#128197; {cfg["date"]}</span><span>&#9202;&#65039; {cfg["read_mins"]} di lettura</span><span>&#9997;&#65039; RaaS Automazioni</span></div>
    </div>
</header>'''
    text = re.sub(r"<header class=\"hero\">.*?</header>", hero, text, count=1, flags=re.DOTALL)

    main_html = (BODIES / cfg["body"]).read_text(encoding="utf-8").strip()
    if not main_html.startswith("<main"):
        main_html = f'<main id="main-content" class="article-container content">\n{main_html}\n</main>'
    text = re.sub(
        r'<main[^>]*class="article-container content"[^>]*>.*?</main>',
        main_html,
        text,
        count=1,
        flags=re.DOTALL,
    )

    return text


def main():
    tpl = TEMPLATE.read_text(encoding="utf-8")
    for cfg in ARTICLES:
        out = ROOT / "blog" / "articoli" / cfg["file"]
        out.write_text(patch(tpl, cfg), encoding="utf-8")
        print("Written", cfg["file"])


if __name__ == "__main__":
    main()
