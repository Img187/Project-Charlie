# Sparky Energies – plain HTML/CSS/JS breakout

Deze versie bevat géén Relume, géén Tailwind-configuratie, géén npm-package en géén tijdelijke afbeeldingen.

## Starten in VS Code

Open deze map in VS Code en start bijvoorbeeld Live Server op `index.html`.

## Structuur

- `index.html`
- `thuisbatterijen.html`
- `zonnepanelen.html`
- `laadpalen.html`
- `elektrotechnische-renovaties.html`
- `over-ons.html`
- `contact.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/fonts/README.md`
- `SECTION-INDEX.md`
- `section-index.html`
- `data/section-index.json`

## Logo en afbeeldingen

Het definitieve Sparky Energies-logo en de achtergrondfoto `zonnepanelen-installatie-achtergrond.jpg` staan in `assets/img/`. Voor overige media zijn bewust geen tijdelijke afbeeldingen toegevoegd; de HTML gebruikt `NOTITIE MEDIA`-blokken totdat echte afbeeldingen of video’s beschikbaar zijn.

## Kleuren

Gebruikt uit de aangeleverde huisstijl:

- Donkerblauw: `#0B3C5D`
- Lichtblauw: `#1E88E5`
- Lichtgrijs: `#F3F6F8`
- Oranje: `#F9A825`
- Donker: `#2E2E2E`

## Fonts

De lokale huisstijlfonts zijn via `@font-face` gekoppeld in `assets/css/styles.css`:

- `Futura PT Heavy` voor koppen
- `Futura Light` voor lichte Futura-tekst
- `Open Sans` in Light, Regular, Semibold, Bold en Extrabold, inclusief cursieven

Lopende tekst gebruikt standaard Open Sans Light; elementen met een zwaarder `font-weight` laden automatisch het bijbehorende lokale bestand.

## Toegankelijkheid

De header bevat knoppen voor grotere tekst, hoog contrast, voorlezen en stoppen met voorlezen. Daarnaast zijn semantische elementen gebruikt: `header`, `nav`, `main`, `section`, `article`, `footer`, `h1/h2/h3`, `p`, `ul/li`, `ol/li`, `form`, `fieldset`, `legend`, `label`, `button` en duidelijke focus-states.

De website gebruikt altijd de lichte weergave als standaard: witte achtergronden, donkerblauwe koppen en donkere lopende tekst. Hoog contrast wordt uitsluitend geactiveerd via de toegankelijkheidsknop en wordt in `localStorage` bewaard.

## Rekenformulier

De contactpagina bevat sectie `contactSectVragenformulierVoorBesparingEnInstallatiekosten`. De velden en JS-hooks staan klaar voor een toekomstige berekening van besparing, prijsindicatie en installatieconfiguratie. De definitieve formules staan bewust als TODO in `assets/js/main.js`.

## Button-notities

Iedere knop heeft een eigen ID en data-attributen zoals `data-button-page`, `data-button-section`, `data-link-type`, `data-target-page`, `data-target-section` en waar nodig `data-link-note`. Zie `SECTION-INDEX.md`.
