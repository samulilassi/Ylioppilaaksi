# Fontit

Laita fonttitiedostot tähän kansioon ja nimeä ne alla olevan taulukon mukaan.
Sivu löytää ne itse (`js/fontit.js`), eikä koodia tarvitse muuttaa.
Pääte voi olla `.woff2`, `.woff`, `.ttf` tai `.otf`.

| Tiedoston nimi | Mihin sitä käytetään | Tarvitaanko? |
|---|---|---|
| `teksti.*` | Kaikki teksti | Kyllä, jos haluat oman fontin |
| `teksti-lihavoitu.*` | Lihavoitu teksti | Vain jos fontti ei ole "variable" |
| `teksti-kursiivi.*` | Kursiivi | Vapaaehtoinen |
| `otsikko.*` | Otsikot, isot numerot | Vapaaehtoinen (muuten käytetään teksti-fonttia) |
| `otsikko-lihavoitu.*` | Lihavoidut otsikot | Vain jos otsikkofontti ei ole "variable" |
| `koodi.*` | LaTeX-kenttä, koodi, pikanäppäimet | Vapaaehtoinen (muuten Consolas) |

Jos jokin tiedosto puuttuu, sivu käyttää tietokoneen omaa fonttia. Selaimen konsoliin
voi silloin tulla 404-ilmoituksia puuttuvista tiedostoista. Ne ovat harmittomia.

## "Variable" vai tavallinen fontti?

- **Variable-fontti** = yksi tiedosto sisältää kaikki paksuudet. Nimessä on yleensä
  `Variable` tai `[wght]`, esim. `Inter-VariableFont_opsz,wght.ttf`.
  → Nimeä se `teksti.ttf`, eikä muita tiedostoja tarvita.
- **Tavallinen (static)** = jokainen paksuus on oma tiedostonsa: `-Regular`, `-Bold` …
  → `Regular` → `teksti.*` ja `Bold` (tai `SemiBold`) → `teksti-lihavoitu.*`

## Nyt käytössä

Kansiossa on valmiina **Inter** (Regular, Bold ja Italic), karsittuna suomen, englannin
ja matematiikan merkkeihin. Lisenssi: `Inter-OFL.txt`.
Vaihtaaksesi fontin korvaa tiedostot `teksti*.woff` omillasi tai poista ne.

## Suositukset

Kaikki ovat ilmaisia (SIL Open Font License), sisältävät ä- ja ö-kirjaimet ja ovat
ladattavissa Google Fontsista (fonts.google.com) tai tekijän sivulta.

| Yhdistelmä | Teksti | Otsikot | Koodi | Miksi |
|---|---|---|---|---|
| **1. Selkeä (nyt käytössä)** | Inter | Inter | JetBrains Mono | Siisti ja neutraali, kuten mallikuvassa. Suunniteltu näytöille, joten pienikin teksti on selvää. |
| **2. Helppolukuinen** | Atkinson Hyperlegible Next | Atkinson Hyperlegible Next | Atkinson Hyperlegible Mono | Tehty luettavuutta varten: 1, l ja I sekä 0 ja O erottuvat selvästi – hyvä matematiikassa. |
| **3. Persoonallinen** | Inter | Manrope | JetBrains Mono | Pyöreähköt, ystävälliset otsikot, mutta leipäteksti pysyy rauhallisena. |

Lataus:
- Inter: rsms.me/inter → lataa zip. Zipissä on variable-tiedosto `InterVariable` (.ttf tai .woff2) → nimeä se `teksti.ttf` / `teksti.woff2`.
- Muut: fonts.google.com → hae nimellä → "Get font" → "Download all".
  Zipissä on variable-tiedosto (`…-VariableFont_wght.ttf`) → nimeä se esim. `otsikko.ttf`.
