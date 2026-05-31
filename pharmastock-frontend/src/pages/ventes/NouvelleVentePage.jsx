// src/pages/ventes/NouvelleVentePage.jsx
import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicamentAPI, venteAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Banknote, Check, ArrowLeft,
  AlertCircle, ScanLine, Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const MODES_PAIEMENT = [
  { value: 'ESPECES',  label: 'Espèces',    icon: Banknote },
  { value: 'CARTE',    label: 'Carte',       icon: CreditCard },
  { value: 'ASSURANCE',label: 'Assurance',  icon: Check },
];

export default function NouvelleVentePage() {
  const navigate    = useNavigate();
  const qc          = useQueryClient();
  const searchRef   = useRef(null);

  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [panier,    setPanier]    = useState([]);
  const [modePaie,  setModePaie]  = useState('ESPECES');
  const [montantDonne, setMontantDonne] = useState('');
  const [step,      setStep]      = useState('panier'); // 'panier' | 'paiement' | 'succes'
  const [venteCree, setVenteCree] = useState(null);

  // ── Recherche médicaments (debounce simple) ──
  const searchTimeout = useRef(null);
  const handleSearch = (val) => {
    setQuery(val);
    clearTimeout(searchTimeout.current);
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await medicamentAPI.search(val);
        setResults(data || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  // ── Ajouter au panier ──
  const addToCart = (med) => {
    setPanier(prev => {
      const idx = prev.findIndex(l => l.medicamentId === med.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantite: next[idx].quantite + 1 };
        return next;
      }
      return [...prev, {
        medicamentId: med.id,
        nomCommercial: med.nomCommercial,
        dci: med.dci,
        prixUnitaire: med.prixVenteTtc,
        quantite: 1,
        remise: 0,
        surOrdonnance: med.statutDispensation !== 'LIBRE',
      }];
    });
    setQuery('');
    setResults([]);
    searchRef.current?.focus();
  };

  // ── Modifier quantité ──
  const setQty = (medId, qty) => {
    if (qty <= 0) return removeFromCart(medId);
    setPanier(prev => prev.map(l => l.medicamentId === medId ? { ...l, quantite: qty } : l));
  };

  const removeFromCart = (medId) =>
    setPanier(prev => prev.filter(l => l.medicamentId !== medId));

  // ── Calculs ──
  const totalTTC = panier.reduce((sum, l) => {
    const base = l.prixUnitaire * l.quantite;
    const rem  = base * (l.remise / 100);
    return sum + base - rem;
  }, 0);

  const renduMonnaie = modePaie === 'ESPECES' && montantDonne
    ? parseFloat(montantDonne) - totalTTC
    : null;

  const surOrdonnance = panier.some(l => l.surOrdonnance);

  // ── Valider la vente ──
  const mutation = useMutation({
    mutationFn: (payload) => venteAPI.create(payload),
    onSuccess: (res) => {
      setVenteCree(res.data);
      setStep('succes');
      qc.invalidateQueries(['ventes']);
      qc.invalidateQueries(['dashboard-kpis']);
      qc.invalidateQueries(['alertes-count']);
      toast.success('Vente enregistrée avec succès !');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Erreur lors de la validation.';
      toast.error(msg);
    },
  });

  const validerVente = () => {
    if (panier.length === 0) { toast.error('Le panier est vide.'); return; }
    mutation.mutate({
      lignes: panier.map(l => ({
        medicamentId: l.medicamentId,
        quantite:     l.quantite,
        remise:       l.remise,
      })),
      modePaiement: modePaie,
      montantDonne: modePaie === 'ESPECES' ? parseFloat(montantDonne) || totalTTC : totalTTC,
    });
  };

  // ── Écran succès ──
  if (step === 'succes') {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="card p-10 text-center max-w-sm w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Vente enregistrée !</h3>
          <p className="text-sm text-slate-500 mb-1">
            N° {venteCree?.numeroVente}
          </p>
          <p className="text-2xl font-bold text-primary-600 mb-6">
            {Number(venteCree?.totalTtc).toFixed(2)} DH
          </p>
          {renduMonnaie !== null && renduMonnaie >= 0 && (
            <div className="alert-success mb-5 rounded-lg text-sm justify-center">
              Rendu monnaie : <strong>{renduMonnaie.toFixed(2)} DH</strong>
            </div>
          )}
          <div className="flex gap-3">
            <button
              className="btn-secondary flex-1"
              onClick={() => { setPanier([]); setStep('panier'); setVenteCree(null); setMontantDonne(''); }}
            >
              Nouvelle vente
            </button>
            <button className="btn-primary flex-1" onClick={() => navigate('/ventes')}>
              <Receipt size={15} />
              Historique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/ventes')} className="btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="page-title">Nouvelle vente</h2>
          <p className="page-subtitle">Interface de caisse — Règle FEFO appliquée automatiquement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Gauche : Recherche + Résultats ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Barre de recherche */}
          <div className="card p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                className="input pl-10 pr-10 text-sm"
                placeholder="Rechercher par nom, DCI ou scanner le code-barres…"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
              <ScanLine size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Résultats recherche */}
            {(results.length > 0 || searching) && (
              <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                {searching ? (
                  <div className="p-4 text-center text-sm text-slate-400">Recherche…</div>
                ) : results.map(med => (
                  <button
                    key={med.id}
                    onClick={() => addToCart(med)}
                    className="w-full flex items-center justify-between px-4 py-3
                               hover:bg-primary-50 border-b border-slate-100 last:border-0
                               text-left transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 text-sm group-hover:text-primary-700">
                        {med.nomCommercial}
                      </p>
                      <p className="text-xs text-slate-500">{med.dci} — {med.formegalenique} {med.dosage}</p>
                      {med.statutDispensation !== 'LIBRE' && (
                        <span className="badge badge-warning text-xs mt-1">
                          {med.statutDispensation === 'STUPEFIANT' ? 'Stupéfiant' : 'Ordonnance requise'}
                        </span>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-primary-600">{Number(med.prixVenteTtc).toFixed(2)} DH</p>
                      <Plus size={14} className="ml-auto text-slate-400 group-hover:text-primary-500" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alerte ordonnance */}
          {surOrdonnance && (
            <div className="alert-warning animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span className="text-sm">
                <strong>Ordonnance requise</strong> — un ou plusieurs médicaments de ce panier nécessitent une ordonnance valide.
              </span>
            </div>
          )}

          {/* Panier */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <ShoppingCart size={15} className="text-primary-600" />
                Panier ({panier.length} article{panier.length > 1 ? 's' : ''})
              </h3>
            </div>

            {panier.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                <ShoppingCart size={40} strokeWidth={1} className="mb-3" />
                <p className="text-sm">Le panier est vide</p>
                <p className="text-xs text-slate-400 mt-1">Recherchez un médicament ci-dessus</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {panier.map((ligne) => (
                  <div key={ligne.medicamentId} className="flex items-center gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {ligne.nomCommercial}
                      </p>
                      <p className="text-xs text-slate-500">{Number(ligne.prixUnitaire).toFixed(2)} DH / unité</p>
                    </div>

                    {/* Remise */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0" max="100"
                        value={ligne.remise}
                        onChange={e => setPanier(prev =>
                          prev.map(l => l.medicamentId === ligne.medicamentId
                            ? { ...l, remise: parseFloat(e.target.value) || 0 }
                            : l)
                        )}
                        className="w-14 input text-xs text-center py-1"
                        title="Remise %"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>

                    {/* Quantité */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQty(ligne.medicamentId, ligne.quantite - 1)}
                        className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center
                                   hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={ligne.quantite}
                        min="1"
                        onChange={e => setQty(ligne.medicamentId, parseInt(e.target.value) || 1)}
                        className="w-12 input text-center text-sm py-1"
                      />
                      <button
                        onClick={() => setQty(ligne.medicamentId, ligne.quantite + 1)}
                        className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center
                                   hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Sous-total */}
                    <div className="w-20 text-right">
                      <p className="font-bold text-slate-800 text-sm">
                        {(ligne.prixUnitaire * ligne.quantite * (1 - ligne.remise / 100)).toFixed(2)} DH
                      </p>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => removeFromCart(ligne.medicamentId)}
                      className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Droite : Récapitulatif & Paiement ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Récap total */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Récapitulatif</h3>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Sous-total</span>
              <span>{totalTTC.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>TVA</span>
              <span>Incluse</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between">
              <span className="font-bold text-slate-800">Total TTC</span>
              <span className="font-bold text-xl text-primary-600">{totalTTC.toFixed(2)} DH</span>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Mode de paiement</h3>
            <div className="grid grid-cols-3 gap-2">
              {MODES_PAIEMENT.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setModePaie(value)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all',
                    modePaie === value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </button>
              ))}
            </div>

            {/* Montant donné (espèces) */}
            {modePaie === 'ESPECES' && (
              <div className="mt-4 form-group animate-fade-in">
                <label className="label">Montant reçu (DH)</label>
                <input
                  type="number"
                  step="0.01"
                  min={totalTTC}
                  className="input"
                  placeholder={totalTTC.toFixed(2)}
                  value={montantDonne}
                  onChange={e => setMontantDonne(e.target.value)}
                />
                {renduMonnaie !== null && (
                  <div className={clsx(
                    'mt-2 p-3 rounded-lg text-sm font-semibold text-center',
                    renduMonnaie >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  )}>
                    Rendu monnaie : {renduMonnaie.toFixed(2)} DH
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bouton valider */}
          <button
            onClick={validerVente}
            disabled={panier.length === 0 || mutation.isPending}
            className="btn-success w-full py-3 justify-center text-base"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enregistrement…
              </span>
            ) : (
              <>
                <Check size={18} />
                Valider la vente — {totalTTC.toFixed(2)} DH
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/ventes')}
            className="btn-secondary w-full justify-center"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
