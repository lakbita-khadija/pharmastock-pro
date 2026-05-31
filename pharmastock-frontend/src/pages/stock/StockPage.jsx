// src/pages/stock/StockPage.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockAPI } from '../../api/services';
import { Package, Search, AlertTriangle, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

function ExpirationBadge({ dateExpiration }) {
  const days = differenceInDays(new Date(dateExpiration), new Date());
  if (days < 0)  return <span className="badge badge-danger">Périmé</span>;
  if (days <= 7)  return <span className="badge badge-danger">{days}j</span>;
  if (days <= 30) return <span className="badge badge-warning">{days}j</span>;
  return <span className="badge badge-success">{days}j</span>;
}

function StockBar({ quantite, seuil }) {
  const ratio = seuil > 0 ? Math.min((quantite / (seuil * 3)) * 100, 100) : 100;
  const color  = quantite === 0 ? 'bg-red-500'
               : quantite <= seuil ? 'bg-amber-400'
               : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${ratio}%` }} />
      </div>
      <span className={clsx('text-xs font-semibold w-8 text-right',
        quantite === 0 ? 'text-red-600' : quantite <= seuil ? 'text-amber-600' : 'text-slate-700'
      )}>
        {quantite}
      </span>
    </div>
  );
}

export default function StockPage() {
  const [search,    setSearch]   = useState('');
  const [showLots,  setShowLots] = useState({});
  const [filterExp, setFilterExp]= useState('all'); // all | 30 | 7 | expired
  const [page,      setPage]     = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['stock', search, filterExp, page],
    queryFn: () => stockAPI.getStock({ q: search, expFilter: filterExp, page, size: 20 })
                           .then(r => r.data),
    keepPreviousData: true,
  });

  const toggleLots = (id) => setShowLots(p => ({ ...p, [id]: !p[id] }));

  const stock      = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const FILTER_OPTS = [
    { value: 'all',     label: 'Tout le stock' },
    { value: 'low',     label: 'Stock faible' },
    { value: '30',      label: 'Expire dans 30j' },
    { value: '7',       label: 'Expire dans 7j' },
    { value: 'expired', label: 'Périmés' },
  ];

  return (
    <div className="page-container space-y-5">

      <div>
        <h2 className="page-title">Stock & Lots</h2>
        <p className="page-subtitle">Vue globale du stock avec traçabilité par lot (FEFO)</p>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Rechercher un médicament…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTS.map(o => (
            <button
              key={o.value}
              onClick={() => { setFilterExp(o.value); setPage(0); }}
              className={clsx('text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
                filterExp === o.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau stock */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th />
              <th>Médicament</th>
              <th>Catégorie</th>
              <th>Stock total</th>
              <th>Seuil min.</th>
              <th>Niveau stock</th>
              <th>Lots actifs</th>
              <th>Prochain exp.</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : stock.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune donnée de stock trouvée</p>
                </td>
              </tr>
            ) : stock.map((item) => (
              <React.Fragment key={item.medicamentId}>
                {/* Ligne principale */}
                <tr
                  className="cursor-pointer"
                  onClick={() => item.lots?.length && toggleLots(item.medicamentId)}
                >
                  <td className="w-8">
                    {item.lots?.length > 0 && (
                      <button className="text-slate-400 hover:text-slate-600">
                        {showLots[item.medicamentId]
                          ? <ChevronDown size={14} />
                          : <ChevronRight size={14} />
                        }
                      </button>
                    )}
                  </td>
                  <td>
                    <p className="font-semibold text-slate-800 text-sm">{item.nomCommercial}</p>
                    <p className="text-xs text-slate-500">{item.dci}</p>
                  </td>
                  <td className="text-sm text-slate-600">{item.categorie || '—'}</td>
                  <td>
                    <span className={clsx('font-bold text-sm',
                      item.stockTotal === 0 ? 'text-red-600'
                      : item.stockTotal <= item.seuilMinimal ? 'text-amber-600'
                      : 'text-slate-800'
                    )}>
                      {item.stockTotal}
                    </span>
                    {item.stockTotal === 0 && (
                      <span className="ml-2 badge badge-danger">Rupture</span>
                    )}
                    {item.stockTotal > 0 && item.stockTotal <= item.seuilMinimal && (
                      <span className="ml-2 badge badge-warning">Seuil bas</span>
                    )}
                  </td>
                  <td className="text-sm text-slate-600">{item.seuilMinimal}</td>
                  <td className="w-40">
                    <StockBar quantite={item.stockTotal} seuil={item.seuilMinimal} />
                  </td>
                  <td className="text-sm text-slate-600">{item.nbLots} lot{item.nbLots > 1 ? 's' : ''}</td>
                  <td>
                    {item.prochainExpiration ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <ExpirationBadge dateExpiration={item.prochainExpiration} />
                        <span className="text-xs text-slate-500">
                          {format(new Date(item.prochainExpiration), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                </tr>

                {/* Lignes lots (expandables) */}
                {showLots[item.medicamentId] && item.lots?.map(lot => (
                  <tr key={lot.id} className="bg-slate-50/80">
                    <td />
                    <td colSpan={2} className="pl-8">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {lot.numeroLot}
                        </span>
                        <span className={clsx('badge text-xs',
                          lot.statut === 'ACTIF'   ? 'badge-success'
                          : lot.statut === 'BLOQUE' ? 'badge-danger'
                          : 'badge-gray'
                        )}>
                          {lot.statut}
                        </span>
                      </div>
                    </td>
                    <td className="text-sm font-medium text-slate-700">{lot.quantiteDisponible}</td>
                    <td />
                    <td />
                    <td />
                    <td>
                      <div className="flex items-center gap-2">
                        <ExpirationBadge dateExpiration={lot.dateExpiration} />
                        <span className="text-xs text-slate-500">
                          {format(new Date(lot.dateExpiration), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {page + 1} / {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-xs py-1.5 px-3">Précédent</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary text-xs py-1.5 px-3">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
