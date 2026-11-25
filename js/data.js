// =========================================================
// data.js – tehtävien lataaminen ja vastausten tarkistus
//
// Tehtävät ovat JSON-tiedostoissa kansiossa kysymykset/<aine>/.
// Selain ei saa lukea tiedostoja suoraan levyltä (file://),
// joten sivu pitää avata VS Coden Live Serverillä.
// =========================================================

const Data = {
  aineet: [],          // aineet.json sisältö
  valimuisti: {},      // jo ladatut aineet: { aineId: { kysymykset, muistilistat, kurssit } }
  kysymysKurssi: {},   // mihin kurssiin kukin kysymys kuuluu: { kysymysId: "MAA6" }

  // Lataa listan aineista. Kutsutaan kerran sivun avautuessa.
  async lataaAineet() {
    const vastaus = await fetch("kysymykset/aineet.json");
    if (!vastaus.ok) throw new Error("aineet.json puuttuu");
    this.aineet = await vastaus.json();
    return this.aineet;
  },

  haeAine(aineId) {
    return this.aineet.find(a => a.id === aineId);
  },

  // Lataa yhden aineen tehtävät ja muistilistat (vain ensimmäisellä kerralla).
  async lataaAine(aineId) {
    if (this.valimuisti[aineId]) return this.valimuisti[aineId];

    // Kursseihin jaettu aine (pitkä matematiikka): jokaisella kurssilla oma tiedosto
    if (this.haeAine(aineId)?.kurssit) return this._lataaKurssiAine(aineId);

    const [k, m] = await Promise.all([
      fetch(`kysymykset/${aineId}/kysymykset.json`),
      fetch(`kysymykset/${aineId}/muistilistat.json`)
    ]);
    if (!k.ok) throw new Error(`kysymykset/${aineId}/kysymykset.json puuttuu`);

    const kysymykset = (await k.json()).kysymykset || [];
    const muistilistat = m.ok ? await m.json() : {};
    this.valimuisti[aineId] = { kysymykset, muistilistat, kurssit: [] };
    return this.valimuisti[aineId];
  },

  // Lukee kurssit.json-tiedoston ja sen jälkeen jokaisen kurssin tiedoston (esim. MAA6.json).
  // Jokaiseen kysymykseen lisätään kenttä "kurssi", jotta seuranta tietää, mihin kurssiin se kuuluu.
  async _lataaKurssiAine(aineId) {
    const kansio = `kysymykset/${aineId}`;
    const kv = await fetch(`${kansio}/kurssit.json`);
    if (!kv.ok) throw new Error(`${kansio}/kurssit.json puuttuu`);
    const kurssit = await kv.json();

    const tiedostot = await Promise.all(kurssit.map(async kurssi => {
      const v = await fetch(`${kansio}/${kurssi.id}.json`);
      if (!v.ok) { console.warn(`${kansio}/${kurssi.id}.json puuttuu`); return []; }
      return ((await v.json()).kysymykset || []).map(k => ({ ...k, kurssi: kurssi.id }));
    }));
    const kysymykset = tiedostot.flat();
    kysymykset.forEach(k => { this.kysymysKurssi[k.id] = k.kurssi; });

    const m = await fetch(`${kansio}/muistilistat.json`);
    const muistilistat = m.ok ? await m.json() : {};

    this.valimuisti[aineId] = { kysymykset, muistilistat, kurssit };
    return this.valimuisti[aineId];
  }
};

// ---------------------------------------------------------
// Vastausten tarkistus
// Palauttaa { oikein: true/false, naytettava: "teksti oikeasta vastauksesta" }
// ---------------------------------------------------------

// Muuttaa suomalaisen numeron ("23 457,64 €") JavaScript-numeroksi (23457.64).
function lueNumero(teksti) {
  // Murtoluku, esim. "1/6" tai "−4/3"
  const murto = String(teksti).replace(/\s/g, "").replace(/−/g, "-").replace(",", ".").match(/^(-?[\d.]+)\/(-?[\d.]+)$/);
  if (murto) return Number(murto[1]) / Number(murto[2]);

  const siivottu = String(teksti)
    .replace(/[\s  ]/g, "")   // välilyönnit (myös sitovat)
    .replace(/−/g, "-")                 // matemaattinen miinus
    .replace(",", ".")                  // pilkku -> piste
    .replace(/[^0-9.\-eE]/g, "");       // yksiköt pois (€, m/s jne.)
  if (siivottu === "" || siivottu === "-") return NaN;
  return Number(siivottu);
}

// "x = −2 tai x = 3" -> [-2, 3]   ja   "2; 5" -> [2, 5]
function erotteleNumerot(teksti) {
  return String(teksti)
    .split(/;|\btai\b|\bja\b/i)
    .map(osa => osa.replace(/^[^=]*=/, ""))   // "x = 3" -> " 3"
    .map(osa => osa.trim())
    .filter(osa => osa !== "")
    .map(lueNumero);
}

// Muotoilee numeron suomalaisittain: 23457.64 -> "23 457,64"
function muotoileNumero(luku, desimaalit) {
  return luku.toLocaleString("fi-FI", {
    minimumFractionDigits: desimaalit ?? 0,
    maximumFractionDigits: desimaalit ?? 4
  });
}

// Palauttaa:
//   { tila: "oikein" | "osittain" | "vaarin" | "kesken",
//     osuus: 0…1 (kuinka suuri osa pisteistä annetaan),
//     naytettava: oikea vastaus tekstinä,
//     vihje: lisävihje tai null }
function tarkistaVastaus(kysymys, kayttajanVastaus) {
  const v = kysymys.vastaus;
  const tulos = (tila, osuus, naytettava, vihje = null) => ({ tila, osuus, naytettava, vihje });

  let naytettava;
  if (v.tyyppi === "numero") naytettava = muotoileNumero(v.oikea, v.desimaalit) + (v.yksikko ? " " + v.yksikko : "");
  else if (v.tyyppi === "numerot") naytettava = v.oikeat.map(x => muotoileNumero(x)).join("; ") + (v.yksikko ? " " + v.yksikko : "");
  else if (v.tyyppi === "valinta") naytettava = v.vaihtoehdot[v.oikea];
  else if (v.tyyppi === "teksti") naytettava = v.hyvaksytyt[0];
  else { console.warn("Tuntematon vastaustyyppi:", v.tyyppi); naytettava = "?"; }

  // Ei vastausta = kesken (käyttäjä halusi nähdä mallivastauksen)
  if (String(kayttajanVastaus ?? "").trim() === "") return tulos("kesken", 0, naytettava);

  if (v.tyyppi === "numero") {
    const luku = lueNumero(kayttajanVastaus);
    const toleranssi = v.toleranssi ?? 0;
    const ero = Math.abs(luku - v.oikea);
    if (isNaN(luku)) return tulos("vaarin", 0, naytettava);
    if (ero <= toleranssi) return tulos("oikein", 1, naytettava);
    // Melkein oikein (alle 1 % tai 10 × toleranssi): luultavasti pyöristysvirhe
    if (ero <= Math.max(10 * toleranssi, Math.abs(v.oikea) * 0.01)) {
      const maksimi = kysymys.pisteet ?? 1;
      return tulos("osittain", maksimi > 1 ? (maksimi - 1) / maksimi : 0.5, naytettava, "pyoristysVihje");
    }
    return tulos("vaarin", 0, naytettava);
  }

  // Useampi numero, esim. yhtälön kaksi ratkaisua "−2; 3" tai piste "2; 5".
  // Erottimena puolipiste tai sana "tai"/"ja". "jarjestys": true = järjestyksellä on väliä.
  if (v.tyyppi === "numerot") {
    const annetut = erotteleNumerot(kayttajanVastaus).filter(x => !isNaN(x));
    const toleranssi = v.toleranssi ?? 0;
    const lahella = (a, b) => Math.abs(a - b) <= toleranssi;

    // Montako oikeaa lukua löytyy (järjestyksestä välittämättä)
    const jaljella = [...annetut];
    let osumat = 0;
    v.oikeat.forEach(x => {
      const i = jaljella.findIndex(a => lahella(a, x));
      if (i !== -1) { osumat++; jaljella.splice(i, 1); }
    });
    const ylimaaraisia = jaljella.length;
    const kaikkiOikein = osumat === v.oikeat.length && ylimaaraisia === 0;

    if (kaikkiOikein && v.jarjestys && !v.oikeat.every((x, i) => lahella(annetut[i], x))) {
      return tulos("osittain", 0.5, naytettava, "jarjestysVihje");
    }
    if (kaikkiOikein) return tulos("oikein", 1, naytettava);
    if (osumat > 0) {
      // Väärät ylimääräiset luvut vähentävät osuutta
      const osuus = Math.max(0, osumat - ylimaaraisia) / v.oikeat.length;
      return tulos("osittain", osuus, naytettava);
    }
    return tulos("vaarin", 0, naytettava);
  }

  if (v.tyyppi === "valinta") {
    return Number(kayttajanVastaus) === v.oikea ? tulos("oikein", 1, naytettava) : tulos("vaarin", 0, naytettava);
  }

  if (v.tyyppi === "teksti") {
    const normalisoi = s => String(s).trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!]$/, "");
    const annettu = normalisoi(kayttajanVastaus);
    return v.hyvaksytyt.some(h => normalisoi(h) === annettu) ? tulos("oikein", 1, naytettava) : tulos("vaarin", 0, naytettava);
  }

  return tulos("vaarin", 0, naytettava);
}
