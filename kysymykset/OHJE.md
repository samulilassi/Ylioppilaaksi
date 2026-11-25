# Kuinka lisään uuden tehtävän (esim. oikean yo-kokeen tehtävän)

Jokaisella aineella on oma kansio:

```
kysymykset/
├── aineet.json              ← lista aineista (sivupalkin ikonit tulevat tästä)
├── MALLI.json               ← kopioi tästä uusi tehtävä
├── pitka-matematiikka/      ← jaettu kursseihin (katso alla)
│   ├── kurssit.json         ← kurssien lista: MAA2 … MAA12
│   ├── MAA2.json … MAA12.json  ← kunkin kurssin tehtävät
│   └── muistilistat.json    ← muistilista per kurssi (avaimet "MAA2" …)
├── lyhyt-matematiikka/
│   ├── kysymykset.json      ← aineen tehtävät
│   └── muistilistat.json    ← oikean reunan muistilistat aiheittain
├── fysiikka/
├── kemia/
├── englanti/
├── ruotsi/
└── aidinkieli/
```

Kansioiden nimissä ei ole ä- tai ö-kirjaimia (`aidinkieli`, `pitka-matematiikka`), koska
ne ovat osa nettiosoitetta ja ääkköset aiheuttavat osoitteissa helposti ongelmia.

## Pitkä matematiikka: tehtävä oikealle kurssille

Pitkän matematiikan tehtävät ovat kurssikohtaisissa tiedostoissa. Oikean yo-kokeen tehtävä
lisätään sen kurssin tiedostoon, jonka aihetta se käsittelee (esim. derivaattatehtävä → `MAA6.json`).
Kurssin tunnus lisätään tehtävään automaattisesti, eikä sitä tarvitse kirjoittaa itse.

Hyvä tunnus oikealle yo-tehtävälle: `maa-k2023-7` (kevät 2023, tehtävä 7) tai `maa-s2022-4` (syksy).
Lisää myös `"lahde": "Kevät 2023"`, niin tehtävän kulmaan tulee merkintä.

Uusi kurssi: lisää se `kurssit.json`-tiedostoon ja tee samanniminen tiedosto (esim. `MAA13.json`).

## Vaiheet

1. Avaa aineen `kysymykset.json` (pitkässä matematiikassa kurssin tiedosto, esim. `MAA6.json`).
2. Kopioi `MALLI.json`-tiedostosta tehtävä (kaikki `{` ja `}` välissä).
3. Liitä se listaan `"kysymykset": [ ... ]` viimeisen tehtävän perään.
   **Muista pilkku** edellisen tehtävän `}`-merkin perään!
4. Täytä kentät (selitykset alla).
5. Tallenna ja päivitä selain. Jos tehtävät katoavat, JSON:ssa on luultavasti
   puuttuva pilkku tai lainausmerkki. Avaa selaimen konsoli (F12) – virhe näkyy siellä.

## Kentät

| Kenttä | Pakollinen | Selitys |
|---|---|---|
| `id` | ✅ | Yksilöllinen tunnus, ei saa koskaan muuttua (edistys tallennetaan tällä). Esim. `mab-k2024-5` = lyhyt matikka, kevät 2024, tehtävä 5 |
| `numero` | ✅ | Tehtävän numero näytöllä, esim. `"8.2"` |
| `aihe` | ✅ | Otsikko, esim. `"Korkolaskenta · Määräaikaistili"` |
| `osaAlue` | – | Murupolun viimeinen osa, esim. `"Talousmatematiikka"` |
| `lahde` | – | Esim. `"Kevät 2023"`. Jos puuttuu, näytetään "Harjoitus" |
| `pisteet` | – | Maksimipisteet |
| `muistilista` | – | Avain `muistilistat.json`-tiedostoon, esim. `"korkolaskenta"` |
| `teksti` | ✅ | Lista kappaleita. Saa sisältää `<b>lihavointi</b>`, `<i>kursiivi</i>`, `x<sup>2</sup>`, `K<sub>0</sub>` |
| `aikajana` | – | Valinnainen aikajana (katso lyhyen matikan tehtävä 8.2) |
| `vastaus` | ✅ | Katso vastaustyypit alla |
| `ratkaisu` | – | Mallivastauksen vaiheet listana |

## Vastaustyypit

**Numero** – hyväksyy esim. `23 457,64` tai `23457.64 €`:
```json
"vastaus": { "tyyppi": "numero", "oikea": 23457.64, "toleranssi": 1, "desimaalit": 2, "yksikko": "€", "esimerkki": "12 345,67" }
```
`toleranssi` = kuinka paljon vastaus saa heittää (pyöristykset). JSON:ssa desimaalit **pisteellä**.

**Useampi numero** – esim. yhtälön kaksi ratkaisua tai pisteen koordinaatit. Käyttäjä erottaa
vastaukset puolipisteellä (`−2; 3`) tai sanalla "tai" (`x = −2 tai x = 3`). Murtoluvut (`1/2`) käyvät.
```json
"vastaus": { "tyyppi": "numerot", "oikeat": [-2, 3], "toleranssi": 0.01 }
```
Lisää `"jarjestys": true`, jos järjestyksellä on väliä (esim. piste x; y).

**Monivalinta** – `oikea` on oikean vaihtoehdon järjestysnumero, **laskenta alkaa nollasta**:
```json
"vastaus": { "tyyppi": "valinta", "vaihtoehdot": ["A", "B", "C"], "oikea": 1 }
```
(tässä oikea vastaus on "B")

**Teksti** – kirjainkoolla ei ole väliä:
```json
"vastaus": { "tyyppi": "teksti", "hyvaksytyt": ["böcker", "bocker"] }
```

## Uusi muistilista

Lisää aineen `muistilistat.json`-tiedostoon uusi avain (esim. `"geometria"`) samaan
tapaan kuin muut, ja kirjoita tehtävään `"muistilista": "geometria"`.
Samaa muistilistaa voi käyttää monessa tehtävässä.
