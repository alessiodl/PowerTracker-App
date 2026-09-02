# PowerTrack - Powerlifting PWA Tracker

PowerTrack è una Progressive Web App (PWA) avanzata e ultra-leggera progettata per la pianificazione, la registrazione e l'analisi degli allenamenti di Powerlifting. È concepita con un'architettura **Offline-First**, permettendo un utilizzo fluido in palestra anche in totale assenza di connessione internet, con sincronizzazione a due vie su **Google Sheets** e importazione schede tramite **Intelligenza Artificiale (Google Gemini)**.

---

## 📑 INDICE DEL MANUALE

1. [Architettura e Installazione](#1-architettura-e-installazione)
2. [Guida all'Uso delle Funzionalità (Le 6 Schede)](#2-guida-alluso-delle-funzionalità-le-6-schede)
   * [Tab 1: SCHEDA (Pianificazione Target)](#tab-1-scheda-pianificazione-target)
   * [Tab 2: ALLENAMENTO (Sessione Live)](#tab-2-allenamento-sessione-live)
   * [Tab 3: CATALOGO (Esercizi e Categorie)](#tab-3-catalogo-esercizi-e-categorie)
   * [Tab 4: STORICO (Analisi Sedute e Progressioni)](#tab-4-storico-analisi-sedute-e-progressioni)
   * [Tab 5: SYNC & CONFIG (Sincronizzazione e Reset)](#tab-5-sync--config-sincronizzazione-e-reset)
   * [Tab 6: LIVELLI (Standard di Forza e BW)](#tab-6-livelli-standard-di-forza-e-bw)
3. [Manuale di Sincronizzazione e Multi-Dispositivo](#3-manuale-di-sincronizzazione-e-multi-dispositivo)
   * [Come funziona la sincronizzazione a 2 vie](#come-funziona-la-sincronizzazione-a-2-vie)
   * [Gestione di più dispositivi (Telefono palestra offline + PC + Telefono principale)](#gestione-di-più-dispositivi)
   * [I fogli generati su Google Sheets (`Allenamenti`, `Schede`, `Catalogo`, `Analisi`)](#i-fogli-generati-su-google-sheets)
   * [Procedura di Reset e Pulizia Totale dello Sheet](#procedura-di-reset-e-pulizia-totale-dello-sheet)
4. [Setup Tecnico: Google Apps Script Webhook](#4-setup-tecnico-google-apps-script-webhook)
5. [Setup Funzionalità IA (Google Gemini)](#5-setup-funzionalità-ia-google-gemini)

---

## 1. ARCHITETTURA E INSTALLAZIONE

### Caratteristiche Tecniche
* **Database Locale**: IndexedDB tramite Dexie.js (`PowerTrackDB_v2`). I dati risiedono sul dispositivo in modo permanente.
* **Frontend**: Vue 3 (Composition API CDN) + Tailwind CSS con icone responsive per Dark e Light Theme.
* **PWA & Service Worker**: Caching locale completo (`sw.js`) per esecuzione immediata offline.
* **Sicurezza UUID**: Ogni entità possiede un UUID v4 casuale univoco globale e timestamp di modifica (`updatedAt`) con risoluzione conflitti *Last-Write-Wins*.

### Come installare l'App sullo Smartphone
1. Carica la cartella del progetto su un hosting HTTPS gratuito (es. **GitHub Pages**, **Netlify** o **Vercel**).
2. Apri il link dal browser dello smartphone:
   * **iOS (Safari)**: Tocca l'icona di condivisione $\rightarrow$ seleziona **"Aggiungi alla schermata Home"**.
   * **Android (Chrome)**: Tocca i tre puntini $\rightarrow$ seleziona **"Installa app"** o **"Aggiungi a schermata Home"**.

---

## 2. GUIDA ALL'USO DELLE FUNZIONALITÀ (LE 6 SCHEDE)

### Tab 1: SCHEDA (Pianificazione Target)
Consente di pianificare la scheda di allenamento per il blocco attivo:
* **Selettore Sessione**: In alto seleziona **Programma** (1-6 con etichette personalizzate opzionali), **Settimana** (da 4 a 20) e **Seduta** (da A fino a F, configurabili a piacere).
* **Definizione Esercizi**: Inserisci gli esercizi dal menu a tendina o aggiungine di nuovi; imposta il target (es. `4x5 @70%` o `1x1 @8 + 3x4 @75%`), il recupero previsto e le note tecniche.
* **Importazione Scheda con IA**:
  * `Camera`: Scatta direttamente una foto della scheda cartacea con la fotocamera posteriore dello smartphone.
  * `Galleria`: Carica una foto o screenshot salvato nei file/galleria del dispositivo.
  * `Appunti`: Incolla direttamente il testo o l'immagine copiata negli appunti (supporta anche `Ctrl+V` da tastiera).
  * L'IA (Gemini Flash) estrarrà automaticamente esercizi, categorie, carichi target e note.
* **Riordino**: Usa le frecce `▲` / `▼` per organizzare la sequenza degli esercizi.
* **Pulsanti Azione**: **`SALVA SCHEDA`** (verde) per salvare in locale e **`SVUOTA`** (rosso tenue) per azzerare la pianificazione del giorno.

---

### Tab 2: ALLENAMENTO (Sessione Live)
La schermata principale utilizzata durante l'allenamento in palestra:
* **Caricamento Automatico**: Mostra gli esercizi previsti dalla Scheda Target per il giorno selezionato. Se vuoto, permette di ricaricarli con un tocco tramite `Ricarica Scheda`.
* **Data & Ripetizione**: Imposta la data dell'allenamento e contrassegna `Ripetuto` se esegui una seduta supplementare/recupero.
* **Registrazione Serie**:
  * **Carico (kg)** e **Ripetizioni (Reps)** effettivamente sollevate.
  * **RPE / RIR**: Inserisci lo sforzo percepito (es. `8`, `8.5`, `9`).
  * **Recupero Rapido**: Tasti rapidi (1m, 1.5m, 2m, 3m, 4m, 5m) per inserire al volo il tempo di recupero desiderato.
  * **Note per Set**: Icona dedicata per appunti tecnici su singole serie (es. *"cintura stretta"*, *"piede scivolato"*).
* **Pulsanti Azione**: **`CONCLUDI E SINCRONIZZA`** (verde) per registrare la seduta nello storico e avviare la sync, **`SVUOTA`** (rosso) per cancellare i dati della sessione in corso.

---

### Tab 3: CATALOGO (Esercizi e Categorie)
Il database centrale dei tuoi movimenti, raggruppati in 3 blocchi:
* **Blocco 1 - Fondamentale**: Squat, Panca, Stacco e varianti primarie.
* **Blocco 2 - Variante**: Varianti tecniche (Panca fermo 3s, Squat con pausa, Board press, ecc.).
* **Blocco 3 - Complementari**: Trazioni, Dip, Bicipiti, Tricipiti, Spalle, Core.
* **Funzionalità**:
  * **Controllo Anti-duplicati**: Impedisce l'inserimento di doppioni case-insensitive.
  * **Riordinamento**: Frecce `▲` / `▼` per ordinare gli esercizi per ciascuna categoria.
  * **Salvataggio**: Il tasto **`SALVA CATALOGO`** in fondo salva le modifiche in locale.

---

### Tab 4: STORICO (Analisi Sedute e Progressioni)
* **Ricerca e Storico per Esercizio**: Seleziona o cerca un esercizio (es. *"Squat"*) per vedere l'elenco cronologico di tutte le volte che è stato eseguito, con carichi, serie e note.
* **Elenco Sedute Registrate**:
  * Badge stato: **`✓`** (Sincronizzato sul Cloud) o **`LOCALE`** (in attesa di connessione).
  * `Carica`: Riapre la seduta nella tab Allenamento per eventuali modifiche/correzioni.
  * `Dati`: Ispezione del payload JSON puro inviato a Google Sheets, con tasto `Copia JSON`.
  * `Elimina` (rosso): Elimina la seduta dallo storico (con popup di conferma).

---

### Tab 5: SYNC & CONFIG (Sincronizzazione, Struttura & Reset)
* **Stato Sincronizzazione**: Visualizza l'orario dell'ultima sync e il contatore delle modifiche in sospeso (*"X elementi in attesa"*).
* **Pulsante `SINCRONIZZA ORA`**: Esegue la sincronizzazione manuale a 2 vie istantanea con Google Sheets.
* **Struttura e Pianificazione (Sottomenu Collassabile)**:
  * Permette di personalizzare: **Giorni a settimana** (da 2 a 6, sedute A-F), **Settimane per ciclo** (da 4 a 20) e **Numero di Programmi** (da 1 a 6 con etichette opzionali, es. *Accumulo*, *Intensificazione*).
* **Configurazione e Chiavi (Sottomenu Collassabile)**:
  * Box chiuso di default per evitare tocchi accidentali.
  * **Modalità Sola Lettura**: Mostra i campi bloccati e mascherati (`••••••••`).
  * Tasto **`Modifica`** per sbloccare l'input e mostrare i pulsanti **`Salva`** e **`Annulla`**.
  * Gestisce: URL del Webhook Google Apps Script e API Key Google Gemini.
* **Zona di Pericolo - Reset Applicazione**:
  * Box in evidenza rossa con pulsante **`RESET`**.
  * Richiede conferma esplicita e azzera schede, allenamenti e storico in locale.

---

### Tab 6: LIVELLI (Calcolatore Percentuali e Standard di Forza)
* **Calcolatore Percentuale 1RM**: Inserisci il tuo massimale (1RM in kg) per calcolare all'istante la tabella dei carichi dal 60% al 95% con salti del 5%. Blocco collassabile e aperto di default (calcolo volatile in memoria).
* **Livelli di Performance**: Inserisci il tuo peso corporeo (**BW** in kg) per visualizzare la tabella dei livelli di riferimento (I Livello, II Livello, III Livello) per Squat, Panca, Stacco e movimenti correlati. Blocco collassabile e chiuso di default con salvataggio locale.
* **100% Locale**: I dati del calcolatore restano memorizzati sul dispositivo senza appesantire lo Sheet.

---

## 3. MANUALE DI SINCRONIZZAZIONE E MULTI-DISPOSITIVO

### Come funziona la sincronizzazione a 2 vie
1. Ogni modifica effettuata sul telefono (salvataggio scheda, fine allenamento, cancellazione) aggiorna il database locale e segna l'elemento come `_dirty: true`.
2. Quando l'app è online, premendo **`SINCRONIZZA ORA`** (o alla chiusura della seduta), l'app invia il delta a Google Apps Script.
3. Lo script su Google Sheets esegue il merge con risoluzione automatica dei timestamp (*Last-Write-Wins*) e restituisce lo stato aggiornato all'app.

---

### Gestione di più dispositivi
*(Scenario tipico: Telefono da palestra rugged spesso offline + Telefono principale connesso + PC/Web)*

* **Perché esiste la colonna `Eliminato = Sì` (Soft-Delete)**:  
  Se cancelli un allenamento dal PC, Google Sheets lo segna come `Eliminato = Sì`. Quando dopo qualche giorno accendi il telefono rugged in palestra e lo connetti al Wi-Fi, il telefono riceve l'informazione che quell'allenamento è stato eliminato e lo cancella dalla sua memoria locale.  
  *(Se il foglio eliminasse la riga all'istante, il telefono rugged non saprebbe della cancellazione e re-invierebbe il vecchio allenamento facendolo "risuscitare")*.

---

### I fogli generati su Google Sheets
Ad ogni sincronizzazione, Google Apps Script mantiene aggiornati i fogli di lavoro:

| Foglio | Scopo | Note di Utilizzo |
| :--- | :--- | :--- |
| **`Analisi`** | **Visualizzazione e Analisi al PC** | **100% Pulito.** Contiene solo le sedute e le serie attive, ordinate dalla più recente alla più vecchia. Zero righe cancellate, zero ID tecnici. Perfetto per tabelle pivot e grafici. |
| **`Allenamenti`** | Database tecnico sedute | Contiene lo storico grezzo completo con colonna `Eliminato` per la sync multi-dispositivo. |
| **`Schede`** | Database tecnico schede target | Contiene la pianificazione per programma/settimana/seduta. |
| **`Catalogo`** | Database esercizi | Contiene la lista ufficiale degli esercizi e delle categorie. |
| **`Configurazione`** | Parametri struttura & etichette | Sincronizza tra tutti i dispositivi il numero di programmi, settimane, giorni e i nomi personalizzati dei blocchi. |

---

### Procedura di Reset e Pulizia Totale dello Sheet
Quando desideri fare tabula rasa (ad esempio all'avvio di un nuovo anno sportivo o nuovo macrociclo) e vuoi avere anche lo Sheet completamente azzerato:

1. **(Consigliato) Crea una copia di Backup**:  
   Nel Google Sheet clicca su **File** $\rightarrow$ **Crea una copia** (es. *"PowerTrack_Backup_2025"*).
2. **Esegui il Reset e Sincronizza su tutti i dispositivi e browser**:  
   * Sul telefono principale vai in `SYNC` $\rightarrow$ premi **`RESET`** $\rightarrow$ premi **`SINCRONIZZA ORA`**.
   * Connetti al Wi-Fi il telefono da palestra (rugged) $\rightarrow$ premi **`RESET`** $\rightarrow$ premi **`SINCRONIZZA ORA`**.
   * Sul browser del PC / Web App (se utilizzata) $\rightarrow$ premi **`RESET`** $\rightarrow$ premi **`SINCRONIZZA ORA`**.  
   *(In questo modo la memoria locale di ogni dispositivo e browser è azzerata a 0 record)*.
3. **Pulisci le righe su Google Sheets in 10 secondi**:  
   * Nel foglio **`Allenamenti`**: seleziona le righe dalla **2 in giù** $\rightarrow$ tasto destro $\rightarrow$ **Elimina righe**.
   * Nel foglio **`Schede`**: seleziona le righe dalla **2 in giù** $\rightarrow$ tasto destro $\rightarrow$ **Elimina righe**.
   *(Non eliminare mai la Riga 1 di intestazione)*.

---

## 4. SETUP TECNICO: GOOGLE APPS SCRIPT WEBHOOK

1. Crea un nuovo **Foglio Google**.
2. Fai clic su **Estensioni** $\rightarrow$ **Apps Script**.
3. Incolla il seguente codice nel file `Code.gs`, sostituendo qualsiasi testo presente:

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
    var sheetCfg = ss.getSheetByName("Configurazione") || ss.insertSheet("Configurazione");

    if (action === "sync") {
      // ==========================================
      // 0. CONFIGURAZIONE STRUTTURA & PIANIFICAZIONE
      // ==========================================
      var currentCfg = {
        numPrograms: 2,
        numWeeks: 14,
        numSessions: 4,
        programLabels: {},
        updatedAt: "1970-01-01T00:00:00.000Z"
      };

      if (sheetCfg.getLastRow() > 1) {
        var cfgRows = sheetCfg.getRange(2, 1, sheetCfg.getLastRow() - 1, 2).getValues();
        for (var i = 0; i < cfgRows.length; i++) {
          var k = String(cfgRows[i][0]);
          var v = cfgRows[i][1];
          if (k === "numPrograms") currentCfg.numPrograms = Number(v) || 2;
          else if (k === "numWeeks") currentCfg.numWeeks = Number(v) || 14;
          else if (k === "numSessions") currentCfg.numSessions = Number(v) || 4;
          else if (k === "programLabels") {
            try { currentCfg.programLabels = JSON.parse(v); } catch(err) { currentCfg.programLabels = {}; }
          }
          else if (k === "updatedAt") currentCfg.updatedAt = v instanceof Date ? v.toISOString() : String(v || "");
        }
      }

      var clientCfg = payload.config;
      if (clientCfg && clientCfg.updatedAt) {
        var clientTime = new Date(clientCfg.updatedAt).getTime();
        var serverTimeCfg = new Date(currentCfg.updatedAt).getTime();
        if (clientTime >= serverTimeCfg) {
          currentCfg = {
            numPrograms: Number(clientCfg.numPrograms) || 2,
            numWeeks: Number(clientCfg.numWeeks) || 14,
            numSessions: Number(clientCfg.numSessions) || 4,
            programLabels: clientCfg.programLabels || {},
            updatedAt: clientCfg.updatedAt || serverTime
          };

          sheetCfg.clear();
          sheetCfg.appendRow(["Chiave", "Valore"]);
          sheetCfg.getRange(1, 1, 1, 2).setFontWeight("bold");
          sheetCfg.getRange(2, 1, 5, 2).setValues([
            ["numPrograms", currentCfg.numPrograms],
            ["numWeeks", currentCfg.numWeeks],
            ["numSessions", currentCfg.numSessions],
            ["programLabels", JSON.stringify(currentCfg.programLabels)],
            ["updatedAt", currentCfg.updatedAt]
          ]);
        }
      }

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
        var isDel = (t.isDeleted || !t.exercises || t.exercises.length === 0) ? "Sì" : "No";
        if (isDel === "No") {
          for (var j = 0; j < t.exercises.length; j++) {
            var ex = t.exercises[j];
            tplOutRows.push([
              t.id, t.program, t.week, t.session,
              ex.exerciseName || "", ex.category || "", ex.target || "", ex.rest || "", ex.notes || "",
              t.updatedAt, "No"
            ]);
          }
        } else {
          tplOutRows.push([
            t.id, t.program, t.week, t.session, "", "", "", "", "", t.updatedAt, "Sì"
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
            var rawDate = aRows[i][1];
            var date = "";
            if (rawDate instanceof Date) {
              date = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
            } else if (rawDate) {
              var dObj = new Date(rawDate);
              if (!isNaN(dObj.getTime())) {
                date = Utilities.formatDate(dObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
              } else {
                date = String(rawDate);
              }
            }
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
              var hasData = (set.weight !== null && set.weight !== "") || 
                            (set.reps !== null && set.reps !== "") || 
                            (set.rpe && String(set.rpe).trim() !== "") || 
                            (set.notes && String(set.notes).trim() !== "");
              if (hasData) {
                logOutRows.push([
                  l.id, l.date, l.program, l.week, l.session, isRep,
                  ex.exerciseName || "", ex.category || "", ex.targetReference || "",
                  set.setNum || (s + 1), set.weight !== null ? set.weight : "", set.reps !== null ? set.reps : "",
                  set.rpe || "", set.rest || "", set.notes || "",
                  l.updatedAt, isDel
                ]);
              }
            }
          }
        } else if (l.isDeleted) {
          logOutRows.push([
            l.id, l.date, l.program, l.week, l.session, isRep,
            "", "", "", "", "", "", "", "", "",
            l.updatedAt, "Sì"
          ]);
        }
      }
      if (logOutRows.length > 0) {
        sheetAll.getRange(2, 1, logOutRows.length, 17).setValues(logOutRows);
      }

      // ==========================================
      // 4. FOGLIO "ANALISI" (SOLO RECORD ATTIVI, ORDINATI PER DATA E PULITI)
      // ==========================================
      var sheetAna = ss.getSheetByName("Analisi") || ss.insertSheet("Analisi");
      sheetAna.clear();
      sheetAna.appendRow(["Data", "Programma", "Settimana", "Seduta", "Ripetuto", "Esercizio", "Categoria", "Target", "Set", "Peso (kg)", "Reps", "RPE", "Recupero", "Note"]);
      sheetAna.getRange(1, 1, 1, 14).setFontWeight("bold");

      var anaRows = [];
      var activeLogs = logList.filter(function(l) { return !l.isDeleted && l.performedExercises && l.performedExercises.length > 0; });
      activeLogs.sort(function(a, b) { return String(b.date).localeCompare(String(a.date)); });

      for (var i = 0; i < activeLogs.length; i++) {
        var l = activeLogs[i];
        var isRep = l.isRepeated ? "Sì" : "No";
        for (var j = 0; j < l.performedExercises.length; j++) {
          var ex = l.performedExercises[j];
          var sets = ex.sets || [];
          for (var s = 0; s < sets.length; s++) {
            var set = sets[s];
            var hasData = (set.weight !== null && set.weight !== "") || 
                          (set.reps !== null && set.reps !== "") || 
                          (set.rpe && String(set.rpe).trim() !== "") || 
                          (set.notes && String(set.notes).trim() !== "");
            if (hasData) {
              anaRows.push([
                l.date, l.program, l.week, l.session, isRep,
                ex.exerciseName || "", ex.category || "", ex.targetReference || "",
                set.setNum || (s + 1), set.weight !== null ? set.weight : "", set.reps !== null ? set.reps : "",
                set.rpe || "", set.rest || "", set.notes || ""
              ]);
            }
          }
        }
      }
      if (anaRows.length > 0) {
        sheetAna.getRange(2, 1, anaRows.length, 14).setValues(anaRows);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        serverTime: serverTime,
        data: {
          exercises: catList,
          templates: tplList,
          workoutLogs: logList,
          config: currentCfg
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

7. Apri l'app PowerTrack $\rightarrow$ Tab **`SYNC`** $\rightarrow$ Espandi **"Configurazione e Chiavi"** $\rightarrow$ clicca su **`Modifica`** nel box Webhook $\rightarrow$ Incolla l'URL e premi **`Salva`**.

---

## 5. SETUP FUNZIONALITÀ IA (GOOGLE GEMINI)

1. Accedi a [Google AI Studio](https://aistudio.google.com/).
2. Genera una chiave API gratuita (**Gemini API Key**).
3. Apri l'app PowerTrack $\rightarrow$ Tab **`SYNC`** $\rightarrow$ Espandi **"Configurazione e Chiavi"** $\rightarrow$ clicca su **`Modifica`** nel box API Key $\rightarrow$ Incolla la tua chiave (es. `AIzaSy...`) e premi **`Salva`**.
4. Ora puoi importare all'istante schede e carichi scattando foto o incollando screenshot nella scheda `SCHEDA`.

### Risoluzione problemi IA:
* **Errore API o Modello non disponibile**: Se Google dovesse aggiornare o dismettere una versione del modello, verifica lo stato della chiave su AI Studio o aggiorna il nome del modello (es. `gemini-2.0-flash`) alla riga `apiUrl` in `index.html`.
* **Estrazione imprecisa o fallita**: Assicurati che l'immagine sia nitida e ben illuminata, oppure copia e incolla direttamente il testo della scheda usando il pulsante **`Incolla appunti`** (o premendo `Ctrl+V` da PC).


