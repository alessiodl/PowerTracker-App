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

## Sincronizzazione con Google Sheets (2-Way Sync & Unica Fonte di Verità)

L'applicazione utilizza un'architettura **Offline-First bidirezionale**:
* I dati vengono salvati istantaneamente in locale su IndexedDB con identificativi globali unici (UUID) e timestamp di modifica (`updatedAt`).
* La sincronizzazione a 2 vie avviene **automaticamente** all'avvio dell'app, al ritorno della connessione internet o dopo ogni salvataggio.
* Un **unico pulsante "Sincronizza Ora"** permette di sincronizzare manualmente in qualsiasi momento senza rischio di sovrascritture o perdite di dati (risoluzione dei conflitti automatica con logica *Last-Write-Wins*).

### Configurazione di Google Apps Script

1. Crea un nuovo Foglio Google.
2. Fai clic su "Estensioni" nel menu superiore e seleziona "Apps Script".
3. Incolla il seguente codice nell'editor di Apps Script, sostituendo qualsiasi codice preesistente:

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Lock per prevenire scritture concorrenti contemporanee
    lock.waitLock(15000);
    
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || "sync";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var serverTime = new Date().toISOString();

    // Inizializzazione fogli se non esistono
    var sheetCat = ss.getSheetByName("Catalogo") || ss.insertSheet("Catalogo");
    var sheetSch = ss.getSheetByName("Schede") || ss.insertSheet("Schede");
    var sheetAll = ss.getSheetByName("Allenamenti") || ss.insertSheet("Allenamenti");
    var sheetSet = ss.getSheetByName("Impostazioni") || ss.insertSheet("Impostazioni");

    if (sheetCat.getLastRow() === 0) {
      sheetCat.appendRow(["ID", "Nome", "Categoria", "DataAggiornamento", "Eliminato"]);
      sheetCat.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    if (sheetSch.getLastRow() === 0) {
      sheetSch.appendRow(["ID_Scheda", "Programma", "Settimana", "Seduta", "Esercizio", "Categoria", "Target", "Recupero", "Note", "DataAggiornamento", "Eliminato"]);
      sheetSch.getRange(1, 1, 1, 11).setFontWeight("bold");
    }
    if (sheetAll.getLastRow() === 0) {
      sheetAll.appendRow(["ID_Allenamento", "Data", "Programma", "Settimana", "Seduta", "Ripetuto", "Esercizio", "Categoria", "Target", "Set", "Peso", "Reps", "RPE", "Recupero", "Note", "DataAggiornamento", "Eliminato"]);
      sheetAll.getRange(1, 1, 1, 17).setFontWeight("bold");
    }
    if (sheetSet.getLastRow() === 0) {
      sheetSet.appendRow(["Chiave", "Valore", "DataAggiornamento"]);
      sheetSet.getRange(1, 1, 1, 3).setFontWeight("bold");
    }

    if (action === "sync") {
      var lastSyncTime = payload.lastSyncTimestamp ? new Date(payload.lastSyncTimestamp).getTime() : 0;

      // ==========================================
      // 1. PUSH & MERGE: CATALOGO ESERCIZI
      // ==========================================
      var clientExercises = payload.exercises || [];
      var catData = sheetCat.getLastRow() > 1 ? sheetCat.getRange(2, 1, sheetCat.getLastRow() - 1, 5).getValues() : [];
      var catRowMap = {};
      for (var i = 0; i < catData.length; i++) {
        var rowId = String(catData[i][0]);
        if (rowId) catRowMap[rowId] = { rowIndex: i + 2, data: catData[i] };
      }

      for (var j = 0; j < clientExercises.length; j++) {
        var ex = clientExercises[j];
        var exId = String(ex.id);
        var exUpdated = ex.updatedAt ? new Date(ex.updatedAt).getTime() : new Date().getTime();
        var exDeleted = ex.isDeleted ? "Sì" : "No";

        if (catRowMap[exId]) {
          var existingUpdated = catRowMap[exId].data[3] ? new Date(catRowMap[exId].data[3]).getTime() : 0;
          if (exUpdated >= existingUpdated) {
            sheetCat.getRange(catRowMap[exId].rowIndex, 1, 1, 5).setValues([[
              exId, ex.name || "", ex.category || "accessory", ex.updatedAt || serverTime, exDeleted
            ]]);
          }
        } else {
          sheetCat.appendRow([exId, ex.name || "", ex.category || "accessory", ex.updatedAt || serverTime, exDeleted]);
        }
      }

      // ==========================================
      // 2. PUSH & MERGE: SCHEDE TARGET (TEMPLATES)
      // ==========================================
      var clientTemplates = payload.templates || [];
      var schData = sheetSch.getLastRow() > 1 ? sheetSch.getRange(2, 1, sheetSch.getLastRow() - 1, 11).getValues() : [];
      var schIdRows = {}; // ID_Scheda -> [rowIndexes]
      for (var i = 0; i < schData.length; i++) {
        var tId = String(schData[i][0]);
        if (tId) {
          if (!schIdRows[tId]) schIdRows[tId] = [];
          schIdRows[tId].push({ rowIndex: i + 2, data: schData[i] });
        }
      }

      for (var j = 0; j < clientTemplates.length; j++) {
        var t = clientTemplates[j];
        var tId = String(t.id || ("p" + t.program + "_w" + t.week + "_s" + t.session));
        var tUpdated = t.updatedAt ? new Date(t.updatedAt).getTime() : new Date().getTime();
        var tDeleted = t.isDeleted ? "Sì" : "No";
        var tExs = t.exercises || [];

        // Rimuovi eventuali righe precedenti per questo ID_Scheda prima di riscriverle
        if (schIdRows[tId] && schIdRows[tId].length > 0) {
          var existingUpdated = schIdRows[tId][0].data[9] ? new Date(schIdRows[tId][0].data[9]).getTime() : 0;
          if (tUpdated >= existingUpdated) {
            // Elimina righe dal basso verso l'alto
            var indicesToDelete = schIdRows[tId].map(function(r) { return r.rowIndex; }).sort(function(a,b){ return b - a; });
            for (var k = 0; k < indicesToDelete.length; k++) {
              sheetSch.deleteRow(indicesToDelete[k]);
            }
            // Scrivi le nuove righe
            if (!t.isDeleted && tExs.length > 0) {
              for (var k = 0; k < tExs.length; k++) {
                sheetSch.appendRow([
                  tId, t.program, t.week, t.session,
                  tExs[k].exerciseName || "", tExs[k].category || "", tExs[k].target || "", tExs[k].rest || "", tExs[k].notes || "",
                  t.updatedAt || serverTime, tDeleted
                ]);
              }
            } else if (t.isDeleted) {
              sheetSch.appendRow([tId, t.program, t.week, t.session, "", "", "", "", "", t.updatedAt || serverTime, "Sì"]);
            }
          }
        } else {
          if (!t.isDeleted && tExs.length > 0) {
            for (var k = 0; k < tExs.length; k++) {
              sheetSch.appendRow([
                tId, t.program, t.week, t.session,
                tExs[k].exerciseName || "", tExs[k].category || "", tExs[k].target || "", tExs[k].rest || "", tExs[k].notes || "",
                t.updatedAt || serverTime, tDeleted
              ]);
            }
          } else if (t.isDeleted) {
            sheetSch.appendRow([tId, t.program, t.week, t.session, "", "", "", "", "", t.updatedAt || serverTime, "Sì"]);
          }
        }
      }

      // ==========================================
      // 3. PUSH & MERGE: ALLENAMENTI (WORKOUT LOGS)
      // ==========================================
      var clientLogs = payload.workoutLogs || [];
      var allData = sheetAll.getLastRow() > 1 ? sheetAll.getRange(2, 1, sheetAll.getLastRow() - 1, 17).getValues() : [];
      var allIdRows = {}; // ID_Allenamento -> [rowIndexes]
      for (var i = 0; i < allData.length; i++) {
        var lId = String(allData[i][0]);
        if (lId) {
          if (!allIdRows[lId]) allIdRows[lId] = [];
          allIdRows[lId].push({ rowIndex: i + 2, data: allData[i] });
        }
      }

      for (var j = 0; j < clientLogs.length; j++) {
        var log = clientLogs[j];
        var logId = String(log.id);
        var logUpdated = log.updatedAt ? new Date(log.updatedAt).getTime() : new Date().getTime();
        var logDeleted = log.isDeleted ? "Sì" : "No";
        var isRep = log.isRepeated ? "Sì" : "No";
        var pExs = log.performedExercises || [];

        if (allIdRows[logId] && allIdRows[logId].length > 0) {
          var existingUpdated = allIdRows[logId][0].data[15] ? new Date(allIdRows[logId][0].data[15]).getTime() : 0;
          if (logUpdated >= existingUpdated) {
            var indicesToDelete = allIdRows[logId].map(function(r) { return r.rowIndex; }).sort(function(a,b){ return b - a; });
            for (var k = 0; k < indicesToDelete.length; k++) {
              sheetAll.deleteRow(indicesToDelete[k]);
            }
            if (!log.isDeleted && pExs.length > 0) {
              for (var k = 0; k < pExs.length; k++) {
                var ex = pExs[k];
                var sets = ex.sets || [];
                for (var s = 0; s < sets.length; s++) {
                  var set = sets[s];
                  sheetAll.appendRow([
                    logId, log.date || "", log.program || "", log.week || "", log.session || "", isRep,
                    ex.exerciseName || "", ex.category || "", ex.targetReference || "",
                    set.setNum || (s + 1), set.weight !== null ? set.weight : "", set.reps !== null ? set.reps : "",
                    set.rpe || "", set.rest || "", set.notes || "",
                    log.updatedAt || serverTime, logDeleted
                  ]);
                }
              }
            } else if (log.isDeleted) {
              sheetAll.appendRow([logId, log.date || "", log.program || "", log.week || "", log.session || "", isRep, "", "", "", "", "", "", "", "", "", log.updatedAt || serverTime, "Sì"]);
            }
          }
        } else {
          if (!log.isDeleted && pExs.length > 0) {
            for (var k = 0; k < pExs.length; k++) {
              var ex = pExs[k];
              var sets = ex.sets || [];
              for (var s = 0; s < sets.length; s++) {
                var set = sets[s];
                sheetAll.appendRow([
                  logId, log.date || "", log.program || "", log.week || "", log.session || "", isRep,
                  ex.exerciseName || "", ex.category || "", ex.targetReference || "",
                  set.setNum || (s + 1), set.weight !== null ? set.weight : "", set.reps !== null ? set.reps : "",
                  set.rpe || "", set.rest || "", set.notes || "",
                  log.updatedAt || serverTime, logDeleted
                ]);
              }
            }
          } else if (log.isDeleted) {
            sheetAll.appendRow([logId, log.date || "", log.program || "", log.week || "", log.session || "", isRep, "", "", "", "", "", "", "", "", "", log.updatedAt || serverTime, "Sì"]);
          }
        }
      }

      // ==========================================
      // 4. PUSH & MERGE: IMPOSTAZIONI
      // ==========================================
      if (payload.userSettings) {
        var setData = sheetSet.getLastRow() > 1 ? sheetSet.getRange(2, 1, sheetSet.getLastRow() - 1, 3).getValues() : [];
        var bwFound = false;
        for (var i = 0; i < setData.length; i++) {
          if (setData[i][0] === "bodyWeight") {
            bwFound = true;
            sheetSet.getRange(i + 2, 2, 1, 2).setValues([[payload.userSettings.bodyWeight || "", serverTime]]);
            break;
          }
        }
        if (!bwFound && payload.userSettings.bodyWeight !== undefined) {
          sheetSet.appendRow(["bodyWeight", payload.userSettings.bodyWeight || "", serverTime]);
        }
      }

      // ==========================================
      // 5. PULL: LETTURA STATO AGGIORNATO (TUTTO O DELTA)
      // ==========================================
      var finalExercises = [];
      if (sheetCat.getLastRow() > 1) {
        var rows = sheetCat.getRange(2, 1, sheetCat.getLastRow() - 1, 5).getValues();
        for (var i = 0; i < rows.length; i++) {
          finalExercises.push({
            id: String(rows[i][0]),
            name: String(rows[i][1] || ""),
            category: String(rows[i][2] || "accessory"),
            updatedAt: rows[i][3] instanceof Date ? rows[i][3].toISOString() : String(rows[i][3] || ""),
            isDeleted: rows[i][4] === "Sì"
          });
        }
      }

      var finalTemplatesMap = {};
      if (sheetSch.getLastRow() > 1) {
        var rows = sheetSch.getRange(2, 1, sheetSch.getLastRow() - 1, 11).getValues();
        for (var i = 0; i < rows.length; i++) {
          var tId = String(rows[i][0]);
          var prog = Number(rows[i][1]);
          var week = Number(rows[i][2]);
          var sess = String(rows[i][3]);
          var upTime = rows[i][9] instanceof Date ? rows[i][9].toISOString() : String(rows[i][9] || "");
          var isDel = rows[i][10] === "Sì";

          if (!finalTemplatesMap[tId]) {
            finalTemplatesMap[tId] = {
              id: tId,
              program: prog,
              week: week,
              session: sess,
              exercises: [],
              updatedAt: upTime,
              isDeleted: isDel
            };
          }
          if (rows[i][4]) {
            finalTemplatesMap[tId].exercises.push({
              exerciseName: String(rows[i][4]),
              category: String(rows[i][5] || ""),
              target: String(rows[i][6] || ""),
              rest: String(rows[i][7] || ""),
              notes: String(rows[i][8] || "")
            });
          }
        }
      }
      var finalTemplates = Object.keys(finalTemplatesMap).map(function(k) { return finalTemplatesMap[k]; });

      var finalLogsMap = {};
      if (sheetAll.getLastRow() > 1) {
        var rows = sheetAll.getRange(2, 1, sheetAll.getLastRow() - 1, 17).getValues();
        for (var i = 0; i < rows.length; i++) {
          var logId = String(rows[i][0]);
          var date = rows[i][1] instanceof Date ? Utilities.formatDate(rows[i][1], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(rows[i][1]);
          var prog = Number(rows[i][2]);
          var week = Number(rows[i][3]);
          var sess = String(rows[i][4]);
          var isRep = rows[i][5] === "Sì";
          var exName = String(rows[i][6] || "");
          var exCat = String(rows[i][7] || "");
          var exTarg = String(rows[i][8] || "");
          var setNum = Number(rows[i][9] || 1);
          var weight = rows[i][10] !== "" ? Number(rows[i][10]) : null;
          var reps = rows[i][11] !== "" ? Number(rows[i][11]) : null;
          var rpe = String(rows[i][12] || "");
          var rest = String(rows[i][13] || "");
          var notes = String(rows[i][14] || "");
          var upTime = rows[i][15] instanceof Date ? rows[i][15].toISOString() : String(rows[i][15] || "");
          var isDel = rows[i][16] === "Sì";

          if (!finalLogsMap[logId]) {
            finalLogsMap[logId] = {
              id: logId,
              date: date,
              program: prog,
              week: week,
              session: sess,
              isRepeated: isRep,
              performedExercises: [],
              updatedAt: upTime,
              isDeleted: isDel,
              synced: true
            };
          }

          if (exName) {
            var ex = null;
            for (var j = 0; j < finalLogsMap[logId].performedExercises.length; j++) {
              if (finalLogsMap[logId].performedExercises[j].exerciseName === exName) {
                ex = finalLogsMap[logId].performedExercises[j];
                break;
              }
            }
            if (!ex) {
              ex = { exerciseName: exName, category: exCat, targetReference: exTarg, sets: [] };
              finalLogsMap[logId].performedExercises.push(ex);
            }
            ex.sets.push({ setNum: setNum, weight: weight, reps: reps, rpe: rpe, rest: rest, notes: notes });
          }
        }
      }
      var finalLogs = Object.keys(finalLogsMap).map(function(k) {
        var log = finalLogsMap[k];
        log.performedExercises.forEach(function(ex) { ex.sets.sort(function(a, b) { return a.setNum - b.setNum; }); });
        return log;
      });

      var finalSettings = { bodyWeight: "" };
      if (sheetSet.getLastRow() > 1) {
        var rows = sheetSet.getRange(2, 1, sheetSet.getLastRow() - 1, 3).getValues();
        for (var i = 0; i < rows.length; i++) {
          if (rows[i][0] === "bodyWeight") finalSettings.bodyWeight = rows[i][1];
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        serverTime: serverTime,
        data: {
          exercises: finalExercises,
          templates: finalTemplates,
          workoutLogs: finalLogs,
          userSettings: finalSettings
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Azione sconosciuta" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

4. Salva il progetto di script.
5. Fai clic su **"Esegui distribuzione"** > **"Gestisci distribuzioni"** > Modifica la versione corrente selezionando **"Nuova versione"** e premi **"Distribuisci"** (oppure crea una Nuova distribuzione se è la prima volta).
6. Copia l'URL dell'applicazione web (termina con `/exec`).
7. Apri l'app PowerTrack, vai nella scheda "SYNC & STORICO", incolla l'URL in "Google Sheets Sync Webhook" e premi "Salva Webhook URL".

