# Ällä

Verkkosivu ylioppilaskokeisiin harjoitteluun: pitkä ja lyhyt matematiikka, fysiikka,
kemia, englanti, ruotsi ja äidinkieli. Edistyminen tallentuu selaimeen ja näkyy kaaviona.

## Käynnistys

1. Avaa kansio `C:\programming\alla` VS Codessa.
2. Oikea klikkaus `index.html` → **Open with Live Server**.

(Live Server tarvitaan, koska sivu lataa tehtävät JSON-tiedostoista.)

## Tiedostot

| Tiedosto | Mitä se tekee |
|---|---|
| `index.html` | Sivun runko: sivupalkki, yläpalkki, sisältöalue |
| `css/style.css` | Ulkoasu ja värit |
| `js/tekstit.js` | Käyttöliittymän tekstit (fi/en) ja ikonit |
| `js/data.js` | Lataa tehtävät ja tarkistaa vastaukset |
| `js/seuranta.js` | **Edistyksen seuranta** (localStorage) |
| `js/kaavio.js` | Edistyskaavio |
| `js/kaavaeditori.js` | Ratkaisulaatikon LaTeX-editori (Ctrl+E = uusi kaava, ?-painike näyttää pikanäppäimet) |
| `js/fontit.js` | Lataa fontit kansiosta `fonts/` (ohje: `fonts/LUE_MINUT.md`) |
| `fonts/` | Fonttitiedostot. Nyt Inter; vaihda nimeämällä omat tiedostot `teksti.*`, `otsikko.*`, `koodi.*` |
| `lib/katex/` | KaTeX-kirjasto, joka piirtää LaTeX-kaavat (MIT-lisenssi) |
| `js/app.js` | Valitsee näytettävän sivun ja piirtää sen |
| `kysymykset/` | Tehtävät, aine per kansio. Ohje: `kysymykset/OHJE.md` |
| `DESIGN.md` | Väripaletti ja design-säännöt |
