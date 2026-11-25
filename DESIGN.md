# Ällä – design-ohjeet

Anna tämä tiedosto muille tekoälytyökaluille, kun teet design-työtä, niin värit pysyvät samoina.

## Väripaletti

| CSS-muuttuja | Hex | Käyttö |
|---|---|---|
| `--syva` | `#003135` | Sivupalkki, päätekstit, päänapit, tehtävän otsakepalkki |
| `--petrooli` | `#024950` | Muistilista-paneeli, turkoosi teksti vaalealla taustalla |
| `--tiili` | `#964734` | Pistemerkki, "Yleinen virhe", väärä vastaus |
| `--turkoosi` | `#0FA4AF` | Aktiivinen ikoni, kaavion viiva, oikea vastaus, fokus |
| `--jaa` | `#AFDDE5` | Pehmeät taustat, teksti tummilla paneeleilla |

Lisäksi valkoinen `#FFFFFF` ja sivun tausta `#EEF7F9` (hyvin vaalea jää).

## Vastauksen tilavärit (paletin ulkopuolelta)

Käytetään **vain** tarkistetun vastauksen tilaan. Väri ei koskaan ole ainoa merkki: mukana on aina symboli ja teksti.

| CSS-muuttuja | Hex | Tila | Symboli |
|---|---|---|---|
| `--vihrea` | `#2E7D4F` | Oikein | ✓ |
| `--keltainen` | `#E0AE2E` | Osittain oikein / Kesken | ◐ / … |
| `--punainen` | `#B3261E` | Väärin | ✗ |

Keltaisella pohjalla symboli on tumma (`#003135`), koska valkoinen ei erottuisi.

## Kontrastisäännöt (luettavuus, WCAG)

- `#0FA4AF` valkoisella = **3,0:1 → liian heikko pienelle tekstille.** Käytä vain ikoneihin,
  viivoihin, reunoihin ja isoihin numeroihin. Pieni turkoosi teksti → käytä `#024950`.
- `#964734` tummilla turkooseilla = 2,2:1 / 1,6:1 → ei tiilenpunaista tekstiä tummalle.
- Valkoinen teksti tiilenpunaisella merkillä = 6,5:1 → ok.
- `#AFDDE5` tekstinä `#003135`:lla = 9,6:1 → hyvä.

## Kieli
Koko sivusto suomeksi. Poikkeus: Englanti-välilehden tehtäväsivu englanniksi.
