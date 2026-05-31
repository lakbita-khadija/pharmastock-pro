// src/pages/medicaments/MedicamentsPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicamentAPI, categorieAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Edit, Eye, Trash2,
  Filter, RefreshCw, Pill, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import MedicamentModal from './MedicamentModal';

const STATUT_COLORS = {
  LIBRE:      'badge-success',
  ORDONNANCE: 'badge-warning',
  STUPEFIANT: 'badge-danger',
  LISTE_I:    'badge-info',
  LISTE_II:   'badge-primary',
};
const STATUT_LABELS = {
  LIBRE: 'Libre accès', ORDONNANCE: 'Ordonnance',
  STUPEFIANT: 'Stupéfiant', LISTE_I: 'Liste I', LISTE_II: 'Liste II',
};

export default function MedicamentsPage() {
  const qc       = useQueryClient();
  const navigate  = useNavigate();
  const { isPharmacien } = useAuth();

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page,      setPage]      = useState(0);
  const [modal,     setModal]     = useState(null); // null | 'create' | medicament object

  // ── Requêtes ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['medicaments', search, catFilter, page],
    queryFn: () => medicamentAPI.getAll({ q: search, categorieId: catFilter, page, size: 15 })
                                .then(r => r.data),
    keepPreviousData: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categorieAPI.getAll().then(r => r.data),
  });

  // ── Suppression ──
  const deleteMutation = useMutation({
    mutationFn: (id) => medicamentAPI.delete(id),
    onSuccess: () => {
      toast.success('Médicament archivé avec succès.');
      qc.invalidateQueries(['medicaments']);
    },
  });

  const handleDelete = (med) => {
    if (window.confirm(`Archiver "${med.nomCommercial}" ?`)) {
      deleteMutation.mutate(med.id);
    }
  };

  const medicaments = data?.content || [];
  const totalPages  = data?.totalPages || 0;

  return (
    <div className="page-container space-y-5">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Médicaments</h2>
          <p className="page-subtitle">{data?.totalElements ?? 0} références dans le catalogue</p>
        </div>
        {isPharmacien && (
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus size={16} /> Nouveau médicament
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Rechercher par nom, DCI, code-barres…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        {/* Filtre catégorie */}
        <div className="relative">
          <select
            className="select pr-8 min-w-[180px]"
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(0); }}
          >
            <option value="">Toutes les catégories</option>
            {categories?.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Tableau */}
      <div className="tbl-container animate-fade-in">
        <table className="tbl">
          <thead>
            <tr>
              <th>Médicament</th>
              <th>DCI</th>
              <th>Forme / Dosage</th>
              <th>Catégorie</th>
              <th>Dispensation</th>
              <th>Prix vente</th>
              <th>Seuil min.</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j}>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : medicaments.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-400">
                  <Pill size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun médicament trouvé</p>
                </td>
              </tr>
            ) : medicaments.map((med) => (
              <tr key={med.id}>
                <td>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{med.nomCommercial}</p>
                    {med.codeBarre && (
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{med.codeBarre}</p>
                    )}
                  </div>
                </td>
                <td className="text-slate-600 text-sm">{med.dci}</td>
                <td>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {med.formegalenique}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{med.dosage}</span>
                </td>
                <td className="text-sm text-slate-600">{med.categorie?.nom ?? '—'}</td>
                <td>
                  <span className={`badge ${STATUT_COLORS[med.statutDispensation] || 'badge-gray'}`}>
                    {STATUT_LABELS[med.statutDispensation] || med.statutDispensation}
                  </span>
                </td>
                <td className="font-semibold text-slate-700">
                  {Number(med.prixVenteTtc).toFixed(2)} DH
                </td>
                <td className="text-sm text-slate-600">{med.seuilMinimal} unités</td>
                <td>
                  <span className={clsx('badge', med.actif ? 'badge-success' : 'badge-gray')}>
                    {med.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/medicaments/${med.id}`)}
                      className="btn-icon btn-ghost text-slate-500 hover:text-primary-600"
                      title="Voir détail"
                    >
                      <Eye size={15} />
                    </button>
                    {isPharmacien && (
                      <>
                        <button
                          onClick={() => setModal(med)}
                          className="btn-icon btn-ghost text-slate-500 hover:text-amber-600"
                          title="Modifier"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(med)}
                          className="btn-icon btn-ghost text-slate-500 hover:text-red-600"
                          title="Archiver"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
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
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {page + 1} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <MedicamentModal
          medicament={modal === 'create' ? null : modal}
          categories={categories || []}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            qc.invalidateQueries(['medicaments']);
          }}
        />
      )}

    </div>
  );
}
