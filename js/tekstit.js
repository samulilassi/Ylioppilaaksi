// =========================================================
// tekstit.js – käyttöliittymän tekstit ja aineiden ikonit
//
// Sivusto on suomeksi. Ainoa poikkeus: Englanti-välilehti,
// jonka tehtäväsivu käyttää englanninkielisiä tekstejä ("en").
// Aineen kieli asetetaan tiedostossa kysymykset/aineet.json.
// =========================================================

const TEKSTIT = {
  fi: {
    tehtava: "TEHTÄVÄ",
    pistetta: "p.",
    harjoitus: "Harjoitus",
    vastauksesi: "Vastauksesi",
    tallennettu: "Tallennettu automaattisesti",
    ratkaisu: "Ratkaisu ja perustelut",
    ratkaisuPaikka: "Kirjoita ratkaisusi vaiheittain tähän…",
    lopullinen: "Lopullinen vastaus",
    valitse: "Valitse vastaus",
    esim: "esim. ",
    tarkista: "Tarkista vastaus",
    tyhjaVastaus: "Kirjoita ensin lopullinen vastaus.",
    eiNumero: "Kirjoita vastaus numerona, esim. 12 345,67.",
    kaavaTyokalut: "Kaavatyökalut",
    uusiKaava: "Σ Kaava",
    pikanappaimet: "Pikanäppäimet",
    kaavaVihje: "Enter / Esc = valmis · Tab = laajenna lyhenne",
    kaavaOhje: `
      <table>
        <tr><th colspan="2">Tekstissä</th></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>E</kbd></td><td>Uusi kaava (sama kuin yo-kokeen Abitti-editorissa)</td></tr>
        <tr><td><kbd>Enter</kbd></td><td>Rivinvaihto</td></tr>
        <tr><td><kbd>←</kbd> / <kbd>→</kbd> kaavan vieressä</td><td>Avaa kaavan muokattavaksi</td></tr>
        <tr><td>Klikkaus kaavaan</td><td>Avaa kaavan muokattavaksi</td></tr>
        <tr><th colspan="2">Kaavassa</th></tr>
        <tr><td><kbd>Enter</kbd>, <kbd>Esc</kbd> tai <kbd>Ctrl</kbd>+<kbd>E</kbd></td><td>Kaava valmis, takaisin tekstiin</td></tr>
        <tr><td><kbd>^</kbd> / <kbd>_</kbd></td><td>Ylä- / alaindeksi: x^{…}, x_{…}</td></tr>
        <tr><td><kbd>Tab</kbd></td><td>Laajentaa lyhenteen tai hyppää seuraavaan tyhjään {}-kohtaan</td></tr>
        <tr><td><kbd>Shift</kbd>+<kbd>Tab</kbd></td><td>Edelliseen tyhjään {}-kohtaan</td></tr>
        <tr><td><kbd>←</kbd> alussa / <kbd>→</kbd> lopussa</td><td>Pois kaavasta tekstiin</td></tr>
        <tr><td><kbd>Backspace</kbd> tyhjässä kaavassa</td><td>Poistaa kaavan</td></tr>
        <tr><th colspan="2">Lyhenteet (kirjoita + <kbd>Tab</kbd>)</th></tr>
        <tr><td colspan="2"><code>frac sqrt root int sum lim vec abs binom log ln sin cos tan pi alpha beta gamma delta Delta theta lambda mu sigma inf cdot pm deg le ge ne approx to implies iff</code></td></tr>
      </table>`,
    useampiVastaus: "Erota vastaukset puolipisteellä, esim. −2; 3",
    useampiOhje: "Erota useampi vastaus puolipisteellä (;)",
    tuloksetPiilossa: "Tulokset ovat piilossa",
    tuloksetPiilossaTeksti: "Voit tarkistaa milloin tahansa – myös kesken. Silloin näet mallivastauksen ja pisteet.",
    oikein: "Oikein!",
    osittain: "Osittain oikein",
    kesken: "Kesken",
    vaarin: "Väärin",
    oikeinTeksti: "Lopullinen vastauksesi on oikein.",
    osittainTeksti: "Osa vastauksesta on oikein. Vertaa mallivastaukseen.",
    keskenTeksti: "Et ole vielä antanut lopullista vastausta. Tässä mallivastaus – yritä sitten itse.",
    vaarinTeksti: "Vertaa ratkaisuasi mallivastaukseen.",
    pyoristysVihje: "Olet lähellä! Tarkista pyöristys ja tarkkuus.",
    jarjestysVihje: "Oikeat luvut, mutta väärässä järjestyksessä.",
    sinunVastaus: "Sinun vastauksesi",
    oikeaVastaus: "Oikea vastaus",
    mallivastaus: "Mallivastaus",
    yritaUudelleen: "Yritä uudelleen",
    seuraava: "Seuraava tehtävä",
    edellinen: "Edellinen",
    muistilista: "MUISTILISTA",
    yleinenVirhe: "YLEINEN VIRHE",
    taulukot: "MAOL-TAULUKOT",
    eiTehtavia: "Tähän aineeseen ei ole vielä lisätty tehtäviä.",
    huomioPisteet: "Automaattinen tarkistus antaa täydet pisteet oikeasta lopullisesta vastauksesta. Oikeassa kokeessa pisteitä saa myös perusteluista."
  },
  en: {
    tehtava: "TASK",
    pistetta: "p.",
    harjoitus: "Practice",
    vastauksesi: "Your answer",
    tallennettu: "Saved automatically",
    ratkaisu: "Notes and reasoning",
    ratkaisuPaikka: "Write your notes here…",
    lopullinen: "Final answer",
    valitse: "Choose an answer",
    esim: "e.g. ",
    tarkista: "Check answer",
    tyhjaVastaus: "Please give a final answer first.",
    eiNumero: "Please write a number.",
    kaavaTyokalut: "Formula tools",
    uusiKaava: "Σ Formula",
    pikanappaimet: "Keyboard shortcuts",
    kaavaVihje: "Enter / Esc = done · Tab = expand shortcut",
    kaavaOhje: `
      <table>
        <tr><th colspan="2">In text</th></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>E</kbd></td><td>New formula</td></tr>
        <tr><td><kbd>Enter</kbd></td><td>New line</td></tr>
        <tr><td><kbd>←</kbd> / <kbd>→</kbd> next to a formula</td><td>Edit the formula</td></tr>
        <tr><th colspan="2">In a formula</th></tr>
        <tr><td><kbd>Enter</kbd>, <kbd>Esc</kbd> or <kbd>Ctrl</kbd>+<kbd>E</kbd></td><td>Done, back to text</td></tr>
        <tr><td><kbd>^</kbd> / <kbd>_</kbd></td><td>Superscript / subscript</td></tr>
        <tr><td><kbd>Tab</kbd></td><td>Expand shortcut or jump to next empty {}</td></tr>
        <tr><td><kbd>Shift</kbd>+<kbd>Tab</kbd></td><td>Previous empty {}</td></tr>
        <tr><td><kbd>Backspace</kbd> in empty formula</td><td>Delete formula</td></tr>
      </table>`,
    useampiVastaus: "Separate answers with a semicolon, e.g. −2; 3",
    useampiOhje: "Separate multiple answers with a semicolon (;)",
    tuloksetPiilossa: "Results are hidden",
    tuloksetPiilossaTeksti: "You can check at any time – even before you finish. You'll see the model answer and score.",
    oikein: "Correct!",
    osittain: "Partly correct",
    kesken: "Unfinished",
    vaarin: "Wrong",
    oikeinTeksti: "Your final answer is correct.",
    osittainTeksti: "Part of your answer is correct. Compare with the model answer.",
    keskenTeksti: "You haven't given a final answer yet. Here's the model answer – then try it yourself.",
    vaarinTeksti: "Compare your answer with the model answer.",
    pyoristysVihje: "Very close! Check your rounding.",
    jarjestysVihje: "Right numbers, wrong order.",
    sinunVastaus: "Your answer",
    oikeaVastaus: "Correct answer",
    mallivastaus: "Model answer",
    yritaUudelleen: "Try again",
    seuraava: "Next task",
    edellinen: "Previous",
    muistilista: "CHEAT SHEET",
    yleinenVirhe: "COMMON MISTAKE",
    taulukot: "REFERENCE",
    eiTehtavia: "No tasks have been added to this subject yet.",
    huomioPisteet: "The automatic check gives full points for a correct final answer."
  }
};

// Yksinkertaiset ikonit (SVG). Avaimet vastaavat aineet.json-tiedoston "ikoni"-kenttää.
const IKONIT = {
  // Pitkä matematiikka: integraalimerkki
  integraali: '<svg viewBox="0 0 24 24"><path d="M14.5 3.5c-2 0-2.6 1.6-3 4l-1.6 9c-.4 2.4-1 4-3 4"/><path d="M15 12h5M17.5 9.5v5"/></svg>',
  // Lyhyt matematiikka: prosenttimerkki
  prosentti: '<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.6"/><circle cx="17" cy="17" r="2.6"/><path d="M19 5 5 19"/></svg>',
  // Fysiikka: atomi
  atomi: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/></svg>',
  // Kemia: koeputki/erlenmeyer
  pullo: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7.5 15h9"/></svg>',
  // Englanti: puhekupla EN
  kupla_en: '<svg viewBox="0 0 24 24"><path d="M2.5 3.5h19v13.5H9l-5 4v-4H2.5z"/><text x="12" y="13.6" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none" font-family="Arial">EN</text></svg>',
  // Ruotsi: puhekupla SV
  kupla_sv: '<svg viewBox="0 0 24 24"><path d="M2.5 3.5h19v13.5H9l-5 4v-4H2.5z"/><text x="12" y="13.6" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none" font-family="Arial">SV</text></svg>',
  // Äidinkieli: avoin kirja
  kirja: '<svg viewBox="0 0 24 24"><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/></svg>',
  // Muut
  lamppu: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  lukko: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  varoitus: '<svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>',
  nuoli: '<svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
