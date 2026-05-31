// src/pages/medicaments/MedicamentDetail.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicamentAPI, stockAPI } from '../../api/services';
import { ArrowLeft, Pill, Package, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

const MOUVEMENT_COLORS = {
  ENTREE:  { cls: 'text-emerald-600 bg-emerald-50', icon: TrendingUp,   label: 'Entrée'  },
  SORTIE:  { cls: 'text-red-600 bg-red-50',         icon: TrendingDown, label: 'Sortie'  },
  RETOUR:  { cls: 'text-amber-600 bg-amber-50',     icon: TrendingUp,   label: 'Retour'  },
  AJUSTEMENT: { cls: 'text-blue-600 bg-blue-50',   icon: Package,      label: 'Ajustement' },
};

export default function MedicamentDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data: med, isLoading } = useQuery({
    queryKey: ['medicament', id],
    queryFn:  () => medicamentAPI.getById(id).then(r => r.data),
  });

  const { data: mouvements } = useQuery({
    queryKey: ['mouvements', id],
    queryFn:  () => stockAPI.getMouvements(id).then(r => r.data),
    enabled:  !!id,
  });

  const { data: lots } = useQuery({
    queryKey: ['lots', id],
    queryFn:  () => stockAPI.getLots(id).then(r => r.data),
    enabled:  !!id,
  });

  if (isLoading) {
    return (
      <div className="page-container space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!med) return <div className="page-container"><p className="text-slate-500">Médicament introuvable.</p></div>;

  const stockTotal = lots?.reduce((s, l) => s + (l.statut === 'ACTIF' ? l.quantiteDisponible : 0), 0) || 0;

  return (
    <div className="page-container space-y-6">
      {/* Retour */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/medicaments')} className="btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="page-title">{med.nomCommercial}</h2>
          <p className="page-subtitle">{med.dci} — {med.formegalenique} {med.dosage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Fiche médicament */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Pill size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{med.nomCommercial}</p>
                <p className="text-xs text-slate-500">{med.dci}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Forme galénique', value: med.formegalenique },
                { label: 'Dosage',          value: med.dosage },
                { label: 'Catégorie',       value: med.categorie?.nom || '—' },
                { label: 'Code-barres',     value: med.codeBarre || '—', mono: true },
                { label: 'Prix achat HT',   value: med.prixAchatHt ? `${Number(med.prixAchatHt).toFixed(2)} DH` : '—' },
                { label: 'Prix vente TTC',  value: `${Number(med.prixVenteTtc).toFixed(2)} DH`, bold: true },
                { label: 'Seuil minimal',   value: `${med.seuilMinimal} unités` },
                { label: 'Dispensation',    value: med.statutDispensation },
              ].map(({ label, value, mono, bold }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={clsx('text-sm', mono && 'font-mono', bold && 'font-bold text-primary-600', !mono && !bold && 'text-slate-700')}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock total */}
          <div className={clsx('card p-5 text-center',
            stockTotal === 0 ? 'border-2 border-red-300 bg-red-50'
            : stockTotal <= med.seuilMinimal ? 'border-2 border-amber-300 bg-amber-50'
            : ''
          )}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Stock disponible</p>
            <p className={clsx('text-4xl font-bold',
              stockTotal === 0 ? 'text-red-600'
              : stockTotal <= med.seuilMinimal ? 'text-amber-600'
              : 'text-slate-800'
            )}>
              {stockTotal}
            </p>
            <p className="text-xs text-slate-400 mt-1">unités (lots actifs)</p>
            {stockTotal === 0 && <p className="text-sm text-red-600 font-semibold mt-2">RUPTURE DE STOCK</p>}
            {stockTotal > 0 && stockTotal <= med.seuilMinimal && <p className="text-sm text-amber-600 font-semibold mt-2">⚠ Seuil bas atteint</p>}
          </div>
        </div>

        {/* Lots + Mouvements */}
        <div className="lg:col-span-2 space-y-5">

          {/* Lots */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Package size={14} className="text-primary-600" />
                Lots ({lots?.length || 0})
              </h3>
            </div>
            <div className="tbl-container rounded-none border-0">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>N° Lot</th>
                    <th>Qté disponible</th>
                    <th>Date expiration</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {!lots?.length ? (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">Aucun lot</td></tr>
                  ) : lots.map(lot => (
                    <tr key={lot.id}>
                      <td className="font-mono text-xs font-semibold text-slate-600">{lot.numeroLot}</td>
                      <td className="font-bold text-slate-800">{lot.quantiteDisponible}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {format(new Date(lot.dateExpiration), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={clsx('badge',
                          lot.statut === 'ACTIF'    ? 'badge-success'
                          : lot.statut === 'BLOQUE' ? 'badge-danger'
                          : lot.statut === 'EXPIRE' ? 'badge-danger'
                          : 'badge-gray'
                        )}>
                          {lot.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mouvements */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Historique des mouvements</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {!mouvements?.length ? (
                <div className="py-10 text-center text-slate-400 text-sm">Aucun mouvement</div>
              ) : mouvements.map((mv, i) => {
                const cfg  = MOUVEMENT_COLORS[mv.typeOperation] || MOUVEMENT_COLORS['AJUSTEMENT'];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', cfg.cls)}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
                        <span className="text-xs text-slate-500">
                          {mv.utilisateur?.prenom} {mv.utilisateur?.nom}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {format(new Date(mv.dateOperation), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                        {mv.lot && ` · Lot : ${mv.lot.numeroLot}`}
                      </p>
                    </div>
                    <span className={clsx('font-bold text-sm',
                      mv.typeOperation === 'ENTREE' || mv.typeOperation === 'RETOUR'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    )}>
                      {mv.typeOperation === 'SORTIE' ? '-' : '+'}{mv.quantite}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
