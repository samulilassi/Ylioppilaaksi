// =========================================================
// app.js – sivuston "aivot": valitsee näytettävän sivun ja piirtää sen
//
// Sivut valitaan osoitteen #-osan mukaan (hash-reititys):
//   #/                          -> etusivu
//   #/edistys                   -> edistys ja kaavio
//   #/lyhyt-matematiikka        -> aineen 1. tehtävä
//   #/lyhyt-matematiikka/2      -> aineen 2. tehtävä
//
// Kursseihin jaettu aine (pitkä matematiikka):
//   #/pitka-matematiikka        -> kurssien yleisnäkymä
//   #/pitka-matematiikka/MAA6   -> kurssin MAA6 1. tehtävä
//   #/pitka-matematiikka/MAA6/3 -> kurssin MAA6 3. tehtävä
//
// Edistys-sivun suodattimet ovat myös osoitteessa:
//   #/edistys/pitka-matematiikka/MAA6
// =========================================================

const sisalto = document.getElementById("sisalto");
const murupolku = document.getElementById("murupolku");

// Estää omien tekstien tulkitsemisen HTML:ksi (käyttäjän vastaukset yms.)
function suojaa(teksti) {
  return String(teksti).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// ---------------------------------------------------------
// Käynnistys
// ---------------------------------------------------------
async function kaynnista() {
  try {
    await Data.lataaAineet();
  } catch (e) {
    sisalto.innerHTML = `
      <div class="ilmoitus">
        <b>Tehtäviä ei voitu ladata.</b>
        <p>Avaa sivu VS Coden <code>Live Server</code> -laajennuksella (oikea klikkaus
        <code>index.html</code> → <i>Open with Live Server</i>). Selain ei anna sivun lukea
        JSON-tiedostoja, jos <code>index.html</code> avataan suoraan tiedostona.</p>
        <small>Tekninen syy: ${suojaa(e.message)}</small>
      </div>`;
    return;
  }
  piirraSivupalkki();
  kytkeAsetukset();
  window.addEventListener("hashchange", reititys);
  reititys();
}

function piirraSivupalkki() {
  document.getElementById("aine-linkit").innerHTML = Data.aineet.map(a => `
    <a class="aine-linkki" href="#/${a.id}" data-reitti="${a.id}" title="${suojaa(a.nimi + (a.alanimi ? " – " + a.alanimi : ""))}">
      <span class="ikoni">${IKONIT[a.ikoni] || ""}</span>
      <span class="nimi">${suojaa(a.lyhenne)}</span>
    </a>`).join("");
}

function merkitseAktiivinen(reitti) {
  document.querySelectorAll(".aine-linkki").forEach(l =>
    l.classList.toggle("aktiivinen", l.dataset.reitti === reitti));
}

async function reititys() {
  const osat = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [eka, toka, kolmas] = osat;
  window.scrollTo(0, 0);

  if (!eka) return naytaEtusivu();
  if (eka === "edistys") return naytaEdistys(toka || "", kolmas || "");

  const aine = Data.haeAine(eka);
  if (!aine) return naytaEtusivu();

  if (aine.kurssit) {
    if (!toka) return naytaKurssit(aine);
    return naytaTehtava(aine, Math.max(1, parseInt(kolmas) || 1), toka);
  }
  await naytaTehtava(aine, Math.max(1, parseInt(toka) || 1));
}

// ---------------------------------------------------------
// Etusivu
// ---------------------------------------------------------
async function naytaEtusivu() {
  merkitseAktiivinen("");
  document.documentElement.lang = "fi";
  murupolku.innerHTML = "<b>Etusivu</b>";

  // Ladataan kaikki aineet, jotta tehtävämäärät voidaan näyttää
  const tiedot = await Promise.all(Data.aineet.map(a => Data.lataaAine(a.id).catch(() => ({ kysymykset: [] }))));
  const tilat = Seuranta.kysymysTilat();

  sisalto.innerHTML = `
    <section class="etusivu">
      <h1>Hei! Mitä harjoitellaan tänään?</h1>
      <p>Valitse aine. Vastauksesi tallentuvat automaattisesti, ja edistymisesi näkyy Edistys-sivun kaaviossa.</p>
      <div class="aine-ruudukko">
        ${Data.aineet.map((a, i) => {
          const kysymykset = tiedot[i].kysymykset;
          const ratkaistu = kysymykset.filter(k => tilat.ratkaistut.has(k.id)).length;
          const pros = kysymykset.length ? Math.round(100 * ratkaistu / kysymykset.length) : 0;
          return `
            <a class="aine-kortti" href="#/${a.id}">
              <span class="ikoni">${IKONIT[a.ikoni] || ""}</span>
              <b>${suojaa(a.nimi)}${a.alanimi ? `<br><small>${suojaa(a.alanimi)}</small>` : ""}</b>
              <small>${ratkaistu} / ${kysymykset.length} tehtävää ratkaistu</small>
              <div class="edistyspalkki"><span style="width:${pros}%"></span></div>
            </a>`;
        }).join("")}
      </div>
    </section>`;
}

// ---------------------------------------------------------
// Tehtäväsivu
// ---------------------------------------------------------
// kurssiId annetaan vain kursseihin jaetuissa aineissa (esim. "MAA6").
async function naytaTehtava(aine, numero, kurssiId) {
  merkitseAktiivinen(aine.id);
  const T = TEKSTIT[aine.kieli] || TEKSTIT.fi;
  document.documentElement.lang = aine.kieli || "fi";

  let tiedot;
  try {
    tiedot = await Data.lataaAine(aine.id);
  } catch (e) {
    sisalto.innerHTML = `<div class="ilmoitus"><b>Virhe:</b> ${suojaa(e.message)}</div>`;
    return;
  }
  const { muistilistat } = tiedot;

  // Kurssin sisällä näytetään vain sen kurssin tehtävät
  const kurssi = kurssiId ? tiedot.kurssit.find(k => k.id === kurssiId) : null;
  if (kurssiId && !kurssi) { location.hash = `#/${aine.id}`; return; }
  const kysymykset = kurssi ? tiedot.kysymykset.filter(k => k.kurssi === kurssi.id) : tiedot.kysymykset;
  const polku = kurssi ? `#/${aine.id}/${kurssi.id}` : `#/${aine.id}`;   // navigoinnin perusosoite

  const murut = kurssi
    ? [`<b>${suojaa(aine.nimi)}</b>`, `<a href="#/${aine.id}">${suojaa(aine.alanimi)}</a>`, `${suojaa(kurssi.id)} ${suojaa(kurssi.nimi)}`]
    : null;

  if (!kysymykset.length) {
    murupolku.innerHTML = murut ? murut.join('<span class="vali">›</span>') : `<b>${suojaa(aine.nimi)}</b>`;
    sisalto.innerHTML = `<div class="ilmoitus">${T.eiTehtavia}</div>`;
    return;
  }

  const indeksi = Math.min(numero, kysymykset.length) - 1;
  const k = kysymykset[indeksi];
  const muistilista = muistilistat[k.muistilista];
  const naytaMuistilista = Seuranta.haeAsetukset().naytaMuistilista && muistilista;
  const luonnos = Seuranta.haeLuonnos(k.id);

  murupolku.innerHTML = (murut || [aine.nimi, aine.alanimi, k.osaAlue]
    .filter(Boolean)
    .map((osa, i) => i === 0 ? `<b>${suojaa(osa)}</b>` : suojaa(osa)))
    .join('<span class="vali">›</span>');

  sisalto.innerHTML = `
    <div class="ruudukko ${naytaMuistilista ? "" : "ilman-muistilistaa"}">
      <div class="paasarake">
        ${tehtavaKorttiHTML(k, T)}
        ${vastausKorttiHTML(k, T, luonnos)}
        <div id="tulokset">${piilotetutTuloksetHTML(T)}</div>
        ${navigointiHTML(kysymykset, indeksi, T)}
      </div>
      ${naytaMuistilista ? `<aside class="sivusarake">${muistilistaHTML(muistilista, T)}</aside>` : ""}
    </div>`;

  kytkeTehtavanToiminnot(aine, k, kysymykset, indeksi, T, polku);
}

// ---------------------------------------------------------
// Kurssien yleisnäkymä (pitkä matematiikka)
// ---------------------------------------------------------
async function naytaKurssit(aine) {
  merkitseAktiivinen(aine.id);
  document.documentElement.lang = "fi";
  murupolku.innerHTML = `<b>${suojaa(aine.nimi)}</b><span class="vali">›</span>${suojaa(aine.alanimi)}`;

  let tiedot;
  try {
    tiedot = await Data.lataaAine(aine.id);
  } catch (e) {
    sisalto.innerHTML = `<div class="ilmoitus"><b>Virhe:</b> ${suojaa(e.message)}</div>`;
    return;
  }

  const { ratkaistut, yritetyt } = Seuranta.kysymysTilat();
  // Lasketaan kurssikohtaiset luvut
  const luvut = tiedot.kurssit.map(kurssi => {
    const kys = tiedot.kysymykset.filter(k => k.kurssi === kurssi.id);
    const ratk = kys.filter(k => ratkaistut.has(k.id)).length;
    const tehty = kys.filter(k => yritetyt.has(k.id)).length;
    // Seuraavaksi avataan ensimmäinen ratkaisematon tehtävä
    const seuraava = Math.max(1, kys.findIndex(k => !ratkaistut.has(k.id)) + 1);
    return { kurssi, yhteensa: kys.length, ratk, tehty, seuraava };
  });
  const kaikki = luvut.reduce((s, l) => s + l.yhteensa, 0);
  const kaikkiRatk = luvut.reduce((s, l) => s + l.ratk, 0);
  const kaikkiTehty = luvut.reduce((s, l) => s + l.tehty, 0);

  const kortti = l => {
    const ratkPros = l.yhteensa ? (100 * l.ratk / l.yhteensa) : 0;
    const tehtyPros = l.yhteensa ? (100 * l.tehty / l.yhteensa) : 0;
    return `
      <article class="kurssi-kortti">
        <a class="kurssi-linkki" href="#/${aine.id}/${l.kurssi.id}/${l.seuraava}">
          <div class="kurssi-ylarivi">
            <span class="kurssi-koodi">${suojaa(l.kurssi.id)}</span>
            ${l.ratk === l.yhteensa && l.yhteensa ? `<span class="kurssi-valmis">✓ Valmis</span>` : ""}
          </div>
          <b>${suojaa(l.kurssi.nimi)}</b>
          <p>${suojaa(l.kurssi.kuvaus)}</p>
        </a>
        <div class="kurssi-tila">
          <div class="kaksoispalkki" title="Ratkaistu ${l.ratk}, tehty ${l.tehty}, yhteensä ${l.yhteensa}">
            <span class="tehty" style="width:${tehtyPros}%"></span>
            <span class="ratkaistu" style="width:${ratkPros}%"></span>
          </div>
          <div class="kurssi-luvut">
            <span><b>${l.tehty}</b> / ${l.yhteensa} tehty</span>
            <span><b>${l.ratk}</b> oikein</span>
            <a href="#/edistys/${aine.id}/${l.kurssi.id}">Kaavio →</a>
          </div>
        </div>
      </article>`;
  };

  const ryhma = (otsikko, tyyppi) => `
    <h2 class="kurssi-ryhma">${otsikko}</h2>
    <div class="kurssi-ruudukko">${luvut.filter(l => l.kurssi.tyyppi === tyyppi).map(kortti).join("")}</div>`;

  sisalto.innerHTML = `
    <section class="kurssit">
      <div class="edistys-ylarivi">
        <div>
          <h1>Pitkä matematiikka</h1>
          <p class="alaotsikko">Valitse kurssi. Jokaisessa on ${luvut[0]?.yhteensa ?? 15} tehtävää, ja edistyksesi tallentuu kurssikohtaisesti.</p>
        </div>
        <a class="nappi toissijainen" href="#/edistys/${aine.id}">Näytä kaavio</a>
      </div>

      <div class="tunnusluvut">
        <div class="tunnusluku"><small>Tehdyt tehtävät</small><b>${kaikkiTehty} / ${kaikki}</b></div>
        <div class="tunnusluku"><small>Ratkaistu oikein</small><b>${kaikkiRatk}</b></div>
        <div class="tunnusluku"><small>Suoritettu kaikista tehtävistä</small><b>${prosentti(kaikkiRatk, kaikki)} %</b></div>
      </div>

      <div class="selite-rivi">
        <span><i class="selite-pala ratkaistu"></i>Ratkaistu oikein</span>
        <span><i class="selite-pala tehty"></i>Yritetty, ei vielä oikein</span>
      </div>

      ${ryhma("Pakolliset opintojaksot", "pakollinen")}
      ${ryhma("Valtakunnalliset valinnaiset opintojaksot", "valinnainen")}
    </section>`;
}

function tehtavaKorttiHTML(k, T) {
  const aikajana = k.aikajana ? `
    <div class="aikajana">
      <h4>${suojaa(k.aikajana.otsikko)}</h4>
      <div class="aikajana-rivi">
        ${k.aikajana.kohdat.map(p => `
          <div class="aikajana-kohta ${p.vari || ""}">
            <div class="piste"></div>
            <b>${suojaa(p.aika)}</b>
            <div class="selite">${suojaa(p.selite)}</div>
            <div class="arvo">${suojaa(p.arvo)}</div>
          </div>`).join("")}
      </div>
    </div>` : "";

  return `
    <article class="kortti">
      <div class="tehtava-otsake">
        <div class="tehtava-numero">${suojaa(k.numero)}</div>
        <div class="tehtava-tunnus">
          <small>${T.tehtava}</small>
          <span>${suojaa(k.aihe)}</span>
        </div>
        ${k.pisteet ? `<span class="merkki pisteet">${k.pisteet} ${T.pistetta}</span>` : ""}
        <span class="merkki lahde">${suojaa(k.lahde || T.harjoitus)}</span>
      </div>
      <!-- Tehtäväteksti saa sisältää HTML:ää (<b>, <sup>, <sub>), siksi sitä ei suojata -->
      <div class="tehtava-teksti">${k.teksti.map(kpl => `<p>${kpl}</p>`).join("")}</div>
      ${aikajana}
    </article>`;
}

function vastausKorttiHTML(k, T, luonnos) {
  const v = k.vastaus;
  let syote;
  if (v.tyyppi === "valinta") {
    syote = `
      <div class="vaihtoehdot" role="radiogroup">
        ${v.vaihtoehdot.map((teksti, i) => `
          <label class="vaihtoehto">
            <input type="radio" name="valinta" value="${i}" ${String(luonnos.vastaus) === String(i) ? "checked" : ""}>
            <span>${suojaa(teksti)}</span>
          </label>`).join("")}
      </div>`;
  } else {
    syote = `
      <div class="syote-kehys">
        <input id="lopullinen" type="text" autocomplete="off"
               placeholder="${v.esimerkki ? T.esim + suojaa(v.esimerkki) : ""}"
               value="${suojaa(luonnos.vastaus || "")}">
        ${v.yksikko ? `<span class="yksikko">${suojaa(v.yksikko)}</span>` : ""}
      </div>`;
  }
  const ohje = v.tyyppi === "numerot" ? `<p class="tallennettu" style="margin:6px 0 0">${T.useampiOhje}</p>` : "";

  return `
    <section class="kortti vastaus">
      <div class="vastaus-otsake">
        <h3>${T.vastauksesi}</h3>
        <span class="tallennettu" id="tallennettu">${T.tallennettu}</span>
      </div>

      <span class="kentan-otsikko">${T.ratkaisu}</span>
      <!-- Kaavaeditori (js/kaavaeditori.js) rakentaa sisällön tähän -->
      <div class="ratkaisu-alue" id="ratkaisu-alue"></div>

      <span class="kentan-otsikko">${v.tyyppi === "valinta" ? T.valitse : T.lopullinen}</span>
      <div class="lopullinen">
        ${syote}
        <button class="nappi" id="tarkista" style="align-self:${v.tyyppi === "valinta" ? "flex-end" : "stretch"}">${T.tarkista} ${IKONIT.nuoli}</button>
      </div>
      ${ohje}
      <p class="virheviesti" id="virheviesti"></p>
    </section>`;
}

function piilotetutTuloksetHTML(T) {
  return `
    <div class="tulokset-piilossa">
      <div class="lukko">${IKONIT.lukko}</div>
      <b>${T.tuloksetPiilossa}</b>
      <p>${T.tuloksetPiilossaTeksti}</p>
    </div>`;
}

// Tilojen merkit ja tekstit. Väri tulee CSS-luokasta (.oikein / .osittain / .kesken / .vaarin).
// Merkki (✓ ◐ … ✗) näkyy aina värin lisäksi, jotta tila erottuu myös ilman värinäköä.
const TILA_MERKKI = { oikein: "✓", osittain: "◐", kesken: "…", vaarin: "✗" };

function tuloksetHTML(k, T, tulos, annettu) {
  const v = k.vastaus;
  const annettuTeksti = annettu === "" ? "—" : v.tyyppi === "valinta" ? v.vaihtoehdot[annettu] : annettu;
  const maksimi = k.pisteet ?? 1;
  const pisteet = Math.round(maksimi * tulos.osuus);
  return `
    <section class="kortti tulokset tila-${tulos.tila}">
      <div class="tulos-banneri ${tulos.tila}">
        <span class="tila-merkki" aria-hidden="true">${TILA_MERKKI[tulos.tila]}</span>
        <div>
          <div class="otsikko">${T[tulos.tila]}</div>
          <small>${T[tulos.tila + "Teksti"]}${tulos.vihje ? " " + T[tulos.vihje] : ""}</small>
        </div>
        <div class="pisteet-iso">${pisteet} / ${maksimi} ${T.pistetta}</div>
      </div>
      <div class="vertailu">
        <div><small>${T.sinunVastaus}</small><b>${suojaa(annettuTeksti)}${annettu !== "" && v.tyyppi === "numero" && v.yksikko ? " " + suojaa(v.yksikko) : ""}</b></div>
        <div><small>${T.oikeaVastaus}</small><b>${suojaa(tulos.naytettava)}</b></div>
      </div>
      ${k.ratkaisu && k.ratkaisu.length ? `
        <div class="mallivastaus">
          <h4 class="pieni-otsikko">${T.mallivastaus.toUpperCase()}</h4>
          <ol>${k.ratkaisu.map(s => `<li>${s}</li>`).join("")}</ol>
        </div>` : ""}
      ${k.pisteet > 1 ? `<p class="tallennettu" style="margin-top:14px">${T.huomioPisteet}</p>` : ""}
      <div class="tulos-napit">
        <button class="nappi toissijainen" id="uudelleen">${T.yritaUudelleen}</button>
        <button class="nappi" id="seuraava-tulos">${T.seuraava} ${IKONIT.nuoli}</button>
      </div>
    </section>`;
}

function navigointiHTML(kysymykset, indeksi, T) {
  const { tila } = Seuranta.kysymysTilat();
  return `
    <div class="navigointi">
      <button class="nappi toissijainen" id="edellinen" ${indeksi === 0 ? "disabled" : ""}>← ${T.edellinen}</button>
      <select id="tehtavavalinta" aria-label="Tehtävä">
        ${kysymykset.map((k, i) => `
          <option value="${i + 1}" ${i === indeksi ? "selected" : ""}>
            ${tila.has(k.id) ? TILA_MERKKI[tila.get(k.id)] + " " : ""}${suojaa(k.numero)} · ${suojaa(k.aihe)}
          </option>`).join("")}
      </select>
      <button class="nappi toissijainen" id="seuraava" ${indeksi === kysymykset.length - 1 ? "disabled" : ""}>${T.seuraava} →</button>
    </div>`;
}

function muistilistaHTML(m, T) {
  return `
    <section class="muistilista">
      <div class="muistilista-otsake">
        <span class="ikoni">${IKONIT.lamppu}</span>
        <div><small>${T.muistilista}</small><b>${suojaa(m.otsikko)}</b></div>
      </div>
      ${m.osiot.map(o => `
        <h5>${suojaa(o.otsikko)}</h5>
        <p>${o.teksti}</p>
        ${o.kaava ? `<div class="kaava">${o.kaava}</div>` : ""}`).join("")}
    </section>
    ${m.yleinenVirhe ? `
      <section class="virhe-kortti">
        <h5>${IKONIT.varoitus} ${T.yleinenVirhe}</h5>
        <p>${m.yleinenVirhe}</p>
      </section>` : ""}
    ${m.taulukot ? `
      <section class="taulukko-kortti">
        <h4 class="pieni-otsikko">${T.taulukot}</h4>
        <p>${m.taulukot}</p>
      </section>` : ""}`;
}

// Napit ja kentät toimimaan
function kytkeTehtavanToiminnot(aine, k, kysymykset, indeksi, T, polku) {
  const siirry = n => { location.hash = `${polku}/${n}`; };
  const lopullinen = document.getElementById("lopullinen");
  const virhe = document.getElementById("virheviesti");
  const tallennettu = document.getElementById("tallennettu");

  const annettuVastaus = () => {
    if (k.vastaus.tyyppi === "valinta") {
      const valittu = document.querySelector('input[name="valinta"]:checked');
      return valittu ? valittu.value : "";
    }
    return lopullinen.value.trim();
  };

  // Automaattinen tallennus aina kun käyttäjä kirjoittaa
  let editori;
  const tallenna = () => {
    Seuranta.tallennaLuonnos(k.id, { ratkaisu: editori.arvo(), vastaus: annettuVastaus() });
    tallennettu.textContent = "✓ " + T.tallennettu;
  };
  // Ratkaisulaatikko: tekstiä + LaTeX-kaavoja (Ctrl+E)
  editori = Kaavaeditori.luo(document.getElementById("ratkaisu-alue"), {
    alkuarvo: Seuranta.haeLuonnos(k.id).ratkaisu, T, muuttui: tallenna
  });
  lopullinen?.addEventListener("input", tallenna);
  document.querySelectorAll('input[name="valinta"]').forEach(r => r.addEventListener("change", tallenna));

  // Tarkistus – sallittu milloin tahansa. Tyhjä vastaus = "kesken" (näyttää mallivastauksen).
  const tarkista = () => {
    const annettu = annettuVastaus();
    virhe.textContent = "";
    if (annettu !== "" && k.vastaus.tyyppi === "numero" && isNaN(lueNumero(annettu))) { virhe.textContent = T.eiNumero; return; }
    if (annettu !== "" && k.vastaus.tyyppi === "numerot" && erotteleNumerot(annettu).some(isNaN)) { virhe.textContent = T.useampiVastaus; return; }

    const tulos = tarkistaVastaus(k, annettu);
    Seuranta.tallennaYritys(k, aine.id, tulos);   // <- seuranta tallentaa yrityksen ja sen tilan

    const alue = document.getElementById("tulokset");
    alue.innerHTML = tuloksetHTML(k, T, tulos, annettu);
    alue.scrollIntoView({ behavior: "smooth", block: "start" });

    document.getElementById("uudelleen").addEventListener("click", () => {
      alue.innerHTML = piilotetutTuloksetHTML(T);
      (lopullinen || editori).focus();
    });
    const seuraava = document.getElementById("seuraava-tulos");
    if (indeksi === kysymykset.length - 1) seuraava.hidden = true;
    seuraava.addEventListener("click", () => siirry(indeksi + 2));

    // Päivitä tilamerkki (✓ ◐ … ✗) tehtävälistaan
    const valinta = document.getElementById("tehtavavalinta").options[indeksi];
    const tilaNyt = Seuranta.kysymysTilat().tila.get(k.id);
    valinta.textContent = `${TILA_MERKKI[tilaNyt]} ${k.numero} · ${k.aihe}`;
  };
  document.getElementById("tarkista").addEventListener("click", tarkista);
  lopullinen?.addEventListener("keydown", e => { if (e.key === "Enter") tarkista(); });

  // Navigointi
  document.getElementById("edellinen").addEventListener("click", () => siirry(indeksi));
  document.getElementById("seuraava").addEventListener("click", () => siirry(indeksi + 2));
  document.getElementById("tehtavavalinta").addEventListener("change", e => siirry(e.target.value));
}

// ---------------------------------------------------------
// Edistys-sivu
// ---------------------------------------------------------
let edistysPaivia = 30;   // aikaväli muistetaan, kun suodatinta vaihdetaan

// aineId ja kurssiId tulevat osoitteesta: #/edistys/<aine>/<kurssi>
async function naytaEdistys(aineId, kurssiId) {
  merkitseAktiivinen("edistys");
  document.documentElement.lang = "fi";
  murupolku.innerHTML = "<b>Edistys</b>";

  const tiedot = await Promise.all(Data.aineet.map(a => Data.lataaAine(a.id).catch(() => ({ kysymykset: [], kurssit: [] }))));
  const aine = Data.haeAine(aineId);
  if (!aine) { aineId = ""; kurssiId = ""; }
  const aineenTiedot = aine ? tiedot[Data.aineet.indexOf(aine)] : null;
  const kurssi = aineenTiedot?.kurssit?.find(k => k.id === kurssiId);
  if (!kurssi) kurssiId = "";

  const paivia = edistysPaivia;
  const yht = Seuranta.yhteenveto(aineId || undefined, kurssiId || undefined);
  const sarja = Seuranta.paivasarja(aineId || undefined, paivia, kurssiId || undefined);
  // Kuinka monta tehtävää valitussa aineessa / kurssissa on yhteensä (suoritusprosentin ja arvosanarajojen pohja)
  const kaikkiaan = kurssi
    ? aineenTiedot.kysymykset.filter(q => q.kurssi === kurssi.id).length
    : aineenTiedot ? aineenTiedot.kysymykset.length
    : tiedot.reduce((s, t) => s + t.kysymykset.length, 0);
  const valitunNimi = kurssi ? `${kurssi.id} ${kurssi.nimi}` : aine ? nimiJaAlanimi(aine) : "Kaikki aineet";
  const { ratkaistut } = Seuranta.kysymysTilat();

  // Kurssivalinta näytetään vain, jos valitulla aineella on kursseja
  const kurssiValinta = aineenTiedot?.kurssit?.length ? `
    <select id="suodata-kurssi" aria-label="Kurssi">
      <option value="">Kaikki kurssit</option>
      ${aineenTiedot.kurssit.map(k => `<option value="${k.id}" ${k.id === kurssiId ? "selected" : ""}>${suojaa(k.id + " " + k.nimi)}</option>`).join("")}
    </select>` : "";

  // Palkit: aineittain, tai kursseittain jos valittu aine on jaettu kursseihin
  const palkki = (nimi, ratk, kaikki, linkki) => {
    const pros = kaikki ? Math.round(100 * ratk / kaikki) : 0;
    return `
      <div class="aine-tilasto">
        <span>${linkki ? `<a href="${linkki}">${suojaa(nimi)}</a>` : suojaa(nimi)}</span>
        <div class="palkki" title="${pros} %"><span style="width:${pros}%"></span></div>
        <span class="luku">${ratk} / ${kaikki} (${pros} %)</span>
      </div>`;
  };
  const palkit = aineenTiedot?.kurssit?.length
    ? aineenTiedot.kurssit.map(k => {
        const kys = aineenTiedot.kysymykset.filter(q => q.kurssi === k.id);
        return palkki(`${k.id} ${k.nimi}`, kys.filter(q => ratkaistut.has(q.id)).length, kys.length, `#/edistys/${aineId}/${k.id}`);
      }).join("")
    : Data.aineet.map((a, i) => palkki(nimiJaAlanimi(a), tiedot[i].kysymykset.filter(q => ratkaistut.has(q.id)).length, tiedot[i].kysymykset.length, `#/edistys/${a.id}`)).join("");

  sisalto.innerHTML = `
    <section class="edistys">
      <div class="edistys-ylarivi">
        <h1>Edistyksesi</h1>
        <div class="suodatin">
          <select id="suodata-aine" aria-label="Aine">
            <option value="">Kaikki aineet</option>
            ${Data.aineet.map(a => `<option value="${a.id}" ${a.id === aineId ? "selected" : ""}>${suojaa(nimiJaAlanimi(a))}</option>`).join("")}
          </select>
          ${kurssiValinta}
          ${[7, 30, 90].map(n => `<button data-paivia="${n}" class="${n === paivia ? "valittu" : ""}">${n} pv</button>`).join("")}
        </div>
      </div>

      <div class="tunnusluvut">
        <div class="tunnusluku"><small>Ratkaistut tehtävät</small><b>${yht.ratkaistuja}</b></div>
        <div class="tunnusluku"><small>Vastauksia yhteensä</small><b>${yht.yrityksia}</b></div>
        <div class="tunnusluku"><small>Suoritettu kaikista tehtävistä</small><b>${prosentti(yht.ratkaistuja, kaikkiaan)} %</b></div>
      </div>

      <div class="kortti kaavio-kortti">
        <h3>Ratkaistut tehtävät – ${suojaa(valitunNimi)}</h3>
        <p class="kuvaus">Kuinka suuren osan kaikista ${kaikkiaan} tehtävästä olet ratkaissut oikein, viimeiset ${paivia} päivää. Katkoviivat näyttävät arvosanarajat L–A.</p>
        <div class="kaavio-kehys" id="kaavio"></div>
        <details class="taulukkona">
          <summary>Näytä taulukkona</summary>
          <table>
            <tr><th>Päivä</th><th>Uusia ratkaistuja</th><th>Yhteensä</th><th>Suoritettu</th><th>Taso</th></tr>
            ${sarja.filter(p => p.uusia).map(p => `<tr><td>${p.paiva.toLocaleDateString("fi-FI")}</td><td>${p.uusia}</td><td>${p.ratkaistuja} / ${kaikkiaan}</td><td>${prosentti(p.ratkaistuja, kaikkiaan)} %</td><td>${arvosana(100 * p.ratkaistuja / kaikkiaan) || "–"}</td></tr>`).join("") || `<tr><td colspan="5">Ei vielä ratkaistuja tehtäviä tällä aikavälillä.</td></tr>`}
          </table>
        </details>
      </div>

      <div class="kortti kaavio-kortti">
        <h3>${aineenTiedot?.kurssit?.length ? `${suojaa(nimiJaAlanimi(aine))} kursseittain` : "Aineittain"}</h3>
        <p class="kuvaus">Kuinka suuren osan tehtävistä olet ratkaissut. Klikkaa nimeä nähdäksesi sen kaavion.</p>
        <div class="aine-tilastot">${palkit}</div>
      </div>
    </section>`;

  const kehys = document.getElementById("kaavio");
  if (yht.yrityksia === 0) {
    kehys.innerHTML = `<div class="kaavio-tyhja">Et ole vielä vastannut yhteenkään tehtävään${kurssi ? " tällä kurssilla" : ""}. Kaavio täyttyy, kun aloitat!</div>`;
  } else {
    piirraKaavio(kehys, sarja, kaikkiaan);
  }

  // Suodattimen vaihto muuttaa osoitetta -> reititys piirtää sivun uudelleen
  document.getElementById("suodata-aine").addEventListener("change", e => {
    location.hash = e.target.value ? `#/edistys/${e.target.value}` : "#/edistys";
  });
  document.getElementById("suodata-kurssi")?.addEventListener("change", e => {
    location.hash = `#/edistys/${aineId}${e.target.value ? "/" + e.target.value : ""}`;
  });
  document.querySelectorAll("[data-paivia]").forEach(n => n.addEventListener("click", () => {
    edistysPaivia = Number(n.dataset.paivia);
    naytaEdistys(aineId, kurssiId);
  }));
}

function nimiJaAlanimi(a) {
  return a.alanimi ? `${a.nimi} (${a.alanimi.toLowerCase()})` : a.nimi;
}
// Suoritusprosentti kokonaislukuna: ratkaistut / kaikki saatavilla olevat tehtävät
function prosentti(osa, kaikki) {
  return kaikki ? Math.round(100 * osa / kaikki) : 0;
}

// ---------------------------------------------------------
// Asetukset (ratas oikeassa yläkulmassa)
// ---------------------------------------------------------
function kytkeAsetukset() {
  const nappi = document.getElementById("asetus-nappi");
  const valikko = document.getElementById("asetus-valikko");
  const muistilista = document.getElementById("asetus-muistilista");
  const nollaa = document.getElementById("asetus-nollaa");

  muistilista.checked = Seuranta.haeAsetukset().naytaMuistilista;

  const sulje = () => {
    valikko.hidden = true;
    nappi.setAttribute("aria-expanded", "false");
    nollaa.textContent = "Nollaa edistys";
    nollaa.classList.remove("vahvista");
  };
  nappi.addEventListener("click", e => {
    e.stopPropagation();
    const auki = valikko.hidden;
    sulje();
    if (auki) { valikko.hidden = false; nappi.setAttribute("aria-expanded", "true"); }
  });
  document.addEventListener("click", e => { if (!valikko.contains(e.target)) sulje(); });

  muistilista.addEventListener("change", () => {
    Seuranta.tallennaAsetus("naytaMuistilista", muistilista.checked);
    reititys();
  });
  document.getElementById("asetus-vie").addEventListener("click", () => Seuranta.vieTiedostona());

  // Nollaus vaatii kaksi klikkausta, ettei edistystä poisteta vahingossa
  nollaa.addEventListener("click", () => {
    if (!nollaa.classList.contains("vahvista")) {
      nollaa.textContent = "Varmasti? Klikkaa uudelleen";
      nollaa.classList.add("vahvista");
      return;
    }
    Seuranta.nollaa();
    sulje();
    reititys();
  });
}

kaynnista();
