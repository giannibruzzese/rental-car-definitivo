import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Mail, Phone, MapPin, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    license_number: user?.license_number || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateProfile(formData);
      toast.success('Profilo aggiornato con successo');
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="profile-page">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Il mio Profilo
        </h2>
        <p className="text-slate-500">Gestisci le tue informazioni personali</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Informazioni Personali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="email"
                  value={user?.email || ''} 
                  disabled 
                  className="pl-10 bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-500">L'email non può essere modificata</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-10"
                  data-testid="profile-name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+39 333 1234567"
                  className="pl-10"
                  data-testid="profile-phone-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Via Roma 123, Milano"
                  className="pl-10"
                  data-testid="profile-address-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">Numero Patente</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="license"
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  placeholder="AB1234567X"
                  className="pl-10"
                  data-testid="profile-license-input"
                />
              </div>
              <p className="text-xs text-slate-500">Necessario per la stipula dei contratti</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={saving}
              data-testid="save-profile-btn"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvataggio...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salva Modifiche
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
