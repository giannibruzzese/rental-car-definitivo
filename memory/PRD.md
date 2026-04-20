# RE.LE.CO. GROUP / SOVERATO RENTAL - Sistema Gestione Noleggio Auto

## Problem Statement Originale
Web app per gestione noleggio auto RE.LE.CO. GROUP con contratto HTML stampabile identico al PDF allegato.

## Importazione Codebase (19/04/2026)
- Repository GitHub: https://github.com/Giannibru69/noleggio-car-DEF

## Funzionalità Implementate (sessione 19-20/04/2026)

### 1. Tariffe Stagionali Dinamiche nel Frontend Cliente
- PrenotaPage.js chiama `/api/calcola-prezzo-dinamico` automaticamente al cambio date
- Box verde "Tariffa stagionale applicata" con nome e periodo

### 2. Riorganizzazione Layout Contratto (5 pagine)
- Pag.1: I, II, III | Pag.2: IV, V, V-BIS, VI | Pag.3: VII, VIII | Pag.4: IX (font ridotto) | Pag.5: Firme

### 3. Tariffa Stagionale nel Contratto
- Backend salva `tariffa_stagionale` e `tariffa_giornaliera` nella prenotazione al momento della creazione
- Il contratto mostra box verde con nome e periodo della tariffa stagionale nel Riepilogo Economico
- Tariffa giornaliera e tariffa base calcolate con tariffa stagionale quando applicabile

### 4. Modifica Durata Contratto con Ricalcolo Automatico
- Modificando i giorni di durata → si aggiorna automaticamente la data di riconsegna
- Si ricalcola tariffa base, km inclusi, totale noleggio
- Si ri-verifica la tariffa stagionale per il nuovo periodo
- Modificando la data di ritiro → si aggiorna data riconsegna mantenendo durata
- Toast informativo con dettagli aggiornamento

### 5. Fix Backend
- `veicolo_id="tutti"` riconosciuto come tariffa generale in calcola-prezzo-dinamico

## Credenziali Test
- Admin: `admin@relecogroup.it` / `admin123`
- Cliente: `mario.rossi.test@email.com` / `password123`

## Backlog
### P1
- [ ] Configurare Resend API key per invio email reale
- [ ] Firma digitale/grafometrica nel PDF
### P2
- [ ] Dashboard ricavi / Statistiche
- [ ] Bot Telegram per alert ritardo consegna
- [ ] Multi-lingua
