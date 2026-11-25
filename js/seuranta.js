// =========================================================
// seuranta.js – käyttäjän opiskelun seuranta (progress tracking)
//
// Kaikki tallennetaan selaimen localStorageen. Se tarkoittaa:
//  + ei tarvita palvelinta eikä kirjautumista
//  - tiedot ovat vain tällä selaimella / tällä koneella
//  - selaimen tietojen tyhjentäminen poistaa edistyksen
// (Myöhemmin tämän voi vaihtaa tietokantaan muuttamatta muuta koodia,
//  koska muut tiedostot käyttävät vain Seuranta-olion funktioita.)
//
// Jokainen "Tarkista vastaus" -painallus tallentaa yhden YRITYKSEN:
//   {
//     kysymysId: "mab-k2023-8.2",
//     aine: "lyhyt-matematiikka",
//     kurssi: "MAA6",                      // vain kursseihin jaetuissa aineissa
//     aika: "2026-11-22T10:15:00.000Z",   // milloin vastattiin
//     tila: "oikein",                      // "oikein" | "osittain" | "vaarin" | "kesken"
//     oikein: true,                        // tila === "oikein" (vanhoissa tiedoissa vain tämä)
//     pisteet: 12,                         // saadut pisteet (osittain oikeasta osa pisteistä)
//     maksimi: 12                          // tehtävän maksimipisteet
//   }
// =========================================================

const AVAIN_YRITYKSET = "alla.v1.yritykset";
const AVAIN_LUONNOKSET = "alla.v1.luonnokset";
const AVAIN_ASETUKSET = "alla.v1.asetukset";

const Seuranta = {

  // ---------- Perusluku ja -kirjoitus ----------
  _lue(avain, oletus) {
    try {
      const raaka = localStorage.getItem(avain);
      return raaka ? JSON.parse(raaka) : oletus;
    } catch (e) {
      console.warn("Tallennettua tietoa ei voitu lukea:", avain, e);
      return oletus;
    }
  },
  _kirjoita(avain, arvo) {
    try {
      localStorage.setItem(avain, JSON.stringify(arvo));
    } catch (e) {
      console.warn("Tallennus epäonnistui:", avain, e);
    }
  },

  // ---------- Yritykset ----------
  // tulos = tarkistaVastaus()-funktion palauttama { tila, osuus }
  tallennaYritys(kysymys, aineId, tulos) {
    const yritykset = this.haeYritykset();
    const maksimi = kysymys.pisteet ?? 1;
    yritykset.push({
      kysymysId: kysymys.id,
      aine: aineId,
      kurssi: kysymys.kurssi || null,
      aika: new Date().toISOString(),
      tila: tulos.tila,
      oikein: tulos.tila === "oikein",
      pisteet: Math.round(maksimi * tulos.osuus),
      maksimi
    });
    this._kirjoita(AVAIN_YRITYKSET, yritykset);
  },

  // aineId ja kurssiId ovat vapaaehtoisia suodattimia.
  // Vanhoissa yrityksissä ei ole kurssi-kenttää, joten kurssi katsotaan
  // tarvittaessa kysymyksen tunnuksesta (Data.kysymysKurssi).
  haeYritykset(aineId, kurssiId) {
    let tulos = this._lue(AVAIN_YRITYKSET, []);
    if (aineId) tulos = tulos.filter(y => y.aine === aineId);
    if (kurssiId) tulos = tulos.filter(y => (y.kurssi || Data.kysymysKurssi[y.kysymysId]) === kurssiId);
    return tulos;
  },

  // Onko käyttäjä joskus ratkaissut tämän tehtävän oikein?
  onRatkaistu(kysymysId) {
    return this.haeYritykset().some(y => y.kysymysId === kysymysId && y.oikein);
  },

  // Kaikkien tehtävien tila kerralla (nopeampi kuin kutsua onRatkaistu 165 kertaa):
  // { ratkaistut: Set(kysymysId), yritetyt: Set(kysymysId) }
  //   tila: Map(kysymysId -> "oikein" | "osittain" | "vaarin" | "kesken")
  //   Tilaksi valitaan paras saavutettu: oikein voittaa aina, muuten viimeisin vastaus.
  kysymysTilat() {
    const yritykset = this.haeYritykset();
    const tila = new Map();
    for (const y of yritykset) {          // vanhimmasta uusimpaan
      const t = yrityksenTila(y);
      const nyt = tila.get(y.kysymysId);
      if (nyt === "oikein") continue;
      if (t === "kesken" && nyt && nyt !== "kesken") continue;   // katsominen ei pyyhi vastausta
      tila.set(y.kysymysId, t);
    }
    return {
      ratkaistut: new Set([...tila].filter(([, t]) => t === "oikein").map(([id]) => id)),
      yritetyt: new Set([...tila].filter(([, t]) => t !== "kesken").map(([id]) => id)),
      tila
    };
  },

  // Onko tehtävään vastattu ainakin kerran (oikein tai väärin)?
  onYritetty(kysymysId) {
    return this.haeYritykset().some(y => y.kysymysId === kysymysId && yrityksenTila(y) !== "kesken");
  },

  // ---------- Tilastot ----------
  // Yhteenveto yhdestä aineesta/kurssista tai kaikista (aineId = undefined).
  // Yhteenveto yhdestä aineesta/kurssista tai kaikista (aineId = undefined).
  // "Kesken"-tarkistuksia (mallivastaus katsottu ilman vastausta) ei lasketa vastauksiksi.
  yhteenveto(aineId, kurssiId) {
    const yritykset = this.haeYritykset(aineId, kurssiId).filter(y => yrityksenTila(y) !== "kesken");
    return {
      yrityksia: yritykset.length,
      ratkaistuja: new Set(yritykset.filter(y => y.oikein).map(y => y.kysymysId)).size,
      yritettyja: new Set(yritykset.map(y => y.kysymysId)).size
    };
  },

  // Päiväkohtainen sarja kaaviota varten.
  // Palauttaa listan: [{ paiva: Date, ratkaistuja: kumulatiivinen määrä, uusia: sinä päivänä }]
  // "Ratkaistu" = tehtävä, johon on vastattu oikein ensimmäistä kertaa.
  // Uudelleen ratkaiseminen ei kasvata käyrää, joten se kuvaa todellista edistystä.
  paivasarja(aineId, paivia = 30, kurssiId) {
    const yritykset = this.haeYritykset(aineId, kurssiId)
      .slice()
      .sort((a, b) => a.aika.localeCompare(b.aika));

    // Kunkin tehtävän ensimmäinen oikea vastaus -> päivä
    const ensimmainenOikein = {};
    for (const y of yritykset) {
      if (y.oikein && !ensimmainenOikein[y.kysymysId]) {
        ensimmainenOikein[y.kysymysId] = paivaAvain(new Date(y.aika));
      }
    }
    const uusiaPaivalla = {};
    for (const paiva of Object.values(ensimmainenOikein)) {
      uusiaPaivalla[paiva] = (uusiaPaivalla[paiva] || 0) + 1;
    }

    // Aikaisemmin kuin aikaikkunassa ratkaistut lasketaan lähtötasoon
    const tanaan = new Date();
    tanaan.setHours(0, 0, 0, 0);
    const alku = new Date(tanaan);
    alku.setDate(alku.getDate() - (paivia - 1));
    const alkuAvain = paivaAvain(alku);

    let kumulatiivinen = Object.entries(uusiaPaivalla)
      .filter(([paiva]) => paiva < alkuAvain)
      .reduce((s, [, n]) => s + n, 0);

    const sarja = [];
    for (let i = 0; i < paivia; i++) {
      const d = new Date(alku);
      d.setDate(alku.getDate() + i);
      const uusia = uusiaPaivalla[paivaAvain(d)] || 0;
      kumulatiivinen += uusia;
      sarja.push({ paiva: d, ratkaistuja: kumulatiivinen, uusia });
    }
    return sarja;
  },

  // ---------- Luonnokset (vastaukset tallentuvat kirjoittaessa) ----------
  tallennaLuonnos(kysymysId, luonnos) {
    const kaikki = this._lue(AVAIN_LUONNOKSET, {});
    kaikki[kysymysId] = luonnos;
    this._kirjoita(AVAIN_LUONNOKSET, kaikki);
  },
  haeLuonnos(kysymysId) {
    return this._lue(AVAIN_LUONNOKSET, {})[kysymysId] || { ratkaisu: "", vastaus: "" };
  },

  // ---------- Asetukset ----------
  haeAsetukset() {
    return Object.assign({ naytaMuistilista: true }, this._lue(AVAIN_ASETUKSET, {}));
  },
  tallennaAsetus(nimi, arvo) {
    const a = this.haeAsetukset();
    a[nimi] = arvo;
    this._kirjoita(AVAIN_ASETUKSET, a);
  },

  // ---------- Nollaus ja varmuuskopio ----------
  nollaa() {
    localStorage.removeItem(AVAIN_YRITYKSET);
    localStorage.removeItem(AVAIN_LUONNOKSET);
  },
  vieTiedostona() {
    const data = {
      viety: new Date().toISOString(),
      yritykset: this.haeYritykset(),
      luonnokset: this._lue(AVAIN_LUONNOKSET, {})
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const linkki = document.createElement("a");
    linkki.href = URL.createObjectURL(blob);
    linkki.download = `alla-edistys-${paivaAvain(new Date())}.json`;
    linkki.click();
    URL.revokeObjectURL(linkki.href);
  }
};

// Vanhoissa tallennuksissa ei ole tila-kenttää, joten se päätellään oikein-kentästä
function yrityksenTila(y) {
  return y.tila || (y.oikein ? "oikein" : "vaarin");
}

// Päivämäärä muotoon "2026-11-22" (paikallisen ajan mukaan)
function paivaAvain(d) {
  const kk = String(d.getMonth() + 1).padStart(2, "0");
  const pv = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${kk}-${pv}`;
}
