import { useState, useEffect, useMemo } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, Info, Plus, UserPlus, Users, CreditCard, StickyNote, Edit2, X, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// Funzione per formattare le date in formato italiano (gg/mm/aaaa)
const formatDateIT = (dateString) => {
  if (!dateString) return '';
  const datePart = dateString.split(' ')[0].split('T')[0];
  if (datePart.includes('-')) {
    const parts = datePart.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateString;
};

const STATUS_COLORS = {
  bozza: { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-400' },
  in_verifica: { bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-500' },
  approvata: { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-500' },
  contratto_generato: { bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-500' },
  consegnato: { bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-500' },
  chiuso: { bg: 'bg-slate-300', text: 'text-slate-700', border: 'border-slate-500' },
  annullata: { bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-500' },
  blocco: { bg: 'bg-orange-200', text: 'text-orange-800', border: 'border-orange-500' }
};

// Helper to check if booking is a calendar block (no client)
const isBloccoCalendario = (booking) => {
  return booking.cliente_id === 'BLOCCO_CALENDARIO' || 
         booking.cliente_nome === 'BLOCCO CALENDARIO' ||
         !booking.cliente_id;
};

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const DAYS_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// Palette di colori unici per distinguere ogni prenotazione/nota
const BOOKING_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-500', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-500', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-100', text: 'text-violet-900', border: 'border-violet-500', dot: 'bg-violet-500' },
  { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-500', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-500', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-500', dot: 'bg-cyan-500' },
  { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-500', dot: 'bg-orange-500' },
  { bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-500', dot: 'bg-teal-500' },
  { bg: 'bg-pink-100', text: 'text-pink-900', border: 'border-pink-500', dot: 'bg-pink-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-500', dot: 'bg-indigo-500' },
  { bg: 'bg-lime-100', text: 'text-lime-900', border: 'border-lime-500', dot: 'bg-lime-500' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-900', border: 'border-fuchsia-500', dot: 'bg-fuchsia-500' },
  { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-500', dot: 'bg-sky-500' },
  { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-500', dot: 'bg-red-500' },
  { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-500', dot: 'bg-green-500' },
  { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-500', dot: 'bg-purple-500' },
];

const NOTE_COLORS = [
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-500' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-500' },
  { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-500' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-500' },
];

// Hash stabile: stesso ID → stesso colore sempre
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const getBookingColor = (bookingId) => {
  return BOOKING_COLORS[hashString(bookingId) % BOOKING_COLORS.length];
};

const getNoteColor = (noteId) => {
  return NOTE_COLORS[hashString(noteId) % NOTE_COLORS.length];
};

export default function CalendarioPrenotazioniPage() {
  const { token } = useAuth();
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [veicoli, setVeicoli] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [hoveredBooking, setHoveredBooking] = useState(null);
  
  // Dialog per nuova prenotazione
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [clienteTab, setClienteTab] = useState('esistente');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedVeicoloBooking, setSelectedVeicoloBooking] = useState('');
  const [veicoliDisponibili, setVeicoliDisponibili] = useState([]);
  const [loadingVeicoli, setLoadingVeicoli] = useState(false);
  const [newBooking, setNewBooking] = useState({
    data_ritiro: '',
    ora_ritiro: '09:00',
    data_riconsegna: '',
    ora_riconsegna: '18:00',
    note_admin: '',
    km_inclusi: 'standard'  // 'standard' o 'illimitati'
  });
  
  // Dialog dettaglio giorno
  const [showDayDetailDialog, setShowDayDetailDialog] = useState(false);
  const [dayDetailDate, setDayDetailDate] = useState(null);
  
  // Dialog nota admin (senza cliente)
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteData, setNoteData] = useState({
    titolo: '',
    contenuto: '',
    data: '',
    colore: 'gray'
  });
  const [note, setNote] = useState([]);
  
  const [newCliente, setNewCliente] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    cellulare: '',
    codice_fiscale: '',
    data_nascita: '',
    luogo_nascita: '',
    indirizzo: '',
    comune: '',
    provincia: '',
    cap: '',
    patente_numero: '',
    patente_categoria: 'B',
    patente_data_scadenza: ''
  });
  const [cartaCredito, setCartaCredito] = useState({
    circuito: '',
    intestatario: '',
    numero: '',
    scadenza_mese: '',
    scadenza_anno: ''
  });
  const [savingBooking, setSavingBooking] = useState(false);
  
  // Prezzo dinamico
  const [prezzoDinamico, setPrezzoDinamico] = useState(null);
  const [loadingPrezzo, setLoadingPrezzo] = useState(false);

  const fetchData = async () => {
    try {
      const [prenotazioniRes, veicoliRes, clientiRes, noteRes] = await Promise.all([
        axios.get(`${API}/api/prenotazioni`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/vehicles`),
        axios.get(`${API}/api/clienti`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/calendario/note`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);
      setPrenotazioni(prenotazioniRes.data);
      setVeicoli(veicoliRes.data);
      setClienti(clientiRes.data || []);
      setNote(noteRes.data || []);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);
  
  // Carica veicoli disponibili quando cambiano le date
  useEffect(() => {
    const fetchVeicoliDisponibili = async () => {
      if (!newBooking.data_ritiro || !newBooking.data_riconsegna) {
        setVeicoliDisponibili(veicoli);
        return;
      }
      
      setLoadingVeicoli(true);
      try {
        const res = await axios.get(`${API}/api/vehicles/available-period`, {
          params: {
            data_inizio: newBooking.data_ritiro,
            data_fine: newBooking.data_riconsegna
          }
        });
        setVeicoliDisponibili(res.data);
      } catch (error) {
        console.error('Errore caricamento veicoli disponibili:', error);
        setVeicoliDisponibili(veicoli);
      } finally {
        setLoadingVeicoli(false);
      }
    };
    
    fetchVeicoliDisponibili();
  }, [newBooking.data_ritiro, newBooking.data_riconsegna, veicoli]);

  // Calcola prezzo dinamico quando cambiano veicolo o date
  useEffect(() => {
    const fetchPrezzoDinamico = async () => {
      if (!selectedVeicoloBooking || selectedVeicoloBooking === 'generico' || !newBooking.data_ritiro || !newBooking.data_riconsegna) {
        setPrezzoDinamico(null);
        return;
      }
      
      setLoadingPrezzo(true);
      try {
        const res = await axios.get(`${API}/api/calcola-prezzo-dinamico`, {
          params: {
            veicolo_id: selectedVeicoloBooking,
            data_inizio: newBooking.data_ritiro,
            data_fine: newBooking.data_riconsegna
          }
        });
        setPrezzoDinamico(res.data);
      } catch (error) {
        console.error('Errore calcolo prezzo:', error);
        setPrezzoDinamico(null);
      } finally {
        setLoadingPrezzo(false);
      }
    };
    
    fetchPrezzoDinamico();
  }, [selectedVeicoloBooking, newBooking.data_ritiro, newBooking.data_riconsegna]);

  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get Monday of the first week
    let startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    // Generate 6 weeks
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [currentDate]);

  // Filter bookings for selected vehicle
  const filteredPrenotazioni = useMemo(() => {
    if (selectedVehicle === 'all') return prenotazioni;
    return prenotazioni.filter(p => p.veicolo_id === selectedVehicle);
  }, [prenotazioni, selectedVehicle]);

  // Get bookings for a specific date (use local date to avoid timezone issues)
  const getBookingsForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return filteredPrenotazioni.filter(p => {
      const start = p.data_ritiro;
      const end = p.data_riconsegna;
      return dateStr >= start && dateStr <= end;
    });
  };
  
  // Get notes for a specific date
  const getNotesForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return note.filter(n => n.data === dateStr);
  };

  // Check if booking starts on this date (use local date)
  const isBookingStart = (booking, date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return booking.data_ritiro === dateStr;
  };

  // Check if booking ends on this date (use local date)
  const isBookingEnd = (booking, date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return booking.data_riconsegna === dateStr;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Handle click on a date cell to show day detail
  const handleDateClick = (date) => {
    const bookings = getBookingsForDate(date);
    const noteGiorno = getNotesForDate(date);
    
    // If there are events, show day detail dialog
    if (bookings.length > 0 || noteGiorno.length > 0) {
      setDayDetailDate(date);
      setShowDayDetailDialog(true);
    } else {
      // Otherwise, open new booking dialog
      openNewBookingDialog(date);
    }
  };
  
  // Open new booking dialog for a specific date
  const openNewBookingDialog = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextYear = nextDay.getFullYear();
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDayNum = String(nextDay.getDate()).padStart(2, '0');
    const nextDayStr = `${nextYear}-${nextMonth}-${nextDayNum}`;
    
    setSelectedDate(date);
    setNewBooking({
      data_ritiro: dateStr,
      ora_ritiro: '09:00',
      data_riconsegna: nextDayStr,
      ora_riconsegna: '18:00',
      note_admin: ''
    });
    setShowNewBookingDialog(true);
  };
  
  // Open note dialog
  const openNoteDialog = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    setNoteData({
      titolo: '',
      contenuto: '',
      data: dateStr,
      colore: 'gray'
    });
    setShowNoteDialog(true);
  };
  
  // Save note
  const handleSaveNote = async () => {
    if (!noteData.titolo) {
      toast.error('Inserisci un titolo per la nota');
      return;
    }
    
    try {
      await axios.post(`${API}/api/calendario/note`, noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Nota salvata!');
      setShowNoteDialog(false);
      fetchData();
    } catch (error) {
      console.error('Errore salvataggio nota:', error);
      toast.error('Errore nel salvataggio della nota');
    }
  };
  
  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${API}/api/calendario/note/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Nota eliminata');
      fetchData();
    } catch (error) {
      console.error('Errore eliminazione nota:', error);
      toast.error('Errore eliminazione nota');
    }
  };
  
  // Annulla prenotazione
  const handleAnnullaPrenotazione = async (bookingId) => {
    if (!window.confirm('Sei sicuro di voler ANNULLARE questa prenotazione? Il veicolo tornerà disponibile.')) {
      return;
    }
    
    try {
      await axios.patch(`${API}/api/prenotazioni/${bookingId}/status`, 
        { status: 'annullata' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Prenotazione annullata');
      fetchData();
      setShowDayDetailDialog(false);
    } catch (error) {
      console.error('Errore annullamento:', error);
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response?.data?.detail 
        : 'Errore nell\'annullamento';
      toast.error(errorMsg);
    }
  };
  
  // Elimina prenotazione definitivamente (per qualsiasi evento)
  const handleEliminaPrenotazione = async (bookingId) => {
    if (!window.confirm('Sei sicuro di voler ELIMINARE DEFINITIVAMENTE questa prenotazione/blocco? Il veicolo tornerà disponibile per questo periodo.')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/api/prenotazioni/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Prenotazione eliminata dal calendario');
      fetchData();
      setShowDayDetailDialog(false);
    } catch (error) {
      console.error('Errore eliminazione:', error);
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response?.data?.detail 
        : 'Errore nell\'eliminazione';
      toast.error(errorMsg);
    }
  };

  // Create new booking (admin)
  const handleCreateBooking = async () => {
    try {
      setSavingBooking(true);
      
      let clienteId = selectedCliente;
      let isBloccoCalendario = clienteTab === 'blocco';
      
      // If creating new client
      if (clienteTab === 'nuovo') {
        if (!newCliente.nome || !newCliente.cognome || !newCliente.email || !newCliente.password) {
          toast.error('Compila tutti i campi obbligatori del cliente');
          return;
        }
        
        // Register new client
        const registerRes = await axios.post(`${API}/api/auth/register`, {
          ...newCliente,
          stato: 'Italia',
          patente_intestatario_nome: newCliente.nome,
          patente_intestatario_cognome: newCliente.cognome,
          patente_paese_rilascio: 'Italia',
          patente_data_rilascio: '2020-01-01',
          consenso_privacy: true,
          consenso_marketing: false,
          accetta_condizioni: true,
          accetta_privacy: true,
          conferma_veridicita: true
        });
        
        clienteId = registerRes.data.user.id;
        toast.success(`Cliente ${newCliente.nome} ${newCliente.cognome} creato!`);
      }
      
      // For "blocco" mode, we don't need a client but need notes
      if (isBloccoCalendario) {
        if (!newBooking.note_admin) {
          toast.error('Inserisci una nota per il blocco calendario');
          return;
        }
        clienteId = 'BLOCCO_CALENDARIO';  // Special ID for calendar blocks
      } else if (!clienteId) {
        toast.error('Seleziona o crea un cliente');
        return;
      }
      
      if (!selectedVeicoloBooking) {
        toast.error('Seleziona un veicolo');
        return;
      }
      
      // Handle "veicolo generico" case
      const isGenerico = selectedVeicoloBooking === 'generico';
      const veicolo = isGenerico ? null : veicoli.find(v => v.id === selectedVeicoloBooking);
      
      // Calculate days
      const startDate = new Date(newBooking.data_ritiro);
      const endDate = new Date(newBooking.data_riconsegna);
      const diffTime = Math.abs(endDate - startDate);
      const durata = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      // Create booking via admin endpoint
      const bookingData = {
        user_id: clienteId,
        veicolo_id: isGenerico ? 'generico' : selectedVeicoloBooking,
        is_veicolo_generico: isGenerico,
        data_ritiro: newBooking.data_ritiro,
        ora_ritiro: newBooking.ora_ritiro,
        data_riconsegna: newBooking.data_riconsegna,
        ora_riconsegna: newBooking.ora_riconsegna,
        durata_giorni: durata,
        note_admin: newBooking.note_admin || '',  // Include admin notes
        status: 'approvata', // Admin creates approved bookings
        // Credit card data if provided
        carta_circuito: cartaCredito.circuito,
        carta_intestatario: cartaCredito.intestatario,
        carta_numero: cartaCredito.numero,
        carta_scadenza_mese: cartaCredito.scadenza_mese,
        carta_scadenza_anno: cartaCredito.scadenza_anno
      };
      
      await axios.post(`${API}/api/prenotazioni/admin-create`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Prenotazione creata con successo!');
      setShowNewBookingDialog(false);
      resetNewBookingForm();
      fetchData();
      
    } catch (error) {
      console.error('Errore creazione prenotazione:', error);
      toast.error(error.response?.data?.detail || 'Errore nella creazione');
    } finally {
      setSavingBooking(false);
    }
  };
  
  const resetNewBookingForm = () => {
    setSelectedCliente('');
    setSelectedVeicoloBooking('');
    setClienteTab('esistente');
    setNewCliente({
      nome: '', cognome: '', email: '', password: '', cellulare: '', codice_fiscale: '',
      data_nascita: '', luogo_nascita: '', indirizzo: '', comune: '', provincia: '', cap: '',
      patente_numero: '', patente_categoria: 'B', patente_data_scadenza: ''
    });
    setCartaCredito({ circuito: '', intestatario: '', numero: '', scadenza_mese: '', scadenza_anno: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Calendario Prenotazioni
          </h1>
          <p className="text-slate-500">Visualizza tutte le prenotazioni nel calendario</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tutti i veicoli" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i veicoli</SelectItem>
              {veicoli.map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.marca} {v.modello} ({v.targa})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {MONTHS_IT[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={goToToday}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Oggi
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Days header */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_IT.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-t border-l">
            {calendarDays.map((date, index) => {
              const bookings = getBookingsForDate(date);
              const noteGiorno = getNotesForDate(date);
              const isInMonth = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              const hasEvents = bookings.length > 0 || noteGiorno.length > 0;

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] border-r border-b p-1 relative group
                    ${isInMonth ? 'bg-white hover:bg-blue-50' : 'bg-slate-50'}
                    ${isTodayDate ? 'ring-2 ring-blue-500 ring-inset' : ''}
                    cursor-pointer transition-colors
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  {/* Date number + Action buttons */}
                  <div className="flex items-center justify-between">
                    <div className={`
                      text-sm font-medium
                      ${isInMonth ? 'text-slate-900' : 'text-slate-400'}
                      ${isTodayDate ? 'text-blue-600' : ''}
                    `}>
                      {date.getDate()}
                      {hasEvents && <span className="ml-1 text-xs text-blue-500">●</span>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openNoteDialog(date); }}
                        className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white"
                        title="Aggiungi nota"
                      >
                        <StickyNote className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openNewBookingDialog(date); }}
                        className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white"
                        title="Nuova prenotazione"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {noteGiorno.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {noteGiorno.slice(0, 1).map(n => {
                        const nColors = getNoteColor(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${nColors.bg} ${nColors.text} border-l-2 ${nColors.border}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {n.titolo}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bookings */}
                  <div className="space-y-0.5 overflow-hidden mt-1" style={{ maxHeight: '75px' }}>
                    {bookings.slice(0, 3).map(booking => {
                      // Use unique color per booking based on ID
                      const isBlocco = isBloccoCalendario(booking);
                      const colors = isBlocco ? STATUS_COLORS.blocco : getBookingColor(booking.id);
                      const isStart = isBookingStart(booking, date);
                      const isEnd = isBookingEnd(booking, date);

                      return (
                        <Link
                          key={booking.id}
                          to={`/admin/prenotazioni/${booking.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`
                            block text-xs px-1 py-0.5 truncate cursor-pointer
                            ${colors.bg} ${colors.text}
                            ${isStart ? 'rounded-l' : ''}
                            ${isEnd ? 'rounded-r' : ''}
                            ${!isStart && !isEnd ? '' : ''}
                            hover:opacity-80 transition-opacity
                            border-l-2 ${colors.border}
                          `}
                          onMouseEnter={() => setHoveredBooking(booking)}
                          onMouseLeave={() => setHoveredBooking(null)}
                        >
                          {isStart && (
                            <>
                              <span className="font-semibold">{booking.veicolo_marca} {booking.veicolo_modello}</span>
                              <span className="ml-1 opacity-75">
                                {isBlocco ? (
                                  <>🔒 {booking.note_admin ? booking.note_admin.substring(0, 15) + (booking.note_admin.length > 15 ? '...' : '') : 'BLOCCO'}</>
                                ) : booking.cliente_nome}
                              </span>
                            </>
                          )}
                          {!isStart && (
                            <span className="opacity-50">→</span>
                          )}
                        </Link>
                      );
                    })}
                    {bookings.length > 3 && (
                      <div className="text-xs text-slate-500 text-center">
                        +{bookings.length - 3} altre
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="w-4 h-4" />
            Legenda Stati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${colors.bg} border-l-2 ${colors.border}`}></div>
                <span className="text-xs text-slate-600 capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking tooltip/popup */}
      {hoveredBooking && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="shadow-xl border-2 w-80">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${getBookingColor(hoveredBooking.id).bg} flex items-center justify-center`}>
                  <Car className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {hoveredBooking.veicolo_marca} {hoveredBooking.veicolo_modello}
                  </p>
                  <p className="text-sm text-slate-600">{hoveredBooking.veicolo_targa}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Cliente: {hoveredBooking.cliente_nome}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDateIT(hoveredBooking.data_ritiro)} → {formatDateIT(hoveredBooking.data_riconsegna)}
                  </p>
                  <Badge className={`mt-2 ${getBookingColor(hoveredBooking.id).bg} ${getBookingColor(hoveredBooking.id).text}`}>
                    {hoveredBooking.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{prenotazioni.length}</p>
            <p className="text-sm text-slate-500">Totale Prenotazioni</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {prenotazioni.filter(p => p.status === 'approvata' || p.status === 'contratto_generato').length}
            </p>
            <p className="text-sm text-slate-500">Confermate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {prenotazioni.filter(p => p.status === 'consegnato').length}
            </p>
            <p className="text-sm text-slate-500">In Corso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {prenotazioni.filter(p => p.status === 'bozza' || p.status === 'in_verifica').length}
            </p>
            <p className="text-sm text-slate-500">In Attesa</p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nuova Prenotazione */}
      <Dialog open={showNewBookingDialog} onOpenChange={setShowNewBookingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Nuova Prenotazione
              {selectedDate && (
                <span className="text-sm font-normal text-slate-500">
                  - {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Date e Orari */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Ritiro *</Label>
                <Input type="date" value={newBooking.data_ritiro} onChange={e => setNewBooking({...newBooking, data_ritiro: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ora Ritiro</Label>
                <Input type="time" value={newBooking.ora_ritiro} onChange={e => setNewBooking({...newBooking, ora_ritiro: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Data Riconsegna *</Label>
                <Input type="date" value={newBooking.data_riconsegna} onChange={e => setNewBooking({...newBooking, data_riconsegna: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ora Riconsegna</Label>
                <Input type="time" value={newBooking.ora_riconsegna} onChange={e => setNewBooking({...newBooking, ora_riconsegna: e.target.value})} />
              </div>
            </div>

            {/* Veicolo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Car className="w-4 h-4" /> 
                Veicolo * 
                {loadingVeicoli && <span className="text-xs text-slate-400">(caricamento...)</span>}
              </Label>
              <Select value={selectedVeicoloBooking} onValueChange={setSelectedVeicoloBooking}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona veicolo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generico" className="bg-orange-50 text-orange-700 font-medium">
                    🚗 Veicolo Generico (assegnato al ritiro)
                  </SelectItem>
                  <div className="border-t my-1"></div>
                  {veicoliDisponibili.length > 0 ? (
                    veicoliDisponibili.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        ✅ {v.marca} {v.modello} ({v.targa}) - €{v.tariffa_giornaliera || v.base_price}/giorno
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-sm text-red-500">
                      Nessun veicolo disponibile per queste date
                    </div>
                  )}
                  {/* Show unavailable vehicles grayed out */}
                  {veicoli.filter(v => !veicoliDisponibili.find(vd => vd.id === v.id)).length > 0 && (
                    <>
                      <div className="border-t my-1"></div>
                      <div className="px-2 py-1 text-xs text-slate-400 font-semibold">Non disponibili:</div>
                      {veicoli.filter(v => !veicoliDisponibili.find(vd => vd.id === v.id)).map(v => (
                        <div key={v.id} className="px-2 py-1 text-sm text-slate-400 cursor-not-allowed">
                          ❌ {v.marca} {v.modello} ({v.targa}) - GIÀ PRENOTATO
                        </div>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {selectedVeicoloBooking === 'generico' && (
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Il veicolo specifico verrà assegnato dall'admin al momento del ritiro del cliente.
                </p>
              )}
              
              {/* Mostra Prezzo Dinamico */}
              {selectedVeicoloBooking && selectedVeicoloBooking !== 'generico' && newBooking.data_ritiro && newBooking.data_riconsegna && (
                <div className={`p-3 rounded-lg border ${prezzoDinamico?.tariffa_applicata === 'base' ? 'bg-slate-50 border-slate-200' : 'bg-green-50 border-green-200'}`}>
                  {loadingPrezzo ? (
                    <p className="text-sm text-slate-500">Calcolo prezzo...</p>
                  ) : prezzoDinamico ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tariffa Applicata:</span>
                        <span className={`text-lg font-bold ${prezzoDinamico.tariffa_applicata !== 'base' ? 'text-green-700' : 'text-slate-700'}`}>
                          €{prezzoDinamico.tariffa_giornaliera?.toFixed(2)}/giorno
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {prezzoDinamico.nome_tariffa}
                        {prezzoDinamico.periodo && <span className="ml-1">({prezzoDinamico.periodo})</span>}
                      </p>
                      {prezzoDinamico.tariffa_applicata !== 'base' && (
                        <p className="text-xs text-green-600 font-medium">✓ Tariffa stagionale applicata automaticamente</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cliente - Tab esistente/nuovo/blocco */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2"><Users className="w-4 h-4" /> Cliente</Label>
              <Tabs value={clienteTab} onValueChange={setClienteTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="esistente">Esistente</TabsTrigger>
                  <TabsTrigger value="nuovo">Nuovo</TabsTrigger>
                  <TabsTrigger value="blocco">Solo Blocco</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blocco" className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                      <StickyNote className="w-4 h-4" />
                      Blocco Calendario (Senza Cliente)
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Blocca il veicolo nel calendario senza associare un cliente. 
                      Utile per manutenzione, prenotazioni telefoniche in attesa, o riserve interne.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-xs">Note / Motivo del blocco *</Label>
                      <Textarea 
                        value={newBooking.note_admin} 
                        onChange={e => setNewBooking({...newBooking, note_admin: e.target.value})}
                        placeholder="Es: Manutenzione programmata, Prenotazione telefonica Mario Rossi 333-1234567, Riserva per cliente VIP..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="esistente" className="space-y-4">
                  <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona cliente esistente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clienti.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome} {c.cognome} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="nuovo" className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                      <UserPlus className="w-4 h-4" />
                      Dati Nuovo Cliente
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome *</Label>
                        <Input value={newCliente.nome} onChange={e => setNewCliente({...newCliente, nome: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cognome *</Label>
                        <Input value={newCliente.cognome} onChange={e => setNewCliente({...newCliente, cognome: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email *</Label>
                        <Input type="email" value={newCliente.email} onChange={e => setNewCliente({...newCliente, email: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Password *</Label>
                        <Input type="text" value={newCliente.password} onChange={e => setNewCliente({...newCliente, password: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cellulare</Label>
                        <Input value={newCliente.cellulare} onChange={e => setNewCliente({...newCliente, cellulare: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Codice Fiscale</Label>
                        <Input value={newCliente.codice_fiscale} onChange={e => setNewCliente({...newCliente, codice_fiscale: e.target.value.toUpperCase()})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Data Nascita</Label>
                        <Input type="date" value={newCliente.data_nascita} onChange={e => setNewCliente({...newCliente, data_nascita: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Luogo Nascita</Label>
                        <Input value={newCliente.luogo_nascita} onChange={e => setNewCliente({...newCliente, luogo_nascita: e.target.value})} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Indirizzo</Label>
                        <Input value={newCliente.indirizzo} onChange={e => setNewCliente({...newCliente, indirizzo: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Comune</Label>
                        <Input value={newCliente.comune} onChange={e => setNewCliente({...newCliente, comune: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Provincia</Label>
                        <Input value={newCliente.provincia} onChange={e => setNewCliente({...newCliente, provincia: e.target.value.toUpperCase()})} maxLength={2} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">N. Patente</Label>
                        <Input value={newCliente.patente_numero} onChange={e => setNewCliente({...newCliente, patente_numero: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Scadenza Patente</Label>
                        <Input type="date" value={newCliente.patente_data_scadenza} onChange={e => setNewCliente({...newCliente, patente_data_scadenza: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Carta di Credito */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" />
                Carta di Credito (opzionale)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Circuito</Label>
                  <Input value={cartaCredito.circuito} onChange={e => setCartaCredito({...cartaCredito, circuito: e.target.value})} placeholder="Visa, Mastercard..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Intestatario</Label>
                  <Input value={cartaCredito.intestatario} onChange={e => setCartaCredito({...cartaCredito, intestatario: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Numero Carta</Label>
                  <Input value={cartaCredito.numero} onChange={e => setCartaCredito({...cartaCredito, numero: e.target.value.replace(/\D/g, '').slice(0,16)})} className="font-mono" maxLength={16} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Scadenza</Label>
                  <div className="flex gap-2">
                    <Input value={cartaCredito.scadenza_mese} onChange={e => setCartaCredito({...cartaCredito, scadenza_mese: e.target.value})} placeholder="MM" maxLength={2} className="w-16" />
                    <span className="self-center">/</span>
                    <Input value={cartaCredito.scadenza_anno} onChange={e => setCartaCredito({...cartaCredito, scadenza_anno: e.target.value})} placeholder="AA" maxLength={2} className="w-16" />
                  </div>
                </div>
              </div>
            </div>

            {/* Opzioni Aggiuntive */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3">Opzioni Aggiuntive</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Chilometraggio</Label>
                  <Select 
                    value={newBooking.km_inclusi || 'standard'} 
                    onValueChange={(v) => setNewBooking({...newBooking, km_inclusi: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Km standard (come da veicolo)</SelectItem>
                      <SelectItem value="illimitati">Km ILLIMITATI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Note Admin (interne)</Label>
                  <textarea 
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    rows={2}
                    value={newBooking.note_admin || ''}
                    onChange={e => setNewBooking({...newBooking, note_admin: e.target.value})}
                    placeholder="Note interne per lo staff..."
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowNewBookingDialog(false); resetNewBookingForm(); }}>
                Annulla
              </Button>
              <Button onClick={handleCreateBooking} disabled={savingBooking} className="bg-blue-600 hover:bg-blue-700">
                {savingBooking ? 'Creazione...' : 'Crea Prenotazione'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Dettaglio Giorno */}
      <Dialog open={showDayDetailDialog} onOpenChange={setShowDayDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              {dayDetailDate && dayDetailDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setShowDayDetailDialog(false); dayDetailDate && openNewBookingDialog(dayDetailDate); }}
                className="text-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" /> Nuova Prenotazione
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setShowDayDetailDialog(false); dayDetailDate && openNoteDialog(dayDetailDate); }}
                className="text-yellow-600"
              >
                <StickyNote className="w-4 h-4 mr-1" /> Aggiungi Nota
              </Button>
            </div>
            
            {/* Prenotazioni del giorno */}
            {dayDetailDate && getBookingsForDate(dayDetailDate).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Car className="w-4 h-4" /> Prenotazioni
                </h4>
                {getBookingsForDate(dayDetailDate).map(booking => {
                  const isBlocco = isBloccoCalendario(booking);
                  const colors = isBlocco ? STATUS_COLORS.blocco : getBookingColor(booking.id);
                  const canCancel = booking.status !== 'annullata' && booking.status !== 'chiuso';
                  return (
                    <div key={booking.id} className={`p-3 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {booking.veicolo_marca} {booking.veicolo_modello}
                            {isBlocco && <span className="ml-2 text-orange-600">🔒 BLOCCO CALENDARIO</span>}
                          </p>
                          <p className="text-sm text-slate-600">Targa: {booking.veicolo_targa}</p>
                          {!isBlocco && (
                            <p className="text-sm text-slate-600">Cliente: {booking.cliente_nome || 'Non specificato'}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Dal {formatDateIT(booking.data_ritiro)} {booking.ora_ritiro || '09:00'}
                            <br />
                            Al {formatDateIT(booking.data_riconsegna)} {booking.ora_riconsegna || '18:00'}
                          </p>
                          {booking.note_admin && (
                            <p className="text-xs text-blue-600 mt-1 italic">📝 {booking.note_admin}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${colors.bg} ${colors.text}`}>
                            {isBlocco ? 'blocco' : booking.status?.replace('_', ' ')}
                          </Badge>
                          <div className="flex gap-1 flex-wrap justify-end">
                            <Link to={`/admin/prenotazioni/${booking.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit2 className="w-3 h-3 mr-1" /> Modifica
                              </Button>
                            </Link>
                            {canCancel && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                onClick={() => handleAnnullaPrenotazione(booking.id)}
                              >
                                <X className="w-3 h-3 mr-1" /> Annulla
                              </Button>
                            )}
                            {/* Pulsante Elimina per TUTTI gli eventi */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleEliminaPrenotazione(booking.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Elimina
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Note del giorno */}
            {dayDetailDate && getNotesForDate(dayDetailDate).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <StickyNote className="w-4 h-4" /> Note
                </h4>
                {getNotesForDate(dayDetailDate).map(n => {
                  const nColors = getNoteColor(n.id);
                  return (
                  <div key={n.id} className={`p-3 rounded-lg border-l-4 ${nColors.bg} ${nColors.border}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-semibold ${nColors.text}`}>{n.titolo}</p>
                        {n.contenuto && <p className="text-sm text-slate-600 mt-1">{n.contenuto}</p>}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteNote(n.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
            
            {/* Messaggio se vuoto */}
            {dayDetailDate && getBookingsForDate(dayDetailDate).length === 0 && getNotesForDate(dayDetailDate).length === 0 && (
              <p className="text-center text-slate-500 py-8">Nessun evento per questa data</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Nota Admin */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-yellow-600" />
              Nuova Nota
              {noteData.data && (
                <span className="text-sm font-normal text-slate-500">
                  - {formatDateIT(noteData.data)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Titolo *</Label>
              <Input 
                value={noteData.titolo} 
                onChange={e => setNoteData({...noteData, titolo: e.target.value})}
                placeholder="Es: Chiamare cliente, Manutenzione..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contenuto (opzionale)</Label>
              <Textarea 
                value={noteData.contenuto} 
                onChange={e => setNoteData({...noteData, contenuto: e.target.value})}
                placeholder="Dettagli aggiuntivi..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Colore</Label>
              <div className="flex gap-2">
                {['gray', 'yellow', 'red', 'green', 'blue'].map(c => (
                  <button
                    key={c}
                    onClick={() => setNoteData({...noteData, colore: c})}
                    className={`w-8 h-8 rounded-full border-2 ${
                      noteData.colore === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                    } ${
                      c === 'gray' ? 'bg-gray-400' :
                      c === 'yellow' ? 'bg-yellow-400' :
                      c === 'red' ? 'bg-red-400' :
                      c === 'green' ? 'bg-green-400' :
                      'bg-blue-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Annulla
              </Button>
              <Button onClick={handleSaveNote} className="bg-yellow-500 hover:bg-yellow-600">
                Salva Nota
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
