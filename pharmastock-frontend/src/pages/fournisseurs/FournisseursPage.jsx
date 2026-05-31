// src/pages/fournisseurs/FournisseursPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { fournisseurAPI } from '../../api/services';
import { Plus, Edit, X, Building2, Phone, Mail, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function FournisseurModal({ fournisseur, onClose, onSuccess }) {
  const isEdit = !!fournisseur;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: fournisseur || {},
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? fournisseurAPI.update(fournisseur.id, data)
      : fournisseurAPI.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Fournisseur modifié.' : 'Fournisseur créé.');
      onSuccess();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building2 size={17} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-800">
              {isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-slate-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="label">Nom *</label>
              <input className={`input ${errors.nom ? 'input-error' : ''}`}
                placeholder="COOPER Maroc"
                {...register('nom', { required: 'Requis.' })} />
              {errors.nom && <p className="form-error">{errors.nom.message}</p>}
            </div>
            <div className="form-group col-span-2">
              <label className="label">Raison sociale</label>
              <input className="input" placeholder="Cooper Pharma SA"
                {...register('raisonSociale')} />
            </div>
            <div className="form-group">
              <label className="label">Téléphone</label>
              <input className="input" placeholder="0522-345678"
                {...register('telephone')} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="contact@fournisseur.ma"
                {...register('email')} />
            </div>
            <div className="form-group">
              <label className="label">Contact / Responsable</label>
              <input className="input" placeholder="Nom du représentant"
                {...register('contactNom')} />
            </div>
            <div className="form-group col-span-2">
              <label className="label">Adresse</label>
              <input className="input" placeholder="Adresse complète"
                {...register('adresse')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FournisseursPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['fournisseurs', search],
    queryFn: () => fournisseurAPI.getAll({ q: search }).then(r => r.data),
  });

  const desactiverMutation = useMutation({
    mutationFn: (id) => fournisseurAPI.delete(id),
    onSuccess: () => { toast.success('Fournisseur désactivé.'); qc.invalidateQueries(['fournisseurs']); },
  });

  const fournisseurs = data?.content || data || [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Fournisseurs</h2>
          <p className="page-subtitle">{fournisseurs.length} fournisseurs enregistrés</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>

      {/* Recherche */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Rechercher un fournisseur…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grille de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : fournisseurs.length === 0 ? (
          <div className="col-span-3 card p-16 text-center text-slate-400">
            <Building2 size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun fournisseur trouvé</p>
          </div>
        ) : fournisseurs.map((f) => (
          <div key={f.id} className={clsx(
            'card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow',
            !f.actif && 'opacity-60'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{f.nom}</p>
                  {f.raisonSociale && (
                    <p className="text-xs text-slate-500">{f.raisonSociale}</p>
                  )}
                </div>
              </div>
              <span className={clsx('badge', f.actif ? 'badge-success' : 'badge-gray')}>
                {f.actif ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              {f.telephone && (
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  {f.telephone}
                </div>
              )}
              {f.email && (
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  {f.email}
                </div>
              )}
              {f.contactNom && (
                <p className="text-slate-500 italic">Contact : {f.contactNom}</p>
              )}
              {f.adresse && (
                <p className="text-slate-400 truncate">{f.adresse}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModal(f)}
                className="btn-secondary text-xs py-1.5 flex-1 justify-center"
              >
                <Edit size={13} /> Modifier
              </button>
              {f.actif && (
                <button
                  onClick={() => {
                    if (window.confirm(`Désactiver "${f.nom}" ?`))
                      desactiverMutation.mutate(f.id);
                  }}
                  className="btn-ghost text-xs py-1.5 text-red-500 hover:bg-red-50"
                >
                  Désactiver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <FournisseurModal
          fournisseur={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); qc.invalidateQueries(['fournisseurs']); }}
        />
      )}
    </div>
  );
}
