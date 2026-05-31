// src/pages/utilisateurs/UtilisateurModal.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { utilisateurAPI } from '../../api/services';
import { X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'ADMIN',              label: 'Administrateur' },
  { value: 'PHARMACIEN',         label: 'Pharmacien' },
  { value: 'CAISSIER',           label: 'Caissier' },
  { value: 'GESTIONNAIRE_STOCK', label: 'Gestionnaire de stock' },
];

export default function UtilisateurModal({ utilisateur, onClose, onSuccess }) {
  const isEdit = !!utilisateur;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: isEdit ? {
      nom:    utilisateur.nom,
      prenom: utilisateur.prenom,
      email:  utilisateur.email,
      role:   utilisateur.role,
      actif:  utilisateur.actif,
    } : { actif: true, role: 'CAISSIER' },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? utilisateurAPI.update(utilisateur.id, data)
      : utilisateurAPI.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Utilisateur modifié.' : 'Utilisateur créé avec succès.');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md animate-fade-in-up">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users size={17} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-800">
              {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-slate-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Prénom *</label>
              <input className={`input ${errors.prenom ? 'input-error' : ''}`}
                placeholder="Fatima" {...register('prenom', { required: 'Requis.' })} />
              {errors.prenom && <p className="form-error">{errors.prenom.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Nom *</label>
              <input className={`input ${errors.nom ? 'input-error' : ''}`}
                placeholder="Alaoui" {...register('nom', { required: 'Requis.' })} />
              {errors.nom && <p className="form-error">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Email *</label>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="email@pharmacie.ma"
              {...register('email', {
                required: 'Requis.',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide.' },
              })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="label">Mot de passe *</label>
              <input type="password" className={`input ${errors.motDePasse ? 'input-error' : ''}`}
                placeholder="Minimum 8 caractères"
                {...register('motDePasse', {
                  required: 'Requis.',
                  minLength: { value: 8, message: 'Minimum 8 caractères.' },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                    message: 'Doit contenir 1 majuscule, 1 chiffre, 1 caractère spécial.',
                  },
                })} />
              {errors.motDePasse && <p className="form-error">{errors.motDePasse.message}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="label">Rôle *</label>
            <select className="select" {...register('role', { required: 'Requis.' })}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="actif-u" className="w-4 h-4 accent-primary-600"
              {...register('actif')} />
            <label htmlFor="actif-u" className="text-sm text-slate-700 font-medium cursor-pointer">
              Compte actif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
