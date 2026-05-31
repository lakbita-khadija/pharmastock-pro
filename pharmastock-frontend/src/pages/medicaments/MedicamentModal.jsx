// src/pages/medicaments/MedicamentModal.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { medicamentAPI } from '../../api/services';
import { X, Pill } from 'lucide-react';
import toast from 'react-hot-toast';

const FORMES = ['Comprimé', 'Gélule', 'Sirop', 'Injectable', 'Pommade', 'Gouttes', 'Suppositoire', 'Patch', 'Spray'];
const STATUTS = [
  { value: 'LIBRE',      label: 'Libre accès' },
  { value: 'ORDONNANCE', label: 'Sur ordonnance' },
  { value: 'STUPEFIANT', label: 'Stupéfiant' },
  { value: 'LISTE_I',    label: 'Liste I' },
  { value: 'LISTE_II',   label: 'Liste II' },
];

export default function MedicamentModal({ medicament, categories, onClose, onSuccess }) {
  const isEdit = !!medicament;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: medicament ? {
      ...medicament,
      categorieId: medicament.categorie?.id,
    } : {
      seuilMinimal:      10,
      statutDispensation:'LIBRE',
      actif:             true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? medicamentAPI.update(medicament.id, data)
      : medicamentAPI.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Médicament modifié.' : 'Médicament créé avec succès.');
      onSuccess();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      toast.error(msg);
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Pill size={17} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {isEdit ? 'Modifier le médicament' : 'Nouveau médicament'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit ? medicament.nomCommercial : 'Remplissez toutes les informations requises'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nom commercial */}
            <div className="form-group sm:col-span-2">
              <label className="label">Nom commercial *</label>
              <input className={`input ${errors.nomCommercial ? 'input-error' : ''}`}
                placeholder="ex: Doliprane 500mg"
                {...register('nomCommercial', { required: 'Champ requis.' })} />
              {errors.nomCommercial && <p className="form-error">{errors.nomCommercial.message}</p>}
            </div>

            {/* DCI */}
            <div className="form-group">
              <label className="label">DCI (Principe actif) *</label>
              <input className={`input ${errors.dci ? 'input-error' : ''}`}
                placeholder="ex: Paracétamol"
                {...register('dci', { required: 'Champ requis.' })} />
              {errors.dci && <p className="form-error">{errors.dci.message}</p>}
            </div>

            {/* Code-barres */}
            <div className="form-group">
              <label className="label">Code-barres (EAN)</label>
              <input className="input" placeholder="ex: 3400935648609"
                {...register('codeBarre')} />
            </div>

            {/* Forme galénique */}
            <div className="form-group">
              <label className="label">Forme galénique *</label>
              <select className={`select ${errors.formegalenique ? 'input-error' : ''}`}
                {...register('formegalenique', { required: 'Champ requis.' })}>
                <option value="">Choisir…</option>
                {FORMES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.formegalenique && <p className="form-error">{errors.formegalenique.message}</p>}
            </div>

            {/* Dosage */}
            <div className="form-group">
              <label className="label">Dosage *</label>
              <input className={`input ${errors.dosage ? 'input-error' : ''}`}
                placeholder="ex: 500 mg"
                {...register('dosage', { required: 'Champ requis.' })} />
              {errors.dosage && <p className="form-error">{errors.dosage.message}</p>}
            </div>

            {/* Catégorie */}
            <div className="form-group">
              <label className="label">Catégorie</label>
              <select className="select" {...register('categorieId')}>
                <option value="">Aucune</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            {/* Statut dispensation */}
            <div className="form-group">
              <label className="label">Statut de dispensation *</label>
              <select className="select"
                {...register('statutDispensation', { required: 'Champ requis.' })}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Prix achat */}
            <div className="form-group">
              <label className="label">Prix achat HT (DH)</label>
              <input type="number" step="0.01" className="input" placeholder="0.00"
                {...register('prixAchatHt', { min: 0 })} />
            </div>

            {/* Prix vente */}
            <div className="form-group">
              <label className="label">Prix vente TTC (DH) *</label>
              <input type="number" step="0.01" className={`input ${errors.prixVenteTtc ? 'input-error' : ''}`}
                placeholder="0.00"
                {...register('prixVenteTtc', { required: 'Champ requis.', min: { value: 0.01, message: 'Prix invalide.' } })} />
              {errors.prixVenteTtc && <p className="form-error">{errors.prixVenteTtc.message}</p>}
            </div>

            {/* Seuil minimal */}
            <div className="form-group">
              <label className="label">Seuil minimal (unités) *</label>
              <input type="number" className="input" placeholder="10"
                {...register('seuilMinimal', { required: 'Champ requis.', min: 0 })} />
            </div>

            {/* Actif */}
            <div className="form-group col-span-1 flex items-center gap-3 pt-5">
              <input type="checkbox" id="actif" className="w-4 h-4 accent-primary-600"
                {...register('actif')} />
              <label htmlFor="actif" className="text-sm text-slate-700 font-medium cursor-pointer">
                Médicament actif
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement…
                </span>
              ) : isEdit ? 'Enregistrer les modifications' : 'Créer le médicament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
