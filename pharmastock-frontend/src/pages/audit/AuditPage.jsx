// src/pages/audit/AuditPage.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditAPI } from '../../api/services';
import { Shield, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ACTION_COLORS = {
  CREATE_VENTE:    'badge-success',
  CANCEL_VENTE:    'badge-danger',
  CREATE:          'badge-primary',
  UPDATE:          'badge-warning',
  DELETE:          'badge-danger',
  LOGIN:           'badge-info',
};

export default function AuditPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['audit', dateFrom, dateTo, page],
    queryFn: () => auditAPI.getAll({ dateFrom, dateTo, page, size: 25 }).then(r => r.data),
    keepPreviousData: true,
  });

  const handleExport = async () => {
    try {
      const data = await auditAPI.export({ dateFrom, dateTo });
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = `audit-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé.');
    } catch { toast.error('Erreur lors de l\'export.'); }
  };

  const logs  = data?.content || [];
  const total = data?.totalPages || 0;

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Journal d'audit</h2>
          <p className="page-subtitle">Traçabilité complète de toutes les opérations</p>
        </div>
        <button onClick={handleExport} className="btn-secondary">
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      {/* Note de sécurité */}
      <div className="alert-info">
        <Shield size={15} className="shrink-0 mt-0.5" />
        <p className="text-sm">
          Le journal d'audit est <strong>immuable</strong> — aucune entrée ne peut être modifiée 
          ou supprimée, même par l'administrateur. Conforme aux exigences réglementaires.
        </p>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">Période :</span>
          <input type="date" className="input text-sm max-w-[150px]"
            value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} />
          <span className="text-slate-400">→</span>
          <input type="date" className="input text-sm max-w-[150px]"
            value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} />
        </div>
      </div>

      {/* Tableau */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th>Date / Heure</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Entité</th>
              <th>Détail</th>
              <th>Adresse IP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-24" /></td>
                ))}</tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                <Shield size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune entrée dans le journal</p>
              </td></tr>
            ) : logs.map((log) => (
              <tr key={log.id}>
                <td className="text-xs font-mono text-slate-500 whitespace-nowrap">
                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                </td>
                <td className="text-sm">
                  {log.utilisateur ? (
                    <span className="font-medium text-slate-700">
                      {log.utilisateur.prenom} {log.utilisateur.nom}
                    </span>
                  ) : <span className="text-slate-400 text-xs">Système</span>}
                </td>
                <td>
                  <span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="text-sm text-slate-600">{log.entite}</td>
                <td className="text-xs text-slate-500 max-w-xs truncate" title={log.nouvelleValeur}>
                  {log.nouvelleValeur || log.ancienneValeur || '—'}
                </td>
                <td className="text-xs font-mono text-slate-400">{log.adresseIp || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {page + 1} / {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-xs py-1.5 px-3">Précédent</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= total - 1} className="btn-secondary text-xs py-1.5 px-3">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
