import React, { useState } from 'react';
import { X, Search, MapPin, Check, Shield, Navigation, Map } from 'lucide-react';
import { Delegation } from '../types';
import { userZoneService } from '../services/userZoneService';

interface ZoneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  delegations: Delegation[];
  onZoneSelected: (delegation: Delegation) => void;
  onSelectOnMap?: () => void;
}

export const ZoneSelectionModal: React.FC<ZoneSelectionModalProps> = ({
  isOpen,
  onClose,
  delegations,
  onZoneSelected,
  onSelectOnMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredDelegations = delegations.filter(del =>
    del.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    del.governorate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (delegation: Delegation) => {
    setSelectedZoneId(delegation.id);
  };

  const handleRequestGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatusMsg("La géolocalisation n'est pas supportée. Veuillez choisir dans la liste ci-dessous.");
      return;
    }

    setIsLocating(true);
    setLocationStatusMsg("Demande de localisation GPS en cours...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const matchedDelegation = userZoneService.findDelegationByLocation(latitude, longitude, delegations);

        if (matchedDelegation) {
          userZoneService.setUserZone(matchedDelegation.id, delegations);
          onZoneSelected(matchedDelegation);
          onClose();
        } else {
          setLocationStatusMsg("Position GPS reçue mais aucune zone correspondante. Choisissez dans la liste.");
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation error:", error);
        setLocationStatusMsg("Accès géolocalisation refusé ou indisponible. Vous pouvez choisir sur la carte ou dans la liste.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleConfirm = () => {
    if (selectedZoneId === null) return;
    const delegation = delegations.find(d => d.id === selectedZoneId);
    if (delegation) {
      userZoneService.setUserZone(delegation.id, delegations);
      onZoneSelected(delegation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Sélectionnez votre zone</h3>
              <p className="text-xs text-slate-400">Choisissez la délégation où vous habitez</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleRequestGpsLocation}
              disabled={isLocating}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <div className="flex flex-col items-center leading-tight">
                <span>{isLocating ? "Localisation..." : "Position GPS"}</span>
                <span className="text-[9px] font-bold opacity-85">تحديد موقعي التلقائي</span>
              </div>
            </button>

            {onSelectOnMap && (
              <button
                onClick={() => {
                  onClose();
                  onSelectOnMap();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <Map className="w-4 h-4 text-amber-400" />
                <div className="flex flex-col items-center leading-tight">
                  <span>Sur la Carte</span>
                  <span className="text-[9px] font-bold opacity-80 text-amber-300">تحديد على الخريطة</span>
                </div>
              </button>
            )}
          </div>

          {locationStatusMsg && (
            <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-center">
              {locationStatusMsg}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une zone (ex: Ariana, Bardo, Sousse)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Zone List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredDelegations.map(del => (
            <button
              key={del.id}
              onClick={() => handleSelect(del)}
              className={`w-full p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
                selectedZoneId === del.id
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-4 h-4 ${
                  selectedZoneId === del.id ? 'text-amber-400' : 'text-slate-400'
                }`} />
                <div>
                  <p className="text-sm font-bold text-slate-100">{del.name}</p>
                  <p className="text-xs text-slate-400">{del.governorate}</p>
                </div>
              </div>
              {selectedZoneId === del.id && (
                <Check className="w-5 h-5 text-amber-400" />
              )}
            </button>
          ))}

          {filteredDelegations.length === 0 && (
            <div className="text-center text-xs text-slate-500 py-8">
              Aucune zone trouvée
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedZoneId === null}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-colors shadow-lg ${
              selectedZoneId !== null
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Confirmer ma zone
          </button>
        </div>
      </div>
    </div>
  );
};

