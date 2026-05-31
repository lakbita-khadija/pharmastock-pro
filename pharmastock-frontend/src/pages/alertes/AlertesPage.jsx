// src/pages/alertes/AlertesPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alerteAPI } from '../../api/services';
import { Bell, AlertTriangle, AlertCircle, Info, Check, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const NIVEAU_CONFIG = {
  CRITIQUE:      { cls: 'bg-red-50 border-red-200 text-red-800',    icon: AlertTriangle, iconCls: 'text-red-500',   badge: 'badge-danger'   },
  AVERTISSEMENT: { cls: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertCircle,  iconCls: 'text-amber-500',badge: 'badge-warning'  },
  INFO:          { cls: 'bg-sky-50 border-sky-200 text-sky-800',    icon: Info,           iconCls: 'text-sky-500',   badge: 'badge-info'     },
  BLOQUANT:      { cls: 'bg-red-100 border-red-300 text-red-900',   icon: AlertTriangle,  iconCls: 'text-red-700',   badge: 'badge-danger'   },
};

const TYPE_LABELS = {
  STOCK_FAIBLE:    'Stock faible',
  RUPTURE:         'Rupture totale',
  PEREMPTION_30J:  'Péremption 30j',
  PEREMPTION_7J:   'Péremption 7j',
  LOT_EXPIRE:      'Lot périmé',
  RAPPEL_LOT:      'Rappel de lot',
};

export default function AlertesPage() {
  const qc = useQueryClient();
  const [statutFilter, setStatutFilter] = useState('ACTIVE');
  const [niveauFilter, setNiveauFilter] = useState('');

  const { data: alertes, isLoading } = useQuery({
    queryKey: ['alertes', statutFilter, niveauFilter],
    queryFn: () => alerteAPI.getAll({ statut: statutFilter, niveau: niveauFilter })
                            .then(r => r.data.content || r.data),
    refetchInterval: 30_000,
  });

  const acquitterMutation = useMutation({
    mutationFn: ({ id, commentaire }) => alerteAPI.acquitter(id, commentaire),
    onSuccess: () => {
      toast.success('Alerte acquittée.');
      qc.invalidateQueries(['alertes']);
      qc.invalidateQueries(['alertes-count']);
    },
  });

  const handleAcquitter = (alerte) => {
    const commentaire = window.prompt('Commentaire (optionnel) :') ?? '';
    acquitterMutation.mutate({ id: alerte.id, commentaire });
  };

  const critiques     = alertes?.filter(a => a.niveau === 'CRITIQUE' || a.niveau === 'BLOQUANT').length || 0;
  const avertissements = alertes?.filter(a => a.niveau === 'AVERTISSEMENT').length || 0;

  return (
    <div className="page-container space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Centre des alertes</h2>
          <p className="page-subtitle">Surveillance automatique du stock et des péremptions</p>
        </div>
        <div className="flex gap-3">
          {critiques > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <AlertTriangle size={15} className="text-red-500" />
              <span className="text-sm font-semibold text-red-700">{critiques} critique{critiques > 1 ? 's' : ''}</span>
            </div>
          )}
          {avertissements > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <AlertCircle size={15} className="text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{avertissements} avertissement{avertissements > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex gap-1.5">
          {[
            { value: 'ACTIVE',    label: 'Actives' },
            { value: 'ACQUITTEE', label: 'Acquittées' },
            { value: 'RESOLUE',   label: 'Résolues' },
            { value: '',          label: 'Toutes' },
          ].map(f => (
            <button key={f.value}
              onClick={() => setStatutFilter(f.value)}
              className={clsx('text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
                statutFilter === f.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >{f.label}</button>
          ))}
        </div>
        <select
          className="select text-sm max-w-[180px]"
          value={niveauFilter}
          onChange={e => setNiveauFilter(e.target.value)}
        >
          <option value="">Tous les niveaux</option>
          <option value="CRITIQUE">Critique</option>
          <option value="AVERTISSEMENT">Avertissement</option>
          <option value="INFO">Information</option>
        </select>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : !alertes?.length ? (
          <div className="card p-16 text-center text-slate-400">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-slate-600">Aucune alerte</p>
            <p className="text-sm mt-1">Tout est sous contrôle ✓</p>
          </div>
        ) : alertes.map((alerte) => {
          const cfg  = NIVEAU_CONFIG[alerte.niveau] || NIVEAU_CONFIG['INFO'];
          const Icon = cfg.icon;

          return (
            <div
              key={alerte.id}
              className={clsx(
                'flex items-start gap-4 p-4 rounded-xl border animate-fade-in-up transition-all',
                alerte.statut === 'ACQUITTEE' ? 'opacity-60' : '',
                cfg.cls
              )}
            >
              <div className={clsx('w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center shrink-0 mt-0.5', cfg.iconCls)}>
                <Icon size={17} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`badge ${cfg.badge}`}>{alerte.niveau}</span>
                  <span className="badge badge-gray">{TYPE_LABELS[alerte.typeAlerte] || alerte.typeAlerte}</span>
                  {alerte.medicament && (
                    <span className="text-sm font-semibold">{alerte.medicament.nomCommercial}</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{alerte.message}</p>
                <p className="text-xs opacity-70 mt-1.5">
                  {format(new Date(alerte.dateCreation), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  {alerte.statut === 'ACQUITTEE' && alerte.acquittePar && (
                    <span> · Acquittée par {alerte.acquittePar.prenom} {alerte.acquittePar.nom}</span>
                  )}
                </p>
              </div>

              {alerte.statut === 'ACTIVE' && (
                <button
                  onClick={() => handleAcquitter(alerte)}
                  disabled={acquitterMutation.isPending}
                  className="btn-secondary text-xs py-1.5 px-3 shrink-0 bg-white/60"
                  title="Marquer comme prise en charge"
                >
                  <Check size={13} />
                  Acquitter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
