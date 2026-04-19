# RE.LE.CO. GROUP / SOVERATO RENTAL - Sistema Gestione Noleggio Auto

## Problem Statement Originale
Web app per gestione noleggio auto RE.LE.CO. GROUP con contratto HTML stampabile identico al PDF allegato. Sistema completo con wizard registrazione, gestione flotta, calendario prenotazioni, contratti digitali e area admin.

## Dati Agenzia
```
RE.LE.CO. GROUP / Soverato Rental
Corso Umberto, 220 - 88068 Soverato (CZ) - Calabria
P.IVA: 03406230791 - CF: 03406230791
Tel: 3342370420 - Email: relecogroup@libero.it
```

## Funzionalità Implementate ✅

### Calendario Avanzato V2 (✅ 10/04/2026)
- **Click su giorno con eventi** → Apre dialog "Dettaglio Giorno" con lista prenotazioni e note
- **Date corrette** → Le prenotazioni appaiono su tutti i giorni del periodo (da data ritiro a data riconsegna)
- **Modifica prenotazione** → Pulsante diretto dal dettaglio giorno
- **Annulla prenotazione** → Pulsante arancione "Annulla" per cancellare prenotazione dal calendario
- **Elimina prenotazione annullata** → Pulsante rosso "Elimina" per rimuovere definitivamente dal DB (solo per annullate)
- **Blocco Calendario senza cliente** → Tab "Solo Blocco" per bloccare veicoli senza associare un cliente (manutenzione, prenotazioni telefoniche)
- **Note Admin senza cliente** → Pulsante 📝 giallo per aggiungere promemoria/note libere
- **Selettore colore nota** → Grigio, Giallo, Rosso, Verde, Blu
- **Eliminazione note** → Pulsante X nel dettaglio giorno

### Disponibilità Veicoli Avanzata (✅ 10/04/2026)
- **Filtro automatico per periodo** → Quando si crea prenotazione, mostra solo veicoli disponibili
- **Veicoli già prenotati** → Mostrati in grigio con ❌ e "GIÀ PRENOTATO"
- **Veicoli disponibili** → Mostrati con ✅
- **Messaggio "Nessun veicolo disponibile"** → Quando tutti i veicoli sono già prenotati
- **Blocco prenotazione** → Backend impedisce prenotazioni su veicoli già prenotati per lo stesso periodo

### Date in Formato Italiano (✅ 30/03/2026)
- Tutte le date visualizzate in formato GG/MM/AAAA
- Applicato a: Prenotazioni, Contratti, Calendario
- Funzione `formatDateIT()` centralizzata nel frontend

### Tariffe Stagionali Dinamiche (✅ 30/03/2026)
- Nuovo endpoint `/api/calcola-prezzo-dinamico` che calcola tariffa applicabile
- Priorità: tariffa specifica veicolo > tariffa generale > tariffa base veicolo
- Dialog "Nuova Prenotazione" mostra prezzo dinamico in tempo reale
- Box verde con "✓ Tariffa stagionale applicata automaticamente"
- Nome e periodo della tariffa applicata mostrati

### Modifica Tariffe Stagionali (✅ 30/03/2026)
- Nuovo endpoint `PUT /api/settings/tariffe-stagionali/{id}` per aggiornamento
- Icona matita (✏️) nella tabella Tariffe Stagionali
- Dialog "Modifica Tariffa Stagionale" con tutti i campi editabili
- Possibilità di modificare: nome, veicolo, date, tariffa giornaliera, descrizione

### Eliminazione Cliente con Soft-Delete (✅ 30/03/2026)
- Nuovo endpoint `DELETE /api/clienti/{cliente_id}` con soft-delete
- Icona cestino (🗑️) nella tabella Clienti
- Conferma con alert dettagliato prima dell'eliminazione
- Annulla automaticamente prenotazioni FUTURE del cliente
- Mantiene intatto lo storico delle prenotazioni passate
- Impedisce login futuro (email rinominata con prefisso DELETED_)
- Clienti eliminati non compaiono più nella lista

### Rebranding Soverato Rental (✅ 30/03/2026)
- Logo Soverato Rental su tutte le pagine (Homepage, Login, Sidebar Admin)
- Dicitura "Soverato Rental" invece di "RE.LE.CO. GROUP" nelle UI
- RE.LE.CO. GROUP S.R.L. rimane come ragione sociale legale nel contratto

### Prenotazione da Calendario Admin (✅ 30/03/2026)
- Click su una data del calendario apre dialog "Nuova Prenotazione"
- Pulsante "+" blu appare al hover su ogni giorno
- Selezione cliente esistente con dropdown
- Creazione nuovo cliente con tutti i dati anagrafici
- Inserimento dati carta di credito (opzionale)
- Prenotazione creata con status "approvata" automaticamente

### Alert Patente Scaduta (✅ 30/03/2026)
- Controllo automatico data scadenza patente al momento della prenotazione
- Alert rosso visibile "Patente Scaduta!" se patente risulta scaduta
- Pulsante "Aggiorna Patente" che porta al profilo cliente
- Blocco prenotazione: impossibile confermare se patente scaduta

### Dati Agenzia Dinamici nel PDF Contratto (✅ 30/03/2026)
- Il contratto carica i dati agenzia dalle Impostazioni
- Se configurato, mostra logo dinamico nell'header del contratto
- Fallback ai dati RE.LE.CO. GROUP se non configurato

### Franchigie Assicurative Specifiche (✅ 10/04/2026)
- **ATTIVAZIONE KASKO CON FRANCHIGIA DANNI** - €500 importo, €15/giorno
- **PENALITA' PER SINISTRO CON RESPONSABILITA'** - €250 penale
- **SCOPERTO 10% INCENDIO E FURTO** - 10% sul valore veicolo
- **Prezzi modificabili** direttamente nella tabella impostazioni (inline edit)

### Tariffe Stagionali con Tariffa Giornaliera (✅ 30/03/2026)
- Sostituito "Moltiplicatore Prezzo" con "Tariffa Giornaliera (€)"
- Campo editabile con valore in euro (es: 45.00)
- Dropdown per selezionare veicolo specifico o "Tutti i veicoli"

### Contratto Completamente Editabile Digitalmente (✅ 30/03/2026)
- **70+ campi editabili** in modalità modifica
- Tutti i dati cliente modificabili (nome, cognome, CF, indirizzo, CAP, comune, provincia)
- Dati patente modificabili (numero, categoria, scadenza)
- Dati veicolo modificabili (marca, modello, targa, colore, cambio, alimentazione)
- Date e orari modificabili (ritiro, riconsegna, durata)
- Costi modificabili (tariffa base, servizi, franchigie, acconto, deposito)
- Km inclusi e prezzo km extra modificabili
- Check-in/Check-out editabili
- **GARANTE** editabile: Nome, Recapiti, Documento
- **CARTA DI CREDITO** editabile: Circuito, Intestatario, Ultime 4 cifre, Scadenza MM/AA
- **METODO PAGAMENTO** editabile: Contanti, Carta, Bonifico, Altro (checkbox)
- Pulsante "Salva Modifiche" con conferma toast

### Tariffe Stagionali con Dropdown Veicoli (✅ 30/03/2026)
- Menù a tendina per selezionare veicolo specifico
- Opzione "🚗 Tutti i veicoli" per applicare a tutto il parco auto
- Lista completa veicoli con marca, modello, targa
- Moltiplicatore prezzo per periodo (es: 1.5x = +50%)

### Password Cliente Visibile all'Admin (✅ 30/03/2026)
- Colonna "Credenziali Accesso" nella pagina Clienti
- Email e password mostrate insieme
- Icona occhio (👁️) per toggle visibilità password
- Password mascherata di default (••••••••)
- **Icona matita (✏️)** per modificare la password direttamente
- Nuovi clienti registrati hanno `password_chiaro` salvato automaticamente
- Per clienti pre-esistenti: possibilità di impostare password dall'admin

### Homepage con Contatti Cliccabili (✅ 26/03/2025)
- **Telefono**: `tel:+393342370420` → avvia chiamata da cellulare
- **Email**: `mailto:relecogroup@libero.it` → apre client email
- **Indirizzo**: link Google Maps → apre navigatore
- Contatti cliccabili sia nella hero section che nella sezione contatti

### Registrazione Cliente (✅ Completato)
- Wizard 3 step (Dati Anagrafici, Patente, Consensi)
- **Password visibile** durante digitazione (icona occhio mostra/nascondi)
- Nota "Clicca l'icona per vedere la password"
- Password salvata in chiaro per la direzione

### Email Conferma Prenotazione (✅ 26/03/2025)
- Quando la direzione approva una prenotazione → email automatica al cliente
- Contenuto email:
  - Conferma APPROVAZIONE con branding RE.LE.CO. GROUP
  - Dettagli veicolo (marca, modello, targa)
  - **Date attivazione/scadenza** contratto
  - Totale e deposito cauzionale
  - Cosa portare al ritiro (documenti, carta credito)
  - Indirizzo e contatti agenzia
- Integrazione Resend (richiede API key)

### Contratto HTML Stampabile (✅ Completato)
- Layout identico al PDF originale - 4 pagine
- Disegni schema veicolo per segnare danni con penna
- PDF generato da frontend (jsPDF + html2canvas) per parità 100% con HTML
- Campi carta di credito vuoti (compilazione in agenzia)

### Calendario Visivo Prenotazioni (✅ Completato)
- Vista mensile con navigazione
- Prenotazioni colorate per stato
- Mostra "Nome Veicolo + Nome Cliente"

### Gestione Flotta (✅ Completato)
- Upload immagini veicoli dal computer
- Scheda tecnica completa

### Pagina Impostazioni Admin (✅ Completato)
- Dati agenzia configurabili (logo, ragione sociale, indirizzo, contatti)
- Tariffe stagionali con moltiplicatori
- Condizioni generali di noleggio
- Franchigie assicurative
- Servizi supplementari

## Credenziali Test
- Admin: `admin@relecogroup.it` / `admin123`
- Cliente: `mario.rossi.test@email.com` / `password123`

## Configurazione Email (Opzionale)
Per attivare invio email reale, aggiungere in `/app/backend/.env`:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
SENDER_EMAIL=noreply@tuodominio.com
```

## Backlog

### P0 (Completato) ✅
- [x] Homepage con contatti cliccabili (tel, mailto, maps)
- [x] Password visibile durante registrazione
- [x] Password in chiaro per direzione
- [x] Email conferma approvazione prenotazione
- [x] Contratto HTML stampabile con disegni veicolo
- [x] Calendario visivo prenotazioni
- [x] Upload immagini veicoli
- [x] **Contratto completamente editabile digitalmente**
- [x] **Tariffe stagionali con dropdown veicoli specifici**
- [x] **Password cliente visibile all'admin**

### P1 (Prossimi)
- [x] Prenotazione da Calendario Admin (creare cliente nuovo/esistente + dati carta credito)
- [ ] Applicazione dinamica tariffe stagionali ai prezzi clienti
- [x] Alert patente scaduta (blocca prenotazione se scaduta)
- [x] Applicare dati Agenzia dinamici (da Impostazioni) nel PDF contratto
- [ ] Configurare Resend API key per invio email reale
- [ ] Firma digitale/grafometrica nel PDF

### P2 (Futuri)
- [ ] Bot Telegram per alert ritardo consegna (+5 min)
- [ ] Dashboard ricavi / Statistiche
- [ ] Report statistiche
- [ ] Multi-lingua
