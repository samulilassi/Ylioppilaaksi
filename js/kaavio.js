// =========================================================
// kaavio.js – edistyskaavio (viivakaavio SVG:nä, ilman kirjastoja)
//
// piirraKaavio(kehys, sarja, kaikkiaan) piirtää käyrän:
// "kuinka monta prosenttia kaikista tehtävistä olet ratkaissut oikein"
// päivä päivältä. Katkoviivat näyttävät arvosanarajat (L, E, M, C, B, A).
// Hiiren vienti kaavion päälle näyttää päivän tiedot.
// =========================================================

// Arvosanarajat: kuinka monta prosenttia tehtävistä pitää olla ratkaistu.
// Muuta rajoja tästä – kaavio ja taulukko päivittyvät itsestään.
const ARVOSANAT = [
  { kirjain: "L", raja: 95 },
  { kirjain: "E", raja: 80 },
  { kirjain: "M", raja: 65 },
  { kirjain: "C", raja: 50 },
  { kirjain: "B", raja: 35 },
  { kirjain: "A", raja: 25 }
];

// Palauttaa arvosanan, jonka raja on saavutettu (tai "" jos ei vielä A:ta)
function arvosana(prosentti) {
  const osuma = ARVOSANAT.find(a => prosentti >= a.raja);
  return osuma ? osuma.kirjain : "";
}

function piirraKaavio(kehys, sarja, kaikkiaan) {
  const L = 760, K = 300;                                    // SVG:n koko
  const vasen = 44, oikea = 30, yla = 14, ala = 30;          // marginaalit (oikealla tilaa kirjaimille)
  const leveys = L - vasen - oikea, korkeus = K - yla - ala;

  const pros = p => kaikkiaan ? (100 * p.ratkaistuja / kaikkiaan) : 0;
  const x = i => vasen + (sarja.length === 1 ? leveys / 2 : (i / (sarja.length - 1)) * leveys);
  const y = prosentti => yla + korkeus - (prosentti / 100) * korkeus;   // akseli aina 0–100 %

  const pv = d => `${d.getDate()}.${d.getMonth() + 1}.`;

  // Pohjaviiva 0 % ja yläreuna 100 % (100 %:lle ei tekstiä, ettei se mene L-rajan päälle)
  let ruudukko = [0, 100].map(arvo => `
    <line x1="${vasen}" x2="${L - oikea}" y1="${y(arvo)}" y2="${y(arvo)}" stroke="var(--reuna)" stroke-width="1"/>
    ${arvo === 0 ? `<text x="${vasen - 8}" y="${y(arvo) + 4}" text-anchor="end" font-size="11" fill="var(--teksti-hento)" stroke="none">0 %</text>` : ""}`).join("");

  // Arvosanarajat katkoviivoina: vasemmalla prosentti, oikealla kirjain
  ruudukko += ARVOSANAT.map(a => `
    <line x1="${vasen}" x2="${L - oikea}" y1="${y(a.raja)}" y2="${y(a.raja)}" stroke="var(--petrooli)" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="${vasen - 8}" y="${y(a.raja) + 4}" text-anchor="end" font-size="11" fill="var(--teksti-hento)" stroke="none">${a.raja} %</text>
    <text x="${L - oikea + 10}" y="${y(a.raja) + 4}" font-size="12" font-weight="700" fill="var(--petrooli)" stroke="none">${a.kirjain}</text>`).join("");

  // X-akselin päivämäärät (noin viikon välein)
  const vali = Math.max(1, Math.round(sarja.length / 5));
  let xLuvut = "";
  sarja.forEach((p, i) => {
    if (i % vali === 0 || i === sarja.length - 1) {
      xLuvut += `<text x="${x(i)}" y="${K - 8}" text-anchor="middle" font-size="11" fill="var(--teksti-hento)" stroke="none">${pv(p.paiva)}</text>`;
    }
  });

  const pisteet = sarja.map((p, i) => `${x(i)},${y(pros(p))}`).join(" ");
  const alue = `${x(0)},${y(0)} ${pisteet} ${x(sarja.length - 1)},${y(0)}`;

  // Merkitse päivät, joina ratkaistiin uusia tehtäviä
  const merkit = sarja
    .map((p, i) => p.uusia ? `<circle cx="${x(i)}" cy="${y(pros(p))}" r="4" fill="var(--turkoosi)" stroke="var(--valkoinen)" stroke-width="2"/>` : "")
    .join("");

  kehys.innerHTML = `
    <svg viewBox="0 0 ${L} ${K}" role="img" aria-label="Ratkaistut tehtävät prosentteina ja arvosanarajat">
      ${ruudukko}
      ${xLuvut}
      <polygon points="${alue}" fill="var(--jaa)" fill-opacity="0.35" stroke="none"/>
      <polyline points="${pisteet}" stroke="var(--turkoosi)" stroke-width="2" fill="none"/>
      ${merkit}
      <line class="hiusristikko" y1="${yla}" y2="${yla + korkeus}" stroke="var(--petrooli)" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>
      <circle class="kohdistin" r="5" fill="var(--syva)" stroke="var(--valkoinen)" stroke-width="2" visibility="hidden"/>
      <rect x="${vasen}" y="${yla}" width="${leveys}" height="${korkeus}" fill="transparent" stroke="none" class="hiirialue"/>
    </svg>
    <div class="vihje" hidden></div>`;

  // ---------- Hiiren seuranta (tooltip) ----------
  const svg = kehys.querySelector("svg");
  const viiva = svg.querySelector(".hiusristikko");
  const kohdistin = svg.querySelector(".kohdistin");
  const vihje = kehys.querySelector(".vihje");

  svg.querySelector(".hiirialue").addEventListener("mousemove", e => {
    const r = svg.getBoundingClientRect();
    const svgX = ((e.clientX - r.left) / r.width) * L;
    const i = Math.max(0, Math.min(sarja.length - 1, Math.round(((svgX - vasen) / leveys) * (sarja.length - 1))));
    const p = sarja[i];
    const prosentti = pros(p);
    viiva.setAttribute("x1", x(i)); viiva.setAttribute("x2", x(i));
    viiva.setAttribute("visibility", "visible");
    kohdistin.setAttribute("cx", x(i)); kohdistin.setAttribute("cy", y(prosentti));
    kohdistin.setAttribute("visibility", "visible");

    const taso = arvosana(prosentti);
    vihje.hidden = false;
    vihje.style.left = (x(i) / L) * r.width + "px";
    vihje.style.top = (y(prosentti) / K) * r.height + "px";
    vihje.innerHTML = `<small>${p.paiva.toLocaleDateString("fi-FI", { weekday: "short", day: "numeric", month: "numeric" })}</small>
      <b>${Math.round(prosentti)} %</b> · ${p.ratkaistuja} / ${kaikkiaan} tehtävää${p.uusia ? ` · +${p.uusia} uutta` : ""}
      <small>${taso ? "Taso: " + taso : "Ei vielä A-tasoa (25 %)"}</small>`;
  });
  svg.querySelector(".hiirialue").addEventListener("mouseleave", () => {
    viiva.setAttribute("visibility", "hidden");
    kohdistin.setAttribute("visibility", "hidden");
    vihje.hidden = true;
  });
}
