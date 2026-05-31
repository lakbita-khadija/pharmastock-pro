// src/pages/commandes/CommandeModal.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { commandeAPI, fournisseurAPI, medicamentAPI } from '../../api/services';
import { X, Plus, Trash2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommandeModal({ onClose, onSuccess }) {
  const [fournisseurId, setFournisseurId] = useState('');
  const [lignes, setLignes] = useState([{ medicamentId: '', quantite: 1, prixUnitaire: '' }]);

  const { data: fournisseurs } = useQuery({
    queryKey: ['fournisseurs-all'],
    queryFn: () => fournisseurAPI.getAll().then(r => r.data?.content || r.data),
  });
  const { data: medicaments } = useQuery({
    queryKey: ['medicaments-all'],
    queryFn: () => medicamentAPI.getAll({ size: 500 }).then(r => r.data?.content || r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => commandeAPI.create(data),
    onSuccess: () => { toast.success('Commande créée avec succès.'); onSuccess(); },
    onError: () => toast.error('Erreur lors de la création.'),
  });

  const addLigne = () =>
    setLignes(p => [...p, { medicamentId: '', quantite: 1, prixUnitaire: '' }]);

  const removeLigne = (i) =>
    setLignes(p => p.filter((_, idx) => idx !== i));

  const updateLigne = (i, field, val) =>
    setLignes(p => p.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const total = lignes.reduce((s, l) =>
    s + (parseFloat(l.prixUnitaire) || 0) * (parseInt(l.quantite) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fournisseurId) { toast.error('Sélectionnez un fournisseur.'); return; }
    const validLignes = lignes.filter(l => l.medicamentId && l.quantite > 0);
    if (!validLignes.length) { toast.error('Ajoutez au moins un médicament.'); return; }
    mutation.mutate({ fournisseurId: parseInt(fournisseurId), lignes: validLignes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Truck size={17} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Nouvelle commande fournisseur</h3>
              <p className="text-xs text-slate-400">Saisissez les articles à commander</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-slate-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Fournisseur */}
          <div className="form-group">
            <label className="label">Fournisseur *</label>
            <select className="select" value={fournisseurId} onChange={e => setFournisseurId(e.target.value)} required>
              <option value="">Choisir un fournisseur…</option>
              {(fournisseurs || []).map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Articles à commander</label>
              <button type="button" onClick={addLigne} className="btn-secondary text-xs py-1.5 px-3">
                <Plus size={13} /> Ajouter un article
              </button>
            </div>

            <div className="space-y-2">
              {lignes.map((ligne, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <select
                    className="select flex-1 text-sm"
                    value={ligne.medicamentId}
                    onChange={e => updateLigne(i, 'medicamentId', e.target.value)}
                  >
                    <option value="">Choisir un médicament…</option>
                    {(medicaments || []).map(m => (
                      <option key={m.id} value={m.id}>{m.nomCommercial} — {m.dci}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qté"
                    className="input w-20 text-sm text-center"
                    value={ligne.quantite}
                    onChange={e => updateLigne(i, 'quantite', e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Prix unitaire"
                    className="input w-32 text-sm"
                    value={ligne.prixUnitaire}
                    onChange={e => updateLigne(i, 'prixUnitaire', e.target.value)}
                  />
                  <button type="button" onClick={() => removeLigne(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            {total > 0 && (
              <div className="flex justify-end mt-3">
                <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
                  <span className="text-sm text-primary-700 font-semibold">
                    Total HT estimé : {total.toFixed(2)} DH
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Création…' : 'Créer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
