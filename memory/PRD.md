# RE.LE.CO. GROUP / SOVERATO RENTAL - Sistema Gestione Noleggio Auto

## Problem Statement Originale
Web app per gestione noleggio auto RE.LE.CO. GROUP con contratto HTML stampabile identico al PDF allegato. Sistema completo con wizard registrazione, gestione flotta, calendario prenotazioni, contratti digitali e area admin.

## Importazione Codebase (19/04/2026)
- Repository GitHub: https://github.com/Giannibru69/noleggio-car-DEF
- Clonato e importato nel workspace Emergent

## Funzionalità Implementate (sessione 19/04/2026)

### Tariffe Stagionali Dinamiche nel Frontend Cliente
- PrenotaPage.js ora chiama `/api/calcola-prezzo-dinamico` automaticamente
- Fix backend: `veicolo_id="tutti"` riconosciuto come tariffa generale

### Riorganizzazione Layout Contratto Stampa (5 pagine)
- **Pagina 1/5**: Art. I (Parti), II (Conducenti), III (Veicolo)
- **Pagina 2/5**: Art. IV (Durata), V (Corrispettivo), V-BIS (Rientro), VI (Check In/Out)
- **Pagina 3/5**: Art. VII (Danni preesistenti), VIII (Garanzie & Pagamento)
- **Pagina 4/5**: Art. IX (Condizioni Generali, font ridotto 6.5pt per contenere tutto)
- **Pagina 5/5**: Art. X (Dichiarazioni, Firme, Clausole vessatorie, Footer)

## Credenziali Test
- Admin: `admin@relecogroup.it` / `admin123`
- Cliente: `mario.rossi.test@email.com` / `password123`

## Backlog

### P1 (Prossimi)
- [ ] Configurare Resend API key per invio email reale
- [ ] Firma digitale/grafometrica nel PDF
- [ ] Dashboard ricavi / Statistiche

### P2 (Futuri)
- [ ] Bot Telegram per alert ritardo consegna
- [ ] Report statistiche
- [ ] Multi-lingua
