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

    if (action === "sync") {
      // ==========================================
      // 1. CATALOGO ESERCIZI (In-memory merge + batch update)
      // ==========================================
      var catMap = {};
      if (sheetCat.getLastRow() > 1) {
        var cRows = sheetCat.getRange(2, 1, sheetCat.getLastRow() - 1, 5).getValues();
        for (var i = 0; i < cRows.length; i++) {
          var cid = String(cRows[i][0]);
          if (cid) {
            catMap[cid] = {
              id: cid,
              name: String(cRows[i][1] || ""),
              category: String(cRows[i][2] || "accessory"),
              updatedAt: cRows[i][3] instanceof Date ? cRows[i][3].toISOString() : String(cRows[i][3] || ""),
              isDeleted: cRows[i][4] === "Sì"
            };
          }
        }
      }
      var clientExercises = payload.exercises || [];
      for (var i = 0; i < clientExercises.length; i++) {
        var cex = clientExercises[i];
        var cid = String(cex.id);
        var cup = cex.updatedAt ? new Date(cex.updatedAt).getTime() : new Date().getTime();
        var exUp = catMap[cid] && catMap[cid].updatedAt ? new Date(catMap[cid].updatedAt).getTime() : 0;
        if (!catMap[cid] || cup >= exUp) {
          catMap[cid] = {
            id: cid,
            name: cex.name || "",
            category: cex.category || "accessory",
            updatedAt: cex.updatedAt || serverTime,
            isDeleted: !!cex.isDeleted
          };
        }
      }
      sheetCat.clear();
      sheetCat.appendRow(["ID", "Nome", "Categoria", "DataAggiornamento", "Eliminato"]);
      sheetCat.getRange(1, 1, 1, 5).setFontWeight("bold");
      var catOutRows = [];
      var catList = Object.keys(catMap).map(function(k) { return catMap[k]; });
      for (var i = 0; i < catList.length; i++) {
        catOutRows.push([
          catList[i].id, catList[i].name, catList[i].category, catList[i].updatedAt, catList[i].isDeleted ? "Sì" : "No"
        ]);
      }
      if (catOutRows.length > 0) {
        sheetCat.getRange(2, 1, catOutRows.length, 5).setValues(catOutRows);
      }

      // ==========================================
      // 2. SCHEDE (TEMPLATES) (In-memory merge + batch update)
      // ==========================================
      var tplMap = {};
      if (sheetSch.getLastRow() > 1) {
        var sRows = sheetSch.getRange(2, 1, sheetSch.getLastRow() - 1, 11).getValues();
        for (var i = 0; i < sRows.length; i++) {
          var tid = String(sRows[i][0]);
          if (tid) {
            if (!tplMap[tid]) {
              tplMap[tid] = {
                id: tid,
                program: Number(sRows[i][1]),
                week: Number(sRows[i][2]),
                session: String(sRows[i][3]),
                exercises: [],
                updatedAt: sRows[i][9] instanceof Date ? sRows[i][9].toISOString() : String(sRows[i][9] || ""),
                isDeleted: sRows[i][10] === "Sì"
              };
            }
            if (sRows[i][4]) {
              tplMap[tid].exercises.push({
                exerciseName: String(sRows[i][4]),
                category: String(sRows[i][5] || ""),
                target: String(sRows[i][6] || ""),
                rest: String(sRows[i][7] || ""),
                notes: String(sRows[i][8] || "")
              });
            }
          }
        }
      }
      var clientTemplates = payload.templates || [];
      for (var i = 0; i < clientTemplates.length; i++) {
        var ct = clientTemplates[i];
        var tid = String(ct.id || ("p" + ct.program + "_w" + ct.week + "_s" + ct.session));
        var cup = ct.updatedAt ? new Date(ct.updatedAt).getTime() : new Date().getTime();
        var exUp = tplMap[tid] && tplMap[tid].updatedAt ? new Date(tplMap[tid].updatedAt).getTime() : 0;
        if (!tplMap[tid] || cup >= exUp) {
          tplMap[tid] = {
            id: tid,
            program: Number(ct.program),
            week: Number(ct.week),
            session: String(ct.session),
            exercises: ct.exercises || [],
            updatedAt: ct.updatedAt || serverTime,
            isDeleted: !!ct.isDeleted
          };
        }
      }
      sheetSch.clear();
      sheetSch.appendRow(["ID_Scheda", "Programma", "Settimana", "Seduta", "Esercizio", "Categoria", "Target", "Recupero", "Note", "DataAggiornamento", "Eliminato"]);
      sheetSch.getRange(1, 1, 1, 11).setFontWeight("bold");
      var tplOutRows = [];
      var tplList = Object.keys(tplMap).map(function(k) { return tplMap[k]; });
      for (var i = 0; i < tplList.length; i++) {
        var t = tplList[i];
        var isDel = t.isDeleted ? "Sì" : "No";
        if (!t.isDeleted && t.exercises && t.exercises.length > 0) {
          for (var j = 0; j < t.exercises.length; j++) {
            var ex = t.exercises[j];
            tplOutRows.push([
              t.id, t.program, t.week, t.session,
              ex.exerciseName || "", ex.category || "", ex.target || "", ex.rest || "", ex.notes || "",
              t.updatedAt, isDel
            ]);
          }
        } else {
          tplOutRows.push([
            t.id, t.program, t.week, t.session, "", "", "", "", "", t.updatedAt, isDel
          ]);
        }
      }
      if (tplOutRows.length > 0) {
        sheetSch.getRange(2, 1, tplOutRows.length, 11).setValues(tplOutRows);
      }

      // ==========================================
      // 3. ALLENAMENTI (WORKOUT LOGS) (In-memory merge + batch update)
      // ==========================================
      var logMap = {};
      if (sheetAll.getLastRow() > 1) {
        var aRows = sheetAll.getRange(2, 1, sheetAll.getLastRow() - 1, 17).getValues();
        for (var i = 0; i < aRows.length; i++) {
          var lid = String(aRows[i][0]);
          if (lid) {
            var date = aRows[i][1] instanceof Date ? Utilities.formatDate(aRows[i][1], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(aRows[i][1] || "");
            var prog = Number(aRows[i][2]);
            var week = Number(aRows[i][3]);
            var sess = String(aRows[i][4]);
            var isRep = aRows[i][5] === "Sì";
            var exName = String(aRows[i][6] || "");
            var exCat = String(aRows[i][7] || "");
            var exTarg = String(aRows[i][8] || "");
            var setNum = Number(aRows[i][9] || 1);
            var weight = aRows[i][10] !== "" ? Number(aRows[i][10]) : null;
            var reps = aRows[i][11] !== "" ? Number(aRows[i][11]) : null;
            var rpe = String(aRows[i][12] || "");
            var rest = String(aRows[i][13] || "");
            var notes = String(aRows[i][14] || "");
            var upTime = aRows[i][15] instanceof Date ? aRows[i][15].toISOString() : String(aRows[i][15] || "");
            var isDel = aRows[i][16] === "Sì";

            if (!logMap[lid]) {
              logMap[lid] = {
                id: lid,
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
              var exObj = null;
              for (var k = 0; k < logMap[lid].performedExercises.length; k++) {
                if (logMap[lid].performedExercises[k].exerciseName === exName) {
                  exObj = logMap[lid].performedExercises[k];
                  break;
                }
              }
              if (!exObj) {
                exObj = { exerciseName: exName, category: exCat, targetReference: exTarg, sets: [] };
                logMap[lid].performedExercises.push(exObj);
              }
              exObj.sets.push({ setNum: setNum, weight: weight, reps: reps, rpe: rpe, rest: rest, notes: notes });
            }
          }
        }
      }
      var clientLogs = payload.workoutLogs || [];
      for (var i = 0; i < clientLogs.length; i++) {
        var clog = clientLogs[i];
        var lid = String(clog.id);
        var cup = clog.updatedAt ? new Date(clog.updatedAt).getTime() : new Date().getTime();
        var exUp = logMap[lid] && logMap[lid].updatedAt ? new Date(logMap[lid].updatedAt).getTime() : 0;
        if (!logMap[lid] || cup >= exUp) {
          logMap[lid] = {
            id: lid,
            date: clog.date || "",
            program: Number(clog.program),
            week: Number(clog.week),
            session: String(clog.session),
            isRepeated: !!clog.isRepeated,
            performedExercises: clog.performedExercises || [],
            updatedAt: clog.updatedAt || serverTime,
            isDeleted: !!clog.isDeleted,
            synced: true
          };
        }
      }
      sheetAll.clear();
      sheetAll.appendRow(["ID_Allenamento", "Data", "Programma", "Settimana", "Seduta", "Ripetuto", "Esercizio", "Categoria", "Target", "Set", "Peso", "Reps", "RPE", "Recupero", "Note", "DataAggiornamento", "Eliminato"]);
      sheetAll.getRange(1, 1, 1, 17).setFontWeight("bold");
      var logOutRows = [];
      var logList = Object.keys(logMap).map(function(k) {
        var l = logMap[k];
        if (l.performedExercises) {
          l.performedExercises.forEach(function(ex) { ex.sets.sort(function(a, b) { return a.setNum - b.setNum; }); });
        }
        return l;
      });
      for (var i = 0; i < logList.length; i++) {
        var l = logList[i];
        var isDel = l.isDeleted ? "Sì" : "No";
        var isRep = l.isRepeated ? "Sì" : "No";
        var pExs = l.performedExercises || [];
        if (!l.isDeleted && pExs.length > 0) {
          for (var j = 0; j < pExs.length; j++) {
            var ex = pExs[j];
            var sets = ex.sets || [];
            for (var s = 0; s < sets.length; s++) {
              var set = sets[s];
              logOutRows.push([
                l.id, l.date, l.program, l.week, l.session, isRep,
                ex.exerciseName || "", ex.category || "", ex.targetReference || "",
                set.setNum || (s + 1), set.weight !== null ? set.weight : "", set.reps !== null ? set.reps : "",
                set.rpe || "", set.rest || "", set.notes || "",
                l.updatedAt, isDel
              ]);
            }
          }
        } else {
          logOutRows.push([
            l.id, l.date, l.program, l.week, l.session, isRep,
            "", "", "", "", "", "", "", "", "",
            l.updatedAt, isDel
          ]);
        }
      }
      if (logOutRows.length > 0) {
        sheetAll.getRange(2, 1, logOutRows.length, 17).setValues(logOutRows);
      }

      // ==========================================
      // 4. IMPOSTAZIONI
      // ==========================================
      var finalSettings = { bodyWeight: "" };
      if (payload.userSettings && payload.userSettings.bodyWeight !== undefined) {
        finalSettings.bodyWeight = payload.userSettings.bodyWeight;
        sheetSet.clear();
        sheetSet.appendRow(["Chiave", "Valore", "DataAggiornamento"]);
        sheetSet.getRange(1, 1, 1, 3).setFontWeight("bold");
        sheetSet.appendRow(["bodyWeight", payload.userSettings.bodyWeight || "", serverTime]);
      } else if (sheetSet.getLastRow() > 1) {
        var setRows = sheetSet.getRange(2, 1, sheetSet.getLastRow() - 1, 3).getValues();
        for (var i = 0; i < setRows.length; i++) {
          if (setRows[i][0] === "bodyWeight") finalSettings.bodyWeight = setRows[i][1];
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        serverTime: serverTime,
        data: {
          exercises: catList,
          templates: tplList,
          workoutLogs: logList,
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

