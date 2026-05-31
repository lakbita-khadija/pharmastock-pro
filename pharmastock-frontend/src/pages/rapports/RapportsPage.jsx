// src/pages/rapports/RapportsPage.jsx
import React, { useState } from 'react';
import { rapportAPI } from '../../api/services';
import { BarChart2, Download, FileText, Calendar, Package, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const RAPPORTS = [
  {
    id:    'stock',
    label: 'Rapport de stock',
    desc:  'État complet du stock avec quantités, valeurs et statuts par médicament.',
    icon:  Package,
    color: 'bg-primary-100 text-primary-600',
    fn:    rapportAPI.stock,
    hasDates: false,
  },
  {
    id:    'ventes',
    label: 'Rapport des ventes',
    desc:  'Analyse des ventes sur une période : chiffre d\'affaires, top produits, modes de paiement.',
    icon:  TrendingUp,
    color: 'bg-emerald-100 text-emerald-600',
    fn:    rapportAPI.ventes,
    hasDates: true,
  },
  {
    id:    'peremptions',
    label: 'Rapport des péremptions',
    desc:  'Liste des médicaments et lots dont la date d\'expiration approche ou est dépassée.',
    icon:  AlertTriangle,
    color: 'bg-amber-100 text-amber-600',
    fn:    rapportAPI.peremptions,
    hasDates: true,
  },
  {
    id:    'mouvements',
    label: 'Rapport des mouvements',
    desc:  'Historique complet des entrées, sorties et retours sur une période donnée.',
    icon:  RefreshCw,
    color: 'bg-violet-100 text-violet-600',
    fn:    rapportAPI.mouvements,
    hasDates: true,
  },
];

export default function RapportsPage() {
  const [loading, setLoading] = useState({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const handleDownload = async (rapport) => {
    setLoading(p => ({ ...p, [rapport.id]: true }));
    try {
      const params = rapport.hasDates ? { dateFrom, dateTo } : {};
      const data = await rapport.fn(params);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `rapport-${rapport.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Rapport "${rapport.label}" téléchargé.`);
    } catch {
      toast.error('Erreur lors de la génération du rapport.');
    } finally {
      setLoading(p => ({ ...p, [rapport.id]: false }));
    }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h2 className="page-title">Rapports & Analyses</h2>
        <p className="page-subtitle">Générés en PDF — données en temps réel</p>
      </div>

      {/* Sélection de période globale */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Calendar size={16} className="text-slate-500 shrink-0" />
          <span className="text-sm font-medium text-slate-600">Période (pour les rapports datés) :</span>
          <input type="date" className="input text-sm max-w-[160px]"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-slate-400">→</span>
          <input type="date" className="input text-sm max-w-[160px]"
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Cartes rapports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {RAPPORTS.map((rapport) => {
          const Icon = rapport.icon;
          const isLoading = loading[rapport.id];
          return (
            <div key={rapport.id} className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', rapport.color)}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{rapport.label}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rapport.desc}</p>
                </div>
              </div>

              {rapport.hasDates && (!dateFrom || !dateTo) && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Sélectionnez une période ci-dessus pour ce rapport.
                </p>
              )}

              <button
                onClick={() => handleDownload(rapport)}
                disabled={isLoading || (rapport.hasDates && (!dateFrom || !dateTo))}
                className="btn-primary self-start"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Génération…
                  </span>
                ) : (
                  <><Download size={15} /> Télécharger PDF</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
