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

## Importazione Codebase (19/04/2026)
- Repository GitHub: https://github.com/Giannibru69/noleggio-car-DEF
- Clonato e importato nel workspace Emergent
- Tutti i file copiati, dipendenze installate, seed dati eseguito

## Funzionalità Implementate (sessione corrente 19/04/2026)

### Tariffe Stagionali Dinamiche nel Frontend Cliente
- **PrenotaPage.js** ora chiama `/api/calcola-prezzo-dinamico` automaticamente quando il cliente cambia date
- Il prezzo si aggiorna in tempo reale in base alle tariffe stagionali configurate dall'admin
- Box verde "Tariffa stagionale applicata" con nome e periodo quando attiva
- Stato "Calcolo..." durante il caricamento
- **Bug fix backend**: `veicolo_id="tutti"` ora viene riconosciuto come tariffa generale

## Credenziali Test
- Admin: `admin@relecogroup.it` / `admin123`
- Cliente: `mario.rossi.test@email.com` / `password123`

## Backlog

### P0 (Completato)
- [x] Importazione codebase da GitHub
- [x] Tariffe stagionali dinamiche nel frontend cliente (PrenotaPage)
- [x] Fix backend calcola-prezzo-dinamico per veicolo_id="tutti"

### P1 (Prossimi)
- [ ] Configurare Resend API key per invio email reale
- [ ] Firma digitale/grafometrica nel PDF
- [ ] Dashboard ricavi / Statistiche

### P2 (Futuri)
- [ ] Bot Telegram per alert ritardo consegna
- [ ] Report statistiche
- [ ] Multi-lingua
