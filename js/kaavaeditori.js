// =========================================================
// kaavaeditori.js – vastauslaatikon tekstieditori, jossa on LaTeX-kaavat
//
// Toimii kuten ylioppilaskokeen Abitti-editori: kirjoitat tekstiä, ja
// Ctrl+E avaa kaavan. Kaava kirjoitetaan LaTeXilla, ja se piirtyy
// (KaTeX-kirjasto) heti kirjoittaessa.
//
// Rakenne sivulla:
//   .kaava-tyokalut   painikkeet (murtoluku, juuri, potenssi …)
//   .kaava-teksti     muokattava tekstialue (contenteditable)
//                     -> sisältää tekstiä, <br>-rivinvaihtoja ja kaavoja
//                        <span class="kaava-pala" data-latex="\frac{1}{2}">
//   .kaava-paneeli    LaTeX-kenttä, näkyy kun kaavaa muokataan
//
// Tallennusmuoto (merkkijono): kaavat ovat merkkien \( ja \) välissä, esim.
//   "Korkokanta on \(\frac{2,4}{2}\) % jaksossa"
//
// PIKANÄPPÄIMET
//   Tekstissä:  Ctrl+E      uusi kaava
//               Enter       rivinvaihto
//               ← / →       siirtyy viereiseen kaavaan muokattavaksi
//   Kaavassa:   Enter, Esc tai Ctrl+E   kaava valmis
//               ^ ja _      yläindeksi / alaindeksi aaltosulkeineen
//               Tab         laajentaa lyhenteen (frac, sqrt, int, pi …)
//                           tai hyppää seuraavaan tyhjään {}-kohtaan
//               Shift+Tab   edelliseen tyhjään {}-kohtaan
//               ← alussa / → lopussa   takaisin tekstiin
//               Backspace tyhjässä kaavassa   poistaa kaavan
// =========================================================

// Kursorin paikka malleissa merkitään §-merkillä
const KAAVA_LYHENTEET = {
  frac: "\\frac{§}{}", sqrt: "\\sqrt{§}", root: "\\sqrt[§]{}",
  int: "\\int_{§}^{} \\, dx", sum: "\\sum_{§}^{}", lim: "\\lim_{x \\to §}",
  vec: "\\overline{§}", abs: "\\left|§\\right|", binom: "\\binom{§}{}",
  log: "\\log_{§}", ln: "\\ln §", sin: "\\sin §", cos: "\\cos §", tan: "\\tan §",
  pi: "\\pi§", alpha: "\\alpha§", beta: "\\beta§", gamma: "\\gamma§", delta: "\\delta§",
  Delta: "\\Delta§", theta: "\\theta§", lambda: "\\lambda§", mu: "\\mu§", sigma: "\\sigma§",
  inf: "\\infty§", infty: "\\infty§", cdot: "\\cdot §", pm: "\\pm §", deg: "^{\\circ}§",
  le: "\\le §", leq: "\\le §", ge: "\\ge §", geq: "\\ge §", ne: "\\ne §", neq: "\\ne §",
  approx: "\\approx §", to: "\\to §", implies: "\\Rightarrow §", iff: "\\Leftrightarrow §"
};

// Työkalupalkin painikkeet: [näkyvä teksti, LaTeX-malli, vihje]
const KAAVA_PAINIKKEET = [
  ["a/b", "\\frac{§}{}", "frac + Tab"], ["xⁿ", "^{§}", "^"], ["xₙ", "_{§}", "_"],
  ["√", "\\sqrt{§}", "sqrt + Tab"], ["ⁿ√", "\\sqrt[§]{}", "root + Tab"],
  ["·", "\\cdot §", "cdot + Tab"], ["±", "\\pm §", "pm + Tab"], ["π", "\\pi§", "pi + Tab"],
  ["≤", "\\le §", "le + Tab"], ["≥", "\\ge §", "ge + Tab"], ["≠", "\\ne §", "ne + Tab"],
  ["≈", "\\approx §", "approx + Tab"], ["∞", "\\infty§", "inf + Tab"], ["°", "^{\\circ}§", "deg + Tab"],
  ["∫", "\\int_{§}^{} \\, dx", "int + Tab"], ["Σ", "\\sum_{§}^{}", "sum + Tab"],
  ["lim", "\\lim_{x \\to §}", "lim + Tab"], ["ā", "\\overline{§}", "vec + Tab"],
  ["|x|", "\\left|§\\right|", "abs + Tab"], ["Δ", "\\Delta§", "Delta + Tab"],
  ["→", "\\to §", "to + Tab"], ["⇔", "\\Leftrightarrow §", "iff + Tab"]
];

const NOLLALEVEA = "​";   // näkymätön merkki, jotta kursorin voi asettaa kaavan viereen

const Kaavaeditori = {

  // Luo editorin elementin `juuri` sisään.
  //   asetukset.alkuarvo  tallennettu merkkijono
  //   asetukset.muuttui   kutsutaan aina, kun sisältö muuttuu
  //   asetukset.T         käyttöliittymän tekstit (TEKSTIT.fi / .en)
  luo(juuri, asetukset) {
    const T = asetukset.T;
    juuri.classList.add("kaavaeditori");
    juuri.innerHTML = `
      <div class="kaava-tyokalut" role="toolbar" aria-label="${T.kaavaTyokalut}">
        <button type="button" class="uusi-kaava" data-uusi title="Ctrl+E">${T.uusiKaava} <kbd>Ctrl+E</kbd></button>
        ${KAAVA_PAINIKKEET.map(([teksti, malli, vihje]) =>
          `<button type="button" data-malli="${suojaaAttr(malli)}" title="${suojaaAttr(vihje)}">${teksti}</button>`).join("")}
        <button type="button" class="ohje-nappi" data-ohje aria-expanded="false" title="${T.pikanappaimet}">?</button>
      </div>
      <div class="kaava-ohje" hidden>${T.kaavaOhje}</div>
      <div class="kaava-teksti" contenteditable="true" role="textbox" aria-multiline="true"
           aria-label="${T.ratkaisu}" data-placeholder="${suojaaAttr(T.ratkaisuPaikka)}" spellcheck="false"></div>
      <div class="kaava-paneeli" hidden>
        <label>LaTeX</label>
        <input type="text" class="kaava-syote" spellcheck="false" autocomplete="off" aria-label="LaTeX">
        <span class="kaava-vihje">${T.kaavaVihje}</span>
      </div>`;

    const teksti = juuri.querySelector(".kaava-teksti");
    const paneeli = juuri.querySelector(".kaava-paneeli");
    const syote = juuri.querySelector(".kaava-syote");
    const ohje = juuri.querySelector(".kaava-ohje");
    let aktiivinen = null;   // kaava, jota muokataan juuri nyt

    const muuttui = () => asetukset.muuttui && asetukset.muuttui();

    // ---------- Kaavan piirtäminen ----------
    function piirra(kaava) {
      const latex = kaava.dataset.latex || "";
      if (latex.trim() === "") {
        kaava.classList.add("tyhja");
        kaava.textContent = "□";
        return;
      }
      kaava.classList.remove("tyhja");
      try {
        // \displaystyle = murtoluvut ja integraalit täysikokoisina (kuin käsin kirjoitettuna)
        katex.render("\\displaystyle " + latex, kaava, { throwOnError: false, errorColor: "#964734", displayMode: false });
      } catch (e) {
        kaava.textContent = latex;
      }
    }

    function luoKaavaElementti(latex) {
      const kaava = document.createElement("span");
      kaava.className = "kaava-pala";
      kaava.contentEditable = "false";
      kaava.dataset.latex = latex;
      piirra(kaava);
      return kaava;
    }

    // ---------- Kursorin käsittely tekstissä ----------
    function asetaKursori(solmu, kohta) {
      const valinta = window.getSelection();
      const alue = document.createRange();
      alue.setStart(solmu, kohta);
      alue.collapse(true);
      valinta.removeAllRanges();
      valinta.addRange(alue);
    }

    function kursoriKaavanViereen(kaava, puoli) {
      teksti.focus();
      if (puoli === "jalkeen") {
        let seuraava = kaava.nextSibling;
        if (!seuraava || seuraava.nodeType !== Node.TEXT_NODE) {
          seuraava = document.createTextNode(NOLLALEVEA);
          kaava.after(seuraava);
          asetaKursori(seuraava, 1);
        } else {
          asetaKursori(seuraava, seuraava.textContent.startsWith(NOLLALEVEA) ? 1 : 0);
        }
      } else {
        let edellinen = kaava.previousSibling;
        if (!edellinen || edellinen.nodeType !== Node.TEXT_NODE) {
          edellinen = document.createTextNode(NOLLALEVEA);
          kaava.before(edellinen);
        }
        asetaKursori(edellinen, edellinen.textContent.length);
      }
    }

    // Palauttaa kaavan, joka on kursorin vieressä annetulla puolella (tai null)
    function viereinenKaava(suunta) {
      const valinta = window.getSelection();
      if (!valinta.rangeCount || !valinta.isCollapsed) return null;
      let { startContainer: solmu, startOffset: kohta } = valinta.getRangeAt(0);
      if (!teksti.contains(solmu)) return null;
      let ehdokas = null;
      if (solmu.nodeType === Node.TEXT_NODE) {
        const sisalto = solmu.textContent;
        // Näkymättömät merkit eivät lasketa "oikeiksi" merkeiksi
        const ennen = sisalto.slice(0, kohta).replace(/​/g, "");
        const jalkeen = sisalto.slice(kohta).replace(/​/g, "");
        if (suunta === "vasen" && ennen === "") ehdokas = solmu.previousSibling;
        if (suunta === "oikea" && jalkeen === "") ehdokas = solmu.nextSibling;
      } else {
        ehdokas = suunta === "vasen" ? solmu.childNodes[kohta - 1] : solmu.childNodes[kohta];
      }
      return ehdokas && ehdokas.classList && ehdokas.classList.contains("kaava-pala") ? ehdokas : null;
    }

    // ---------- Kaavan avaaminen ja sulkeminen ----------
    function avaa(kaava, kursori = "loppu") {
      if (aktiivinen && aktiivinen !== kaava) sulje("ei");
      aktiivinen = kaava;
      kaava.classList.add("muokattava");
      paneeli.hidden = false;
      syote.value = kaava.dataset.latex || "";
      syote.focus();
      const paikka = kursori === "alku" ? 0 : syote.value.length;
      syote.setSelectionRange(paikka, paikka);
    }

    // minne: "jalkeen" | "ennen" | "ei" (kursori jää paikalleen)
    function sulje(minne = "jalkeen") {
      if (!aktiivinen) return;
      const kaava = aktiivinen;
      aktiivinen = null;
      paneeli.hidden = true;
      kaava.classList.remove("muokattava");
      kaava.dataset.latex = syote.value.trim();
      if (kaava.dataset.latex === "") {
        // Tyhjä kaava poistetaan
        const edellinen = kaava.previousSibling;
        kaava.remove();
        if (minne !== "ei") {
          teksti.focus();
          if (edellinen && edellinen.nodeType === Node.TEXT_NODE) asetaKursori(edellinen, edellinen.textContent.length);
        }
      } else {
        piirra(kaava);
        if (minne !== "ei") kursoriKaavanViereen(kaava, minne);
      }
      muuttui();
    }

    function uusiKaava(malli = "") {
      if (aktiivinen) sulje("jalkeen");
      const kaava = luoKaavaElementti("");
      const valinta = window.getSelection();
      if (valinta.rangeCount && teksti.contains(valinta.getRangeAt(0).startContainer)) {
        const alue = valinta.getRangeAt(0);
        alue.deleteContents();
        alue.insertNode(kaava);
      } else {
        teksti.appendChild(kaava);
      }
      avaa(kaava);
      if (malli) lisaaMalli(malli);
      muuttui();
    }

    // Lisää LaTeX-mallin kursorin kohdalle. §-merkki = kursorin uusi paikka.
    // Jos tekstiä on valittuna, se siirtyy kursorin kohdalle (esim. valinta -> \sqrt{valinta}).
    function lisaaMalli(malli, korvaaAlusta = 0) {
      const alku = syote.selectionStart - korvaaAlusta;
      const loppu = syote.selectionEnd;
      const valittu = korvaaAlusta ? "" : syote.value.slice(syote.selectionStart, loppu);
      const [ennen, jalkeen] = malli.split("§");
      const lisays = ennen + valittu + (jalkeen ?? "");
      syote.value = syote.value.slice(0, alku) + lisays + syote.value.slice(loppu);
      const kursori = alku + ennen.length + valittu.length;
      syote.setSelectionRange(kursori, kursori);
      paivitaAktiivinen();
    }

    function paivitaAktiivinen() {
      if (!aktiivinen) return;
      aktiivinen.dataset.latex = syote.value;
      piirra(aktiivinen);
      muuttui();
    }

    // Hyppää seuraavaan (tai edelliseen) tyhjään {}-pariin
    function hyppaaPaikkaan(suunta) {
      const v = syote.value, k = syote.selectionStart;
      const i = suunta > 0 ? v.indexOf("{}", k) : v.lastIndexOf("{}", Math.max(0, k - 2));
      if (i === -1 || (suunta < 0 && i + 1 >= k)) return false;
      syote.setSelectionRange(i + 1, i + 1);
      return true;
    }

    // ---------- Näppäimet: kaavakenttä ----------
    syote.addEventListener("input", paivitaAktiivinen);

    syote.addEventListener("keydown", e => {
      const alussa = syote.selectionStart === 0 && syote.selectionEnd === 0;
      const lopussa = syote.selectionStart === syote.value.length && syote.selectionEnd === syote.value.length;

      if (e.key === "Enter" || e.key === "Escape" || (e.ctrlKey && e.key.toLowerCase() === "e")) {
        e.preventDefault();
        sulje("jalkeen");
      } else if (e.key === "ArrowLeft" && alussa && !e.shiftKey) {
        e.preventDefault();
        sulje("ennen");
      } else if (e.key === "ArrowRight" && lopussa && !e.shiftKey) {
        e.preventDefault();
        sulje("jalkeen");
      } else if (e.key === "Backspace" && syote.value === "") {
        e.preventDefault();
        sulje("ennen");   // tyhjä kaava poistuu sulkiessa
      } else if ((e.key === "^" || e.key === "_") && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        lisaaMalli(e.key + "{§}");
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) { hyppaaPaikkaan(-1); return; }
        // Onko kursorin edessä lyhenne, esim. "frac" tai "\frac"?
        const ennen = syote.value.slice(0, syote.selectionStart);
        const osuma = ennen.match(/\\?([A-Za-z]+)$/);
        if (osuma && KAAVA_LYHENTEET[osuma[1]] && syote.selectionStart === syote.selectionEnd) {
          lisaaMalli(KAAVA_LYHENTEET[osuma[1]], osuma[0].length);
        } else if (!hyppaaPaikkaan(1)) {
          sulje("jalkeen");
        }
      }
    });

    // Jos käyttäjä klikkaa muualle sivulla, kaava suljetaan (kursori ei siirry)
    syote.addEventListener("blur", () => {
      setTimeout(() => {
        if (aktiivinen && document.activeElement !== syote && !juuri.contains(document.activeElement)) sulje("ei");
      }, 0);
    });

    // ---------- Näppäimet: tekstialue ----------
    teksti.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        uusiKaava();
      } else if (e.key === "Enter") {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.shiftKey) {
        const kaava = viereinenKaava(e.key === "ArrowLeft" ? "vasen" : "oikea");
        if (kaava) {
          e.preventDefault();
          avaa(kaava, e.key === "ArrowLeft" ? "loppu" : "alku");
        }
      }
    });

    // Liitetään vain pelkkä teksti (ei muotoiluja muista ohjelmista)
    teksti.addEventListener("paste", e => {
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    });

    teksti.addEventListener("input", muuttui);

    // Kaavan klikkaus avaa sen muokattavaksi
    teksti.addEventListener("mousedown", e => {
      const kaava = e.target.closest && e.target.closest(".kaava-pala");
      if (kaava && teksti.contains(kaava)) {
        e.preventDefault();
        avaa(kaava);
      }
    });

    // ---------- Työkalupalkki ----------
    juuri.querySelector(".kaava-tyokalut").addEventListener("mousedown", e => {
      if (e.target.closest("button")) e.preventDefault();   // fokus pysyy tekstissä/kaavassa
    });
    juuri.querySelector(".kaava-tyokalut").addEventListener("click", e => {
      const nappi = e.target.closest("button");
      if (!nappi) return;
      if (nappi.hasAttribute("data-ohje")) {
        ohje.hidden = !ohje.hidden;
        nappi.setAttribute("aria-expanded", String(!ohje.hidden));
      } else if (nappi.hasAttribute("data-uusi")) {
        uusiKaava();
      } else if (aktiivinen) {
        syote.focus();
        lisaaMalli(nappi.dataset.malli);
      } else {
        uusiKaava(nappi.dataset.malli);
      }
    });

    // ---------- Tallennus ----------
    function arvo() {
      const osat = [];
      const kay = solmu => {
        solmu.childNodes.forEach(lapsi => {
          if (lapsi.nodeType === Node.TEXT_NODE) osat.push(lapsi.textContent.replace(/​/g, ""));
          else if (lapsi.nodeName === "BR") osat.push("\n");
          else if (lapsi.classList && lapsi.classList.contains("kaava-pala")) {
            const latex = lapsi === aktiivinen ? syote.value : lapsi.dataset.latex;
            if (latex.trim()) osat.push(`\\(${latex}\\)`);
          } else {
            // Selaimen itse luomat <div>-rivit (varmuuden vuoksi)
            if (osat.length) osat.push("\n");
            kay(lapsi);
          }
        });
      };
      kay(teksti);
      return osat.join("").replace(/\n+$/, "");
    }

    function asetaArvo(merkkijono) {
      teksti.innerHTML = "";
      const palat = String(merkkijono || "").split(/\\\(([\s\S]*?)\\\)/);
      palat.forEach((pala, i) => {
        if (i % 2 === 1) {
          teksti.appendChild(luoKaavaElementti(pala));
        } else {
          pala.split("\n").forEach((rivi, j) => {
            if (j > 0) teksti.appendChild(document.createElement("br"));
            if (rivi) teksti.appendChild(document.createTextNode(rivi));
          });
        }
      });
    }

    asetaArvo(asetukset.alkuarvo);

    return {
      arvo,
      asetaArvo,
      focus: () => teksti.focus(),
      uusiKaava,
      sulje: () => sulje("ei")
    };
  }
};

function suojaaAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
