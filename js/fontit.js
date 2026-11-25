// =========================================================
// fontit.js – lataa fontit kansiosta fonts/ automaattisesti
//
// Laita fonttitiedosto kansioon fonts/ ja anna sille jokin alla olevista
// nimistä. Pääte voi olla .woff2, .woff, .ttf tai .otf. Koodia ei tarvitse muuttaa.
//
//   teksti.*             leipäteksti (pakollinen, jos haluat oman fontin)
//   teksti-lihavoitu.*   lihavointi        (ei tarvita, jos teksti on "variable"-fontti)
//   teksti-kursiivi.*    kursiivi          (vapaaehtoinen)
//   otsikko.*            otsikot           (jos puuttuu, otsikot käyttävät teksti-fonttia)
//   otsikko-lihavoitu.*  otsikoiden lihavointi
//   koodi.*              LaTeX-kenttä ja koodi (tasalevyinen fontti)
//
// Jos tiedostoa ei löydy, sivu käyttää tietokoneen omaa fonttia (Segoe UI / Consolas).
// Selaimen konsoliin voi tulla "404"-ilmoituksia puuttuvista tiedostoista – ne ovat harmittomia.
// =========================================================

const FONTTIKANSIO = "fonts/";
const FONTTIPAATTEET = [["woff2", "woff2"], ["woff", "woff"], ["ttf", "truetype"], ["otf", "opentype"]];

// Roolit: CSS:ssä käytetty nimi ja tiedostonimen alku
const FONTTIROOLIT = [
  { perhe: "Alla Teksti", nimi: "teksti" },
  { perhe: "Alla Otsikko", nimi: "otsikko" },
  { perhe: "Alla Koodi", nimi: "koodi" }
];

// Yrittää ladata yhden fontin. Kaikki päätteet annetaan samaan lähdelistaan:
// selain kokeilee niitä järjestyksessä ja käyttää ensimmäistä, joka löytyy.
async function lataaFontti(perhe, tiedosto, kuvaus) {
  const lahteet = FONTTIPAATTEET
    .map(([paate, muoto]) => `url("${FONTTIKANSIO}${tiedosto}.${paate}") format("${muoto}")`)
    .join(", ");
  const fontti = new FontFace(perhe, lahteet, { display: "swap", ...kuvaus });
  try {
    await fontti.load();
    document.fonts.add(fontti);
    return fontti;
  } catch {
    return null;    // tiedostoa ei ole – ei haittaa
  }
}

async function lataaFontit() {
  const ladatut = [];
  await Promise.all(FONTTIROOLIT.map(async ({ perhe, nimi }) => {
    // Lihavoitu ladataan ensin, koska se ratkaisee, mitä painoja perustiedosto kattaa:
    //  - erillinen lihavoitu löytyi -> perus = ohuet ja normaalit (100–599), lihavoitu = 600–900
    //  - ei erillistä lihavoitua    -> perus kattaa kaikki painot (variable-fontti tai selaimen oma lihavointi)
    const lihavoitu = await lataaFontti(perhe, `${nimi}-lihavoitu`, { weight: "600 900" });
    const perus = await lataaFontti(perhe, nimi, { weight: lihavoitu ? "100 599" : "100 900" });
    if (perus) {
      await lataaFontti(perhe, `${nimi}-kursiivi`, { weight: "100 900", style: "italic" });
      ladatut.push(nimi);
    } else if (lihavoitu) {
      document.fonts.delete(lihavoitu);   // pelkkä lihavoitu ilman perustiedostoa sekoittaisi fontit
    }
  }));
  if (ladatut.length) console.info("Ällä: omat fontit käytössä:", ladatut.join(", "));
}

lataaFontit();
