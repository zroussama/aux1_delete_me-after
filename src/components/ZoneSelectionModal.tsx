import React, { useState } from 'react';
import { X, Search, MapPin, Check, Shield } from 'lucide-react';
import { Delegation } from '../types';
import { userZoneService } from '../services/userZoneService';

interface ZoneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  delegations: Delegation[];
  onZoneSelected: (delegation: Delegation) => void;
}

export const ZoneSelectionModal: React.FC<ZoneSelectionModalProps> = ({
  isOpen,
  onClose,
  delegations,
  onZoneSelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredDelegations = delegations.filter(del =>
    del.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    del.governorate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (delegation: Delegation) => {
    setSelectedZoneId(delegation.id);
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
