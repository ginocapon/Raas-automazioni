# RaaS Automazioni — sito statico

Repository del sito **www.raasautomazioni.it**: HTML/CSS/JS vanilla, blog in `blog/articoli/`, funzioni Supabase in `supabase/functions/`.

## Admin: elenco “Articoli Blog”

La sezione **Articoli Blog** in `admin.html` **non** legge il filesystem né Supabase: usa l’array JavaScript `ARTICOLI_BLOG`.  
Ogni volta che pubblichi un **nuovo** articolo in `blog/articoli/` (o `en/blog/articoli/`), aggiungi una riga con `titolo`, `url`, `data`, `modificato` e aggiorna anche `blog.html` e `sitemap.xml` (vedi `skill-content.md`).

## Script Python

`scripts/publish_vertical_blogs.py` — genera alcune pagine blog da template + file in `scripts/bodies/`. Esegui dalla root: `python scripts/publish_vertical_blogs.py`

Regoe operative complete: `CLAUDE.md`, `context-map.json`, `skill-*.md`.
