// src/pages/commandes/ReceptionModal.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { commandeAPI } from '../../api/services';
import { X, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionModal({ commande, onClose, onSuccess }) {
  // Initialiser les lignes avec les quantités commandées
  const [lignes, setLignes] = useState(
    commande.lignes.map(l => ({
      ligneCommandeId: l.id,
      medicamentNom:   l.medicament?.nomCommercial || 'Médicament',
      medicamentId:    l.medicament?.id,
      quantiteCommandee: l.quantiteCommandee,
      quantiteRecue:   l.quantiteCommandee, // pré-rempli
      numeroLot:       '',
      dateExpiration:  '',
      prixAchatReel:   l.prixUnitaire || '',
    }))
  );

  const updateLigne = (i, field, val) =>
    setLignes(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const mutation = useMutation({
    mutationFn: (data) => commandeAPI.receptionner(data),
    onSuccess: () => {
      toast.success('Livraison réceptionnée. Stock mis à jour.');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la réception.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vérifier que tous les lots sont saisis
    const incomplete = lignes.filter(l => !l.numeroLot || !l.dateExpiration);
    if (incomplete.length > 0) {
      toast.error(`Saisissez le numéro de lot et la date d'expiration pour tous les articles.`);
      return;
    }
    mutation.mutate({
      commandeId: commande.id,
      lignes: lignes.map(l => ({
        ligneCommandeId: l.ligneCommandeId,
        quantiteRecue:   parseInt(l.quantiteRecue),
        numeroLot:       l.numeroLot,
        dateExpiration:  l.dateExpiration,
        prixAchatReel:   parseFloat(l.prixAchatReel) || null,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package size={17} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Réception de livraison</h3>
              <p className="text-xs text-slate-400">
                Commande {commande.numeroCommande} — {commande.fournisseur?.nom}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-slate-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Alerte traçabilité */}
          <div className="alert-warning">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Traçabilité obligatoire :</strong> Le numéro de lot et la date d'expiration 
              sont requis pour chaque médicament reçu. Ces informations permettent le suivi FEFO 
              et les rappels de lot éventuels.
            </p>
          </div>

          {/* Lignes de réception */}
          <div className="space-y-4">
            {lignes.map((ligne, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="font-semibold text-slate-800 text-sm mb-3">
                  {ligne.medicamentNom}
                  <span className="text-slate-400 font-normal text-xs ml-2">
                    — Commandé : {ligne.quantiteCommandee} unités
                  </span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="form-group">
                    <label className="label">Qté reçue *</label>
                    <input type="number" min="0" max={ligne.quantiteCommandee}
                      className="input text-sm"
                      value={ligne.quantiteRecue}
                      onChange={e => updateLigne(i, 'quantiteRecue', e.target.value)} />
                  </div>
                  <div className="form-group col-span-1">
                    <label className="label">N° de lot *</label>
                    <input className={`input text-sm font-mono ${!ligne.numeroLot ? 'border-amber-300' : ''}`}
                      placeholder="LOT-2024-XXX"
                      value={ligne.numeroLot}
                      onChange={e => updateLigne(i, 'numeroLot', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Date expiration *</label>
                    <input type="date"
                      className={`input text-sm ${!ligne.dateExpiration ? 'border-amber-300' : ''}`}
                      value={ligne.dateExpiration}
                      onChange={e => updateLigne(i, 'dateExpiration', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Prix achat réel (DH)</label>
                    <input type="number" step="0.01" className="input text-sm"
                      placeholder="0.00"
                      value={ligne.prixAchatReel}
                      onChange={e => updateLigne(i, 'prixAchatReel', e.target.value)} />
                  </div>
                </div>
                {(!ligne.numeroLot || !ligne.dateExpiration) && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={11} /> Numéro de lot et date d'expiration requis
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-success">
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Réception en cours…
                </span>
              ) : (
                <><Package size={15} /> Valider la réception</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
