// src/pages/ordonnances/OrdonnancesPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ordonnanceAPI } from '../../api/services';
import { Plus, FileText, X, CheckCircle, Search, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

function OrdonnanceModal({ onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { datePrescription: new Date().toISOString().split('T')[0] }
  });

  const mutation = useMutation({
    mutationFn: (data) => ordonnanceAPI.create({
      ...data,
      numeroOrdonnance: 'ORD-' + Date.now(),
    }),
    onSuccess: () => { toast.success('Ordonnance enregistrée.'); onSuccess(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText size={17} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Nouvelle ordonnance</h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-slate-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
            <p className="text-xs text-primary-700 font-medium">
              📋 Saisissez les informations de l'ordonnance présentée par le patient.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="label">Prescripteur (médecin) *</label>
              <input className={`input ${errors.prescripteur ? 'input-error' : ''}`}
                placeholder="Dr. Mohammed Alami — Cardiologue"
                {...register('prescripteur', { required: 'Requis.' })} />
              {errors.prescripteur && <p className="form-error">{errors.prescripteur.message}</p>}
            </div>
            <div className="form-group col-span-2">
              <label className="label">Nom du patient</label>
              <input className="input" placeholder="Nom complet du patient"
                {...register('patientNom')} />
            </div>
            <div className="form-group">
              <label className="label">Date de naissance</label>
              <input type="date" className="input" {...register('patientNaissance')} />
            </div>
            <div className="form-group">
              <label className="label">Date de prescription *</label>
              <input type="date" className={`input ${errors.datePrescription ? 'input-error' : ''}`}
                {...register('datePrescription', { required: 'Requis.' })} />
              {errors.datePrescription && <p className="form-error">{errors.datePrescription.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Date de validité</label>
              <input type="date" className="input" {...register('dateValidite')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Enregistrement…' : 'Enregistrer l\'ordonnance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrdonnancesPage() {
  const qc = useQueryClient();
  const { isPharmacien } = useAuth();
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ordonnances', search],
    queryFn: () => ordonnanceAPI.getAll({ q: search }).then(r => r.data),
  });

  const validerMutation = useMutation({
    mutationFn: (id) => ordonnanceAPI.valider(id),
    onSuccess: () => { toast.success('Ordonnance validée par le pharmacien.'); qc.invalidateQueries(['ordonnances']); },
  });

  const ordonnances = data?.content || data || [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Ordonnances</h2>
          <p className="page-subtitle">Registre des prescriptions médicales</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={16} /> Saisir une ordonnance
        </button>
      </div>

      {/* Alerte réglementaire */}
      <div className="alert-info">
        <FileText size={15} className="shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>Rappel réglementaire :</strong> Toute vente de médicament classé "sur ordonnance" 
          doit être associée à une ordonnance valide, signée et datée par un médecin.
        </p>
      </div>

      {/* Recherche */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Rechercher par patient, prescripteur…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tableau */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th>N° Ordonnance</th>
              <th>Patient</th>
              <th>Prescripteur</th>
              <th>Date prescription</th>
              <th>Validité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-20" /></td>
                ))}</tr>
              ))
            ) : ordonnances.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune ordonnance enregistrée</p>
              </td></tr>
            ) : ordonnances.map((o) => {
              const expired = o.dateValidite && new Date(o.dateValidite) < new Date();
              return (
                <tr key={o.id}>
                  <td>
                    <span className="font-mono text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-semibold">
                      {o.numeroOrdonnance}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">{o.patientNom || '—'}</span>
                    </div>
                  </td>
                  <td className="text-sm text-slate-600">{o.prescripteur}</td>
                  <td className="text-sm text-slate-600">
                    {format(new Date(o.datePrescription), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td>
                    {o.dateValidite ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span className={clsx('text-xs font-medium', expired ? 'text-red-600' : 'text-slate-600')}>
                          {format(new Date(o.dateValidite), 'dd/MM/yyyy')}
                          {expired && ' (expirée)'}
                        </span>
                      </div>
                    ) : <span className="text-slate-400 text-sm">—</span>}
                  </td>
                  <td>
                    {o.valideePar ? (
                      <span className="badge badge-success">
                        <CheckCircle size={11} /> Validée
                      </span>
                    ) : (
                      <span className="badge badge-warning">En attente</span>
                    )}
                  </td>
                  <td>
                    {isPharmacien && !o.valideePar && (
                      <button
                        onClick={() => validerMutation.mutate(o.id)}
                        className="btn-sm btn-success text-xs"
                      >
                        <CheckCircle size={12} /> Valider
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <OrdonnanceModal
          onClose={() => setModal(false)}
          onSuccess={() => { setModal(false); qc.invalidateQueries(['ordonnances']); }}
        />
      )}
    </div>
  );
}
