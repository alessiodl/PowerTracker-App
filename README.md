# PowerTrack - Powerlifting PWA Tracker

PowerTrack è un'applicazione web leggera (Single Page Application) progettata per tracciare e pianificare gli allenamenti di Powerlifting direttamente dal browser. È ottimizzata per l'uso da dispositivi mobili ed è predisposta per il funzionamento offline.

## Funzionalità Principali

* **Gestione Schede Target**: Definizione della progressione settimanale dei carichi e del recupero per ciascun esercizio.
* **Tracciamento Allenamenti in Tempo Reale**: Registrazione manuale di carichi effettivi, ripetizioni eseguite, tempi di recupero e annotazioni tecniche per ogni serie.
* **Valutazione Soggettiva RPE/RIR**: Possibilità di annotare manualmente l'indice di sforzo percepito (RPE) o le ripetizioni in riserva (RIR) per ciascun set.
* **Persistenza Locale**: I dati vengono salvati localmente sul dispositivo tramite IndexedDB (Dexie.js), garantendo il funzionamento anche in assenza di rete.
* **Importazione Intelligente con Intelligenza Artificiale**: Riconoscimento ed estrazione automatica di esercizi e carichi a partire da screenshot o appunti.
* **Sincronizzazione Cloud**: Esportazione automatica e manuale dei dati degli allenamenti su un foglio di calcolo Google Sheets.
* **Calcolo dei Livelli di Performance**: Un calcolatore integrato basato sui parametri di Project Invictus, che stima i tuoi livelli di forza teorici (I, II e III livello) nei tre fondamentali del Powerlifting (Squat, Panca, Stacco) e in alcuni esercizi accessori (Trazioni, Dip, Lento avanti) partendo dal tuo peso corporeo.

## Installazione ed Utilizzo su Dispositivi Mobili

Poiché l'applicazione è una Progressive Web App (PWA) client-side, per poterla installare sul tuo smartphone deve essere caricata e servita tramite un server. È possibile procedere seguendo **uno dei due metodi alternativi** descritti di seguito.

---

### Metodo 1: Ospitare l'applicazione online (Scelta consigliata per l'uso quotidiano)

Questo metodo permette di caricare il file su internet in modo permanente e sicuro, rendendo l'app installabile sul telefono come se fosse un'app nativa.

1. Carica la cartella del progetto su un servizio di hosting statico gratuito con supporto HTTPS (ad esempio Netlify, Vercel o GitHub Pages).
   * Se utilizzi Netlify, ti basta trascinare la cartella del progetto sulla piattaforma Netlify Drop.
2. Apri sul browser dello smartphone il link pubblico generato dal servizio di hosting (ad esempio `https://nome-app.netlify.app`).

---

### Metodo 2: Accesso tramite rete locale Wi-Fi (Scelta ideale per test rapidi senza pubblicare)

Questo metodo permette di accedere temporaneamente all'app dal telefono collegandosi al server di sviluppo del tuo computer tramite la stessa rete Wi-Fi di casa.

1. Dal computer, apri il terminale nella cartella del progetto ed avvia un server web locale (ad esempio, eseguendo `python -m http.server 8000`).
2. Individua l'indirizzo IP locale del tuo computer (es. `192.168.1.15`).
3. Apri il browser dello smartphone e digita l'indirizzo IP seguito dalla porta del server (es. `http://192.168.1.15:8000`).

---

### Come salvare l'applicazione sulla Schermata Home

Una volta aperto il link con uno dei due metodi precedenti:
* **iOS (Safari)**: Tocca l'icona di condivisione (quadrato con freccia verso l'alto) e seleziona "Aggiungi alla schermata Home".
* **Android (Chrome)**: Tocca l'icona dei tre puntini in alto a destra e seleziona "Aggiungi a schermata Home" o "Installa app".

## Configurazione Funzioni AI (Google Gemini)

L'importazione tramite immagine e appunti si appoggia al modello Gemini 3.6 Flash. Per abilitare la funzionalità:

1. Accedi a [Google AI Studio](https://aistudio.google.com/).
2. Genera una chiave API personale (API Key) gratuita.
3. Apri l'applicazione, accedi alla scheda "SYNC & STORICO" ed inserisci la chiave nel campo "API Key per funzionalità AI".
4. Fai clic su "Salva API Key". La chiave verrà salvata localmente nel browser (localStorage).

## Sincronizzazione con Google Sheets

Per esportare i dati degli allenamenti registrati su un Foglio Google in tempo reale:

1. Crea un nuovo Foglio Google.
2. Fai clic su "Estensioni" nel menu superiore e seleziona "Apps Script".
3. Incolla il seguente codice nell'editor di Apps Script, sostituendo qualsiasi codice preesistente:

```javascript
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Allenamenti") || ss.insertSheet("Allenamenti");
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Data", "Programma", "Settimana", "Seduta", "Esercizio", 
        "Categoria", "Target", "Set (Serie)", "Carico (kg)", 
        "Reps", "RPE", "Recupero", "Note Serie", "Ripetuto"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold");
    }
    
    var date = payload.date;
    var program = payload.program;
    var week = payload.week;
    var session = payload.session;
    var isRepeated = payload.isRepeated ? "Sì" : "No";
    var exercises = payload.performedExercises || [];
    
    for (var i = 0; i < exercises.length; i++) {
      var ex = exercises[i];
      var exName = ex.exerciseName;
      var category = ex.category;
      var target = ex.targetReference;
      var sets = ex.sets || [];
      
      for (var j = 0; j < sets.length; j++) {
        var set = sets[j];
        sheet.appendRow([
          date, program, week, session, exName, category, target,
          set.setNum || (j + 1),
          set.weight !== null ? set.weight : "",
          set.reps !== null ? set.reps : "",
          set.rpe || "",
          set.rest || "",
          set.notes || "",
          isRepeated
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Salva il progetto di script.
5. Clicca su "Nuova distribuzione" in alto a destra.
6. Seleziona il tipo "Applicazione web" (icona dell'ingranaggio) e configura:
   * **Esegui come**: Tu (tua email Google)
   * **Chi ha accesso**: Chiunque
7. Fai clic su "Distribuisci" ed esegui la procedura di autorizzazione di sicurezza del tuo account.
8. Copia l'URL dell'applicazione web generato (termina con `/exec`).
9. Apri l'app PowerTrack, vai nella scheda "SYNC & STORICO", incolla l'URL in "Google Sheets Sync Webhook" e premi "Salva Webhook URL".
