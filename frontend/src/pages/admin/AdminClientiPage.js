import { useState, useEffect } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Search, Mail, Phone, MapPin, Key, Eye, EyeOff, History, FileText, Edit, Trash2, Plus, UserPlus, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminClientiPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [editPasswordDialog, setEditPasswordDialog] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Nuovo cliente
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [savingCliente, setSavingCliente] = useState(false);
  const [nuovoCliente, setNuovoCliente] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    cellulare: '',
    data_nascita: '',
    luogo_nascita: '',
    codice_fiscale: '',
    indirizzo: '',
    comune: '',
    provincia: '',
    cap: '',
    stato: 'Italia',
    patente: {
      numero: '',
      categoria: 'B',
      rilasciata_da: '',
      data_rilascio: '',
      data_scadenza: ''
    },
    // Carta di credito (opzionale)
    carta_credito: {
      circuito: '',
      intestatario: '',
      numero: '',
      scadenza_mese: '',
      scadenza_anno: ''
    }
  });

  const fetchClienti = async () => {
    try {
      const data = await api.get('/clienti', token);
      setClienti(data);
    } catch (error) {
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClienti();
  }, [token]);

  // Helper per verificare stato patente
  const getPatentStatus = (cliente) => {
    const scadenza = cliente.patente?.data_scadenza || cliente.patente_data_scadenza;
    if (!scadenza) return { status: 'unknown', message: 'Scadenza non inserita' };
    
    const oggi = new Date();
    const dataScadenza = new Date(scadenza);
    const diffDays = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', message: `Scaduta da ${Math.abs(diffDays)} giorni`, color: 'text-red-600 bg-red-50' };
    } else if (diffDays <= 30) {
      return { status: 'expiring', message: `Scade tra ${diffDays} giorni`, color: 'text-orange-600 bg-orange-50' };
    } else if (diffDays <= 90) {
      return { status: 'warning', message: `Scade tra ${diffDays} giorni`, color: 'text-yellow-600 bg-yellow-50' };
    }
    return { status: 'valid', message: 'Valida', color: 'text-green-600 bg-green-50' };
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri');
      return;
    }
    try {
      await api.put(`/clienti/${editPasswordDialog.id}`, { password_chiaro: newPassword }, token);
      toast.success('Password impostata con successo');
      setEditPasswordDialog(null);
      setNewPassword('');
      fetchClienti();
    } catch (error) {
      toast.error('Errore nel salvataggio');
    }
  };

  const handleDeleteCliente = async (cliente) => {
    const conferma = window.confirm(
      `Sei sicuro di voler eliminare il cliente ${cliente.nome} ${cliente.cognome}?\n\n` +
      `⚠️ Questa azione:\n` +
      `• ELIMINERÀ tutte le prenotazioni FUTURE del cliente\n` +
      `• ELIMINERÀ tutti i contratti FUTURI del cliente\n` +
      `• Manterrà lo storico delle prenotazioni passate\n` +
      `• Impedirà al cliente di effettuare il login`
    );
    
    if (!conferma) return;
    
    try {
      const result = await api.delete(`/clienti/${cliente.id}`, token);
      toast.success(`Cliente eliminato. ${result.prenotazioni_eliminate} prenotazioni e ${result.contratti_eliminati} contratti futuri eliminati.`);
      fetchClienti();
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
    }
  };

  // Helper per formattare data in italiano (gg/mm/aaaa)
  const formatDateIT = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Reset form nuovo cliente
  const resetNuovoCliente = () => {
    setNuovoCliente({
      nome: '',
      cognome: '',
      email: '',
      password: '',
      cellulare: '',
      data_nascita: '',
      luogo_nascita: '',
      codice_fiscale: '',
      indirizzo: '',
      comune: '',
      provincia: '',
      cap: '',
      stato: 'Italia',
      patente: {
        numero: '',
        categoria: 'B',
        rilasciata_da: '',
        data_rilascio: '',
        data_scadenza: ''
      },
      carta_credito: {
        circuito: '',
        intestatario: '',
        numero: '',
        scadenza_mese: '',
        scadenza_anno: ''
      }
    });
  };

  // Crea nuovo cliente
  const handleCreateCliente = async () => {
    // Validazione base
    if (!nuovoCliente.nome || !nuovoCliente.cognome || !nuovoCliente.email || !nuovoCliente.password) {
      toast.error('Compila almeno: Nome, Cognome, Email e Password');
      return;
    }
    if (nuovoCliente.password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri');
      return;
    }
    
    setSavingCliente(true);
    try {
      await api.post('/clienti/admin-create', nuovoCliente, token);
      toast.success('Cliente creato con successo!');
      setCreateDialogOpen(false);
      resetNuovoCliente();
      fetchClienti();
    } catch (error) {
      toast.error(error.message || 'Errore nella creazione');
    } finally {
      setSavingCliente(false);
    }
  };

  const filtered = clienti.filter(c => 
    `${c.nome} ${c.cognome} ${c.email} ${c.codice_fiscale} ${c.cellulare}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="clienti-page">
      <div>
        <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Gestione Clienti
        </h2>
        <p className="text-sm text-slate-500">Visualizza tutti i clienti registrati</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Cerca per nome, email, CF o telefono..." 
                className="pl-10" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Crea Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Nessun cliente trovato</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Credenziali Accesso</TableHead>
                    <TableHead>Codice Fiscale</TableHead>
                    <TableHead>Residenza</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.nome} {c.cognome}</p>
                          <p className="text-xs text-slate-500">Nato/a: {formatDateIT(c.data_nascita)} a {c.luogo_nascita}</p>
                          <p className="text-xs text-slate-500 mt-1"><Phone className="w-3 h-3 inline mr-1" />{c.cellulare}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" /> 
                            <span className="font-medium">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Key className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-sm bg-yellow-100 px-2 py-0.5 rounded">
                              {showPasswords[c.id] ? (c.password_chiaro || 'Non disponibile') : '••••••••'}
                            </span>
                            <button
                              onClick={() => setShowPasswords(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title={showPasswords[c.id] ? "Nascondi password" : "Mostra password"}
                            >
                              {showPasswords[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setEditPasswordDialog(c); setNewPassword(c.password_chiaro || ''); }}
                              className="text-orange-600 hover:text-orange-800 p-1"
                              title="Modifica password"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{c.codice_fiscale}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{c.indirizzo}</p>
                          <p className="text-slate-500">{c.cap} {c.comune} ({c.provincia})</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{c.patente?.numero || c.patente_numero}</p>
                          <p className="text-slate-500">Cat: {c.patente?.categoria || c.patente_categoria || 'B'} • Scad: {formatDateIT(c.patente?.data_scadenza || c.patente_data_scadenza)}</p>
                          {/* Alert patente scaduta/in scadenza */}
                          {(() => {
                            const patentStatus = getPatentStatus(c);
                            if (patentStatus.status === 'expired' || patentStatus.status === 'expiring') {
                              return (
                                <div className={`mt-1 px-2 py-1 rounded text-xs flex items-center gap-1 ${patentStatus.color}`}>
                                  <AlertTriangle className="w-3 h-3" />
                                  {patentStatus.message}
                                </div>
                              );
                            } else if (patentStatus.status === 'warning') {
                              return (
                                <div className={`mt-1 px-2 py-1 rounded text-xs flex items-center gap-1 ${patentStatus.color}`}>
                                  <AlertTriangle className="w-3 h-3" />
                                  {patentStatus.message}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/clienti/${c.id}/storico`)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <History className="w-4 h-4 mr-1" /> Storico
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCliente(c)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Modifica Password */}
      <Dialog open={!!editPasswordDialog} onOpenChange={() => { setEditPasswordDialog(null); setNewPassword(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Password Cliente</DialogTitle>
          </DialogHeader>
          {editPasswordDialog && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  Cliente: <strong>{editPasswordDialog.nome} {editPasswordDialog.cognome}</strong>
                </p>
                <p className="text-sm text-slate-500">
                  Email: {editPasswordDialog.email}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Nuova Password (visibile in chiaro)</Label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Inserisci la nuova password..."
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">La password sarà visibile nella lista clienti</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setEditPasswordDialog(null); setNewPassword(''); }}>
                  Annulla
                </Button>
                <Button onClick={handleSetPassword} className="bg-blue-600 hover:bg-blue-700">
                  Salva Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Crea Nuovo Cliente */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetNuovoCliente(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Crea Nuovo Cliente
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Dati di Accesso */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 border-b pb-1">Credenziali di Accesso</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={nuovoCliente.email}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, email: e.target.value})}
                    placeholder="cliente@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Password *</Label>
                  <Input 
                    type="text"
                    value={nuovoCliente.password}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, password: e.target.value})}
                    placeholder="Minimo 6 caratteri"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Dati Anagrafici */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 border-b pb-1">Dati Anagrafici</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nome *</Label>
                  <Input 
                    value={nuovoCliente.nome}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, nome: e.target.value})}
                    placeholder="Mario"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cognome *</Label>
                  <Input 
                    value={nuovoCliente.cognome}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, cognome: e.target.value})}
                    placeholder="Rossi"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Data di Nascita</Label>
                  <Input 
                    type="date"
                    value={nuovoCliente.data_nascita}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, data_nascita: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Luogo di Nascita</Label>
                  <Input 
                    value={nuovoCliente.luogo_nascita}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, luogo_nascita: e.target.value})}
                    placeholder="Roma"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Codice Fiscale</Label>
                  <Input 
                    value={nuovoCliente.codice_fiscale}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, codice_fiscale: e.target.value.toUpperCase()})}
                    placeholder="RSSMRA85M01H501Z"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cellulare</Label>
                  <Input 
                    value={nuovoCliente.cellulare}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, cellulare: e.target.value})}
                    placeholder="+39 333 1234567"
                  />
                </div>
              </div>
            </div>

            {/* Residenza */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 border-b pb-1">Residenza</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Indirizzo</Label>
                  <Input 
                    value={nuovoCliente.indirizzo}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, indirizzo: e.target.value})}
                    placeholder="Via Roma, 123"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Comune</Label>
                  <Input 
                    value={nuovoCliente.comune}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, comune: e.target.value})}
                    placeholder="Roma"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Provincia</Label>
                  <Input 
                    value={nuovoCliente.provincia}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, provincia: e.target.value.toUpperCase()})}
                    placeholder="RM"
                    maxLength={2}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label>CAP</Label>
                  <Input 
                    value={nuovoCliente.cap}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, cap: e.target.value})}
                    placeholder="00100"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Stato</Label>
                  <Input 
                    value={nuovoCliente.stato}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, stato: e.target.value})}
                    placeholder="Italia"
                  />
                </div>
              </div>
            </div>

            {/* Patente */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 border-b pb-1">Patente di Guida</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Numero Patente</Label>
                  <Input 
                    value={nuovoCliente.patente.numero}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, patente: {...nuovoCliente.patente, numero: e.target.value.toUpperCase()}})}
                    placeholder="AB1234567X"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Categoria</Label>
                  <Select 
                    value={nuovoCliente.patente.categoria} 
                    onValueChange={(v) => setNuovoCliente({...nuovoCliente, patente: {...nuovoCliente.patente, categoria: v}})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="BE">BE</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Rilasciata da</Label>
                  <Input 
                    value={nuovoCliente.patente.rilasciata_da}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, patente: {...nuovoCliente.patente, rilasciata_da: e.target.value}})}
                    placeholder="MCTC Roma"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Data Rilascio</Label>
                  <Input 
                    type="date"
                    value={nuovoCliente.patente.data_rilascio}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, patente: {...nuovoCliente.patente, data_rilascio: e.target.value}})}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Data Scadenza</Label>
                  <Input 
                    type="date"
                    value={nuovoCliente.patente.data_scadenza}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, patente: {...nuovoCliente.patente, data_scadenza: e.target.value}})}
                  />
                </div>
              </div>
            </div>

            {/* Carta di Credito (Opzionale) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 border-b pb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Carta di Credito 
                <span className="text-xs font-normal text-slate-500">(opzionale - per garanzia)</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Circuito</Label>
                  <Select 
                    value={nuovoCliente.carta_credito.circuito || "none"} 
                    onValueChange={(v) => setNuovoCliente({...nuovoCliente, carta_credito: {...nuovoCliente.carta_credito, circuito: v === "none" ? "" : v}})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona circuito" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuno</SelectItem>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                      <SelectItem value="American Express">American Express</SelectItem>
                      <SelectItem value="Bancomat">Bancomat/PagoBancomat</SelectItem>
                      <SelectItem value="Postepay">Postepay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Intestatario</Label>
                  <Input 
                    value={nuovoCliente.carta_credito.intestatario}
                    onChange={(e) => setNuovoCliente({...nuovoCliente, carta_credito: {...nuovoCliente.carta_credito, intestatario: e.target.value.toUpperCase()}})}
                    placeholder="MARIO ROSSI"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Numero Carta</Label>
                  <Input 
                    value={nuovoCliente.carta_credito.numero}
                    onChange={(e) => {
                      // Format: only numbers, max 19 chars
                      const val = e.target.value.replace(/\D/g, '').substring(0, 19);
                      setNuovoCliente({...nuovoCliente, carta_credito: {...nuovoCliente.carta_credito, numero: val}});
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Scadenza</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={nuovoCliente.carta_credito.scadenza_mese} 
                      onValueChange={(v) => setNuovoCliente({...nuovoCliente, carta_credito: {...nuovoCliente.carta_credito, scadenza_mese: v}})}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => String(i+1).padStart(2, '0')).map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="self-center">/</span>
                    <Select 
                      value={nuovoCliente.carta_credito.scadenza_anno} 
                      onValueChange={(v) => setNuovoCliente({...nuovoCliente, carta_credito: {...nuovoCliente.carta_credito, scadenza_anno: v}})}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="AAAA" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 15}, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => { setCreateDialogOpen(false); resetNuovoCliente(); }}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleCreateCliente}
                disabled={savingCliente}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {savingCliente ? 'Creazione...' : 'Crea Cliente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
