// ---------------------------------------------------------------
// Mini-Browser – Frontend-Logik (statische Version für GitHub Pages)
//
// Unterschied zur lokalen Version mit Express-Backend:
// Es gibt keinen /check-frame-Aufruf mehr. Wir laden jede URL einfach
// direkt im iframe. Lässt eine Seite das Einbetten nicht zu, bleibt
// der iframe leer – als Ausweg gibt es den permanenten
// "In neuem Tab öffnen"-Link in der Toolbar.
// ---------------------------------------------------------------

// --- DOM-Referenzen ---
const urlInput   = document.getElementById('url-input');
const goBtn      = document.getElementById('go-btn');
const backBtn    = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const frame      = document.getElementById('browser-frame');
const placeholder = document.getElementById('placeholder');
const newTabLink  = document.getElementById('new-tab-link');

// --- Eigene Verlaufsliste ---
// Wir greifen bewusst NICHT auf iframe.contentWindow.history zu:
// Bei einer fremden Domain im iframe (Cross-Origin) blockiert die
// Same-Origin-Policy des Browsers den Zugriff darauf sowieso.
let history = [];
let currentIndex = -1;

// Ergänzt "https://", falls der Nutzer z. B. nur "wikipedia.org" eingibt
function normalizeUrl(raw) {
  const url = raw.trim();
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}

// Lädt eine URL und kümmert sich um Anzeige + Verlauf.
// addToHistory = false wird beim Klick auf Zurück/Vorwärts genutzt,
// damit dabei nicht wieder ein neuer Verlaufseintrag entsteht.
function navigateTo(url, addToHistory = true) {
  placeholder.style.display = 'none';
  frame.style.display = 'block';
  frame.src = url;

  urlInput.value = url;

  // "Neuer Tab"-Link auf die aktuelle URL zeigen lassen und aktivieren
  newTabLink.href = url;
  newTabLink.classList.remove('disabled');

  if (addToHistory) {
    // Falls der Nutzer vorher "Zurück" geklickt hat, verwerfen wir
    // den bisherigen "Vorwärts"-Pfad – genau wie ein echter Browser.
    history = history.slice(0, currentIndex + 1);
    history.push(url);
    currentIndex = history.length - 1;
  }

  updateNavButtons();
}

function updateNavButtons() {
  backBtn.disabled = currentIndex <= 0;
  forwardBtn.disabled = currentIndex >= history.length - 1;
}

// --- Event-Listener ---

goBtn.addEventListener('click', () => {
  if (urlInput.value.trim()) {
    navigateTo(normalizeUrl(urlInput.value));
  }
});

// Enter im Eingabefeld löst "Los" aus
urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    goBtn.click();
  }
});

backBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    navigateTo(history[currentIndex], false);
  }
});

forwardBtn.addEventListener('click', () => {
  if (currentIndex < history.length - 1) {
    currentIndex += 1;
    navigateTo(history[currentIndex], false);
  }
});
