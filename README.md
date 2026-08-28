# PowerTrack - Powerlifting PWA Tracker

PowerTrack è un'applicazione web leggera (Single Page Application) progettata per tracciare e pianificare gli allenamenti di Powerlifting direttamente dal browser. È ottimizzata per l'uso da dispositivi mobili ed è predisposta per il funzionamento offline.

## Funzionalità Principali

* **Gestione Schede Target**: Definizione della progressione settimanale dei carichi e del recupero per ciascun esercizio.
* **Tracciamento Allenamenti in Tempo Reale**: Registrazione manuale di carichi effettivi, ripetizioni eseguite, tempi di recupero e annotazioni tecniche per ogni serie.
* **Valutazione Soggettiva RPE/RIR**: Possibilità di annotare manualmente l'indice di sforzo percepito (RPE) o le ripetizioni in riserva (RIR) per ciascun set.
* **Persistenza Locale**: I dati vengono salvati localmente sul dispositivo tramite IndexedDB (Dexie.js), garantendo il funzionamento anche in assenza di rete.
* **Importazione Intelligente con Intelligenza Artificiale**: Riconoscimento ed estrazione automatica di esercizi e carichi a partire da screenshot o appunti.
* **Sincronizzazione Cloud Bidirezionale**: Esportazione ed importazione completa di tutti i dati (esercizi, programmi, storico allenamenti e peso corporeo) su un foglio di calcolo Google Sheets per sincronizzare più dispositivi.

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
* **iOS (Safari)**: Tocca l'icona di condivisione (quadrato con freccia verso l'alto) e seleziona "Aggiungi alla schermata Home". Assicurati che l'opzione "Apri come app web" sia spuntata.
* **Android (Chrome)**: Tocca l'icona dei tre puntini in alto a destra e seleziona "Aggiungi a schermata Home" o "Installa app".

## Configurazione Funzioni AI (Google Gemini)

L'importazione tramite immagine e appunti si appoggia al modello Gemini 3.6 Flash. Per abilitare la funzionalità:

1. Accedi a [Google AI Studio](https://aistudio.google.com/).
2. Genera una chiave API personale (API Key) gratuita.
3. Apri l'applicazione, accedi alla scheda "SYNC & STORICO" ed inserisci la chiave nel campo "API Key per funzionalità AI".
4. Fai clic su "Salva API Key". La chiave verrà salvata localmente nel browser (localStorage).

## Sincronizzazione con Google Sheets (Database Centralizzato)

Per salvare e sincronizzare tutti i dati (schede target, catalogo esercizi, storico allenamenti e peso corporeo) su Google Sheets:

1. Crea un nuovo Foglio Google.
2. Fai clic su "Estensioni" nel menu superiore e seleziona "Apps Script".
3. Incolla il seguente codice nell'editor di Apps Script, sostituendo qualsiasi codice preesistente:

```javascript
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "upload") {
      // 1. Scrivi Catalogo Esercizi
      var sheetCat = ss.getSheetByName("Catalogo") || ss.insertSheet("Catalogo");
      sheetCat.clear();
      sheetCat.appendRow(["ID", "Nome", "Categoria"]);
      sheetCat.getRange(1, 1, 1, 3).setFontWeight("bold");
      var exercises = payload.exercises || [];
      for (var i = 0; i < exercises.length; i++) {
        sheetCat.appendRow([exercises[i].id || "", exercises[i].name || "", exercises[i].category || ""]);
      }
      
      // 2. Scrivi Schede Target (Templates)
      var sheetSch = ss.getSheetByName("Schede") || ss.insertSheet("Schede");
      sheetSch.clear();
      sheetSch.appendRow(["Programma", "Settimana", "Seduta", "Esercizio", "Categoria", "Target", "Recupero", "Note"]);
      sheetSch.getRange(1, 1, 1, 8).setFontWeight("bold");
      var templates = payload.templates || [];
      for (var i = 0; i < templates.length; i++) {
        var t = templates[i];
        var tExs = t.exercises || [];
        for (var j = 0; j < tExs.length; j++) {
          sheetSch.appendRow([
            t.program,
            t.week,
            t.session,
            tExs[j].exerciseName || "",
            tExs[j].category || "",
            tExs[j].target || "",
            tExs[j].rest || "",
            tExs[j].notes || ""
          ]);
        }
      }
      
      // 3. Scrivi Allenamenti Eseguiti (Logs)
      var sheetAll = ss.getSheetByName("Allenamenti") || ss.insertSheet("Allenamenti");
      sheetAll.clear();
      sheetAll.appendRow([
        "ID_Allenamento", "Data", "Programma", "Settimana", "Seduta", "Ripetuto",
        "Esercizio", "Categoria", "Target", "Set", "Peso", "Reps", "RPE", "Recupero", "Note"
      ]);
      sheetAll.getRange(1, 1, 1, 15).setFontWeight("bold");
      var logs = payload.workoutLogs || [];
      for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        var pExs = log.performedExercises || [];
        var isRep = log.isRepeated ? "Sì" : "No";
        for (var j = 0; j < pExs.length; j++) {
          var ex = pExs[j];
          var sets = ex.sets || [];
          for (var k = 0; k < sets.length; k++) {
            var set = sets[k];
            sheetAll.appendRow([
              log.id || "",
              log.date || "",
              log.program || "",
              log.week || "",
              log.session || "",
              isRep,
              ex.exerciseName || "",
              ex.category || "",
              ex.targetReference || "",
              set.setNum || (k + 1),
              set.weight !== null ? set.weight : "",
              set.reps !== null ? set.reps : "",
              set.rpe || "",
              set.rest || "",
              set.notes || ""
            ]);
          }
        }
      }
      
      // 4. Scrivi Impostazioni (Peso corporeo)
      var sheetSet = ss.getSheetByName("Impostazioni") || ss.insertSheet("Impostazioni");
      sheetSet.clear();
      sheetSet.appendRow(["Chiave", "Valore"]);
      sheetSet.getRange(1, 1, 1, 2).setFontWeight("bold");
      if (payload.userSettings) {
        sheetSet.appendRow(["bodyWeight", payload.userSettings.bodyWeight || ""]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Database caricato con successo!" }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === "download") {
      // 1. Leggi Catalogo Esercizi
      var sheetCat = ss.getSheetByName("Catalogo");
      var exercises = [];
      if (sheetCat && sheetCat.getLastRow() > 1) {
        var rows = sheetCat.getRange(2, 1, sheetCat.getLastRow() - 1, 3).getValues();
        for (var i = 0; i < rows.length; i++) {
          exercises.push({
            id: rows[i][0] ? Number(rows[i][0]) : null,
            name: rows[i][1],
            category: rows[i][2]
          });
        }
      }
      
      // 2. Leggi Schede (Templates)
      var sheetSch = ss.getSheetByName("Schede");
      var templatesMap = {};
      if (sheetSch && sheetSch.getLastRow() > 1) {
        var rows = sheetSch.getRange(2, 1, sheetSch.getLastRow() - 1, 8).getValues();
        for (var i = 0; i < rows.length; i++) {
          var prog = Number(rows[i][0]);
          var week = Number(rows[i][1]);
          var sess = rows[i][2];
          var key = prog + "_" + week + "_" + sess;
          if (!templatesMap[key]) {
            templatesMap[key] = {
              program: prog,
              week: week,
              session: sess,
              exercises: []
            };
          }
          templatesMap[key].exercises.push({
            exerciseName: rows[i][3],
            category: rows[i][4],
            target: rows[i][5],
            rest: rows[i][6],
            notes: rows[i][7]
          });
        }
      }
      var templates = Object.keys(templatesMap).map(function(k) { return templatesMap[k]; });
      
      // 3. Leggi Allenamenti (Workout Logs)
      var sheetAll = ss.getSheetByName("Allenamenti");
      var logsMap = {};
      if (sheetAll && sheetAll.getLastRow() > 1) {
        var rows = sheetAll.getRange(2, 1, sheetAll.getLastRow() - 1, 15).getValues();
        for (var i = 0; i < rows.length; i++) {
          var logId = rows[i][0] ? Number(rows[i][0]) : null;
          var date = rows[i][1] instanceof Date ? Utilities.formatDate(rows[i][1], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(rows[i][1]);
          var prog = Number(rows[i][2]);
          var week = Number(rows[i][3]);
          var sess = rows[i][4];
          var isRep = rows[i][5] === "Sì";
          var exName = rows[i][6];
          var exCat = rows[i][7];
          var exTarg = rows[i][8];
          var setNum = Number(rows[i][9]);
          var weight = rows[i][10] !== "" ? Number(rows[i][10]) : null;
          var reps = rows[i][11] !== "" ? Number(rows[i][11]) : null;
          var rpe = String(rows[i][12]);
          var rest = String(rows[i][13]);
          var notes = String(rows[i][14]);
          
          var key = logId || (date + "_" + prog + "_" + week + "_" + sess);
          if (!logsMap[key]) {
            logsMap[key] = {
              id: logId,
              date: date,
              program: prog,
              week: week,
              session: sess,
              isRepeated: isRep,
              performedExercises: [],
              synced: true
            };
          }
          
          var ex = null;
          for (var j = 0; j < logsMap[key].performedExercises.length; j++) {
            if (logsMap[key].performedExercises[j].exerciseName === exName) {
              ex = logsMap[key].performedExercises[j];
              break;
            }
          }
          if (!ex) {
            ex = {
              exerciseName: exName,
              category: exCat,
              targetReference: exTarg,
              sets: []
            };
            logsMap[key].performedExercises.push(ex);
          }
          
          ex.sets.push({
            setNum: setNum,
            weight: weight,
            reps: reps,
            rpe: rpe,
            rest: rest,
            notes: notes
          });
        }
      }
      
      var logs = Object.keys(logsMap).map(function(k) {
        var log = logsMap[k];
        log.performedExercises.forEach(function(ex) {
          ex.sets.sort(function(a, b) { return a.setNum - b.setNum; });
        });
        return log;
      });
      
      // 4. Leggi Impostazioni
      var sheetSet = ss.getSheetByName("Impostazioni");
      var userSettings = { bodyWeight: "" };
      if (sheetSet && sheetSet.getLastRow() > 1) {
        var rows = sheetSet.getRange(2, 1, sheetSet.getLastRow() - 1, 2).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (rows[i][0] === "bodyWeight") {
            userSettings.bodyWeight = rows[i][1];
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: {
          exercises: exercises,
          templates: templates,
          workoutLogs: logs,
          userSettings: userSettings
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Azione sconosciuta" }))
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
9. Apri l'app PowerTrack, vai nella scheda "SYNC & STORICO", incolla l'URL in "Google Sheets Sync Webhook" e primi "Salva Webhook URL".

### Istruzioni per la sincronizzazione tra dispositivi
* **Per salvare i dati nel cloud**: Clicca su **"Invia al Cloud"** (caricherà le tue schede correnti, lo storico degli allenamenti, l'elenco degli esercizi e il peso corporeo su Google Sheets).
* **Per caricare i dati su un nuovo dispositivo**: Clicca su **"Scarica dal Cloud"** (scaricherà tutto l'archivio da Google Sheets sul database locale del dispositivo corrente, sovrascrivendo i dati locali esistenti).
