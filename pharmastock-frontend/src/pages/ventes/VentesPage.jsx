// src/pages/ventes/VentesPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venteAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, ShoppingCart, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const MODE_LABELS = {
  ESPECES: 'Espèces', CARTE: 'Carte', ASSURANCE: 'Assurance', VIREMENT: 'Virement',
};

export default function VentesPage() {
  const navigate     = useNavigate();
  const qc           = useQueryClient();
  const { isPharmacien } = useAuth();

  const [search,  setSearch]  = useState('');
  const [dateFrom,setDateFrom]= useState('');
  const [dateTo,  setDateTo]  = useState('');
  const [page,    setPage]    = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['ventes', search, dateFrom, dateTo, page],
    queryFn: () => venteAPI.getAll({ q: search, dateFrom, dateTo, page, size: 15 })
                           .then(r => r.data),
    keepPreviousData: true,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, motif }) => venteAPI.annuler(id, motif),
    onSuccess: () => {
      toast.success('Vente annulée.');
      qc.invalidateQueries(['ventes']);
    },
  });

  const handleCancel = (vente) => {
    const motif = window.prompt(`Motif d'annulation de la vente ${vente.numeroVente} ?`);
    if (motif === null) return;
    cancelMutation.mutate({ id: vente.id, motif });
  };

  const downloadTicket = async (id) => {
    try {
      const data = await venteAPI.getTicket(id);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `ticket-${id}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Erreur lors du téléchargement.'); }
  };

  const ventes     = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="page-container space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Historique des ventes</h2>
          <p className="page-subtitle">{data?.totalElements ?? 0} ventes enregistrées</p>
        </div>
        <button onClick={() => navigate('/ventes/new')} className="btn-primary">
          <Plus size={16} /> Nouvelle vente
        </button>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="N° vente, médicament…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="input text-sm" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)} />
          <span className="text-slate-400 text-sm">→</span>
          <input type="date" className="input text-sm" value={dateTo}
            onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Tableau */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th>N° Vente</th>
              <th>Date / Heure</th>
              <th>Articles</th>
              <th>Total TTC</th>
              <th>Mode paiement</th>
              <th>Caissier</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-20" /></td>
                  ))}
                </tr>
              ))
            ) : ventes.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune vente trouvée</p>
                </td>
              </tr>
            ) : ventes.map((v) => (
              <tr key={v.id}>
                <td>
                  <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {v.numeroVente}
                  </span>
                </td>
                <td className="text-sm text-slate-600 whitespace-nowrap">
                  {format(new Date(v.dateVente), 'dd MMM yyyy HH:mm', { locale: fr })}
                </td>
                <td className="text-sm text-slate-600">{v.nbArticles} article{v.nbArticles > 1 ? 's' : ''}</td>
                <td className="font-bold text-slate-800">{Number(v.totalTtc).toFixed(2)} DH</td>
                <td className="text-sm text-slate-600">{MODE_LABELS[v.modePaiement] || v.modePaiement}</td>
                <td className="text-sm text-slate-600">{v.caissier?.prenom} {v.caissier?.nom}</td>
                <td>
                  <span className={clsx('badge', v.statut === 'VALIDEE' ? 'badge-success' : 'badge-danger')}>
                    {v.statut === 'VALIDEE' ? 'Validée' : 'Annulée'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadTicket(v.id)}
                      className="btn-icon btn-ghost text-slate-400 hover:text-primary-600"
                      title="Télécharger ticket"
                    >
                      <Download size={15} />
                    </button>
                    {isPharmacien && v.statut === 'VALIDEE' && (
                      <button
                        onClick={() => handleCancel(v)}
                        className="btn-icon btn-ghost text-slate-400 hover:text-red-600"
                        title="Annuler la vente"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
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
