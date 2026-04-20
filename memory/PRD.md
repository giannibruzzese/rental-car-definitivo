# RE.LE.CO. GROUP / SOVERATO RENTAL - Sistema Gestione Noleggio Auto

## Funzionalità Implementate (sessione 19-20/04/2026)

### 1. Tariffe Stagionali Dinamiche
- PrenotaPage.js chiama `/api/calcola-prezzo-dinamico` automaticamente
- Backend salva tariffa_stagionale nella prenotazione
- Contratto mostra box verde con nome/periodo tariffa stagionale

### 2. Layout Contratto 5 pagine
- Pag.1: I,II,III | Pag.2: IV,V,V-BIS,VI | Pag.3: VII,VIII | Pag.4: IX | Pag.5: Firme

### 3. Modifica Durata con Ricalcolo
- Cambiando giorni → data riconsegna, tariffa, km inclusi si aggiornano automaticamente

### 4. V-BIS Editabile (Rientro & Addebiti)
- DATI RIENTRO: data/ora, km entrata, km percorsi/eccedenza, tacche carburante
- ADDEBITI: danni, gestione danni, carburante, pulizia, altri + somma automatica
- Totale addebiti si somma al Saldo alla consegna nel Riepilogo Economico

### 5. Coperture Assicurative Escludibili
- Checkbox per includere/escludere KASKO e Penalità sinistro dal totale
- Franchigie escluse mostrate barrate e con "(ESCLUSA)"
- Totale franchigie e Saldo si aggiornano dinamicamente

## Credenziali
- Admin: admin@relecogroup.it / admin123
- Cliente: mario.rossi.test@email.com / password123

## Backlog P1
- [ ] Resend API email | [ ] Firma digitale PDF | [ ] Dashboard ricavi
