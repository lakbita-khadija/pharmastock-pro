// src/pages/commandes/CommandesPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commandeAPI, fournisseurAPI } from '../../api/services';
import { Plus, Truck, Send, Eye, XCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import CommandeModal from './CommandeModal';
import ReceptionModal from './ReceptionModal';

const STATUT_CONFIG = {
  BROUILLON:        { label: 'Brouillon',        cls: 'badge-gray'    },
  ENVOYEE:          { label: 'Envoyée',           cls: 'badge-info'    },
  RECUE_PARTIELLE:  { label: 'Reçue partiellement', cls: 'badge-warning' },
  RECUE_TOTALE:     { label: 'Reçue totalement',  cls: 'badge-success' },
  ANNULEE:          { label: 'Annulée',           cls: 'badge-danger'  },
};

export default function CommandesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [reception, setReception] = useState(null);
  const [statutFilter, setStatutFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['commandes', statutFilter],
    queryFn: () => commandeAPI.getAll({ statut: statutFilter }).then(r => r.data),
  });

  const envoyerMutation = useMutation({
    mutationFn: (id) => commandeAPI.envoyer(id),
    onSuccess: () => { toast.success('Commande envoyée au fournisseur.'); qc.invalidateQueries(['commandes']); },
  });

  const annulerMutation = useMutation({
    mutationFn: (id) => commandeAPI.annuler(id),
    onSuccess: () => { toast.success('Commande annulée.'); qc.invalidateQueries(['commandes']); },
  });

  const commandes = data?.content || data || [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Commandes fournisseurs</h2>
          <p className="page-subtitle">Gestion des bons de commande et réceptions</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={16} /> Nouvelle commande
        </button>
      </div>

      {/* Filtres statut */}
      <div className="card p-4 flex flex-wrap gap-2">
        {[{ value: '', label: 'Toutes' }, ...Object.entries(STATUT_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))].map(f => (
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

      {/* Tableau */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Fournisseur</th>
              <th>Date création</th>
              <th>Articles</th>
              <th>Montant HT</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-24" /></td>
                ))}</tr>
              ))
            ) : commandes.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                <Truck size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune commande trouvée</p>
              </td></tr>
            ) : commandes.map((cmd) => (
              <tr key={cmd.id}>
                <td>
                  <span className="font-mono text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-semibold">
                    {cmd.numeroCommande}
                  </span>
                </td>
                <td className="font-medium text-slate-700 text-sm">{cmd.fournisseur?.nom}</td>
                <td className="text-sm text-slate-600">
                  {format(new Date(cmd.dateCreation), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="text-sm text-slate-600">{cmd.nbLignes} article{cmd.nbLignes > 1 ? 's' : ''}</td>
                <td className="font-semibold text-slate-800">
                  {cmd.montantTotal ? `${Number(cmd.montantTotal).toFixed(2)} DH` : '—'}
                </td>
                <td>
                  <span className={`badge ${STATUT_CONFIG[cmd.statut]?.cls || 'badge-gray'}`}>
                    {STATUT_CONFIG[cmd.statut]?.label || cmd.statut}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    {cmd.statut === 'BROUILLON' && (
                      <button
                        onClick={() => envoyerMutation.mutate(cmd.id)}
                        className="btn-sm btn-primary text-xs"
                        title="Envoyer au fournisseur"
                      >
                        <Send size={12} /> Envoyer
                      </button>
                    )}
                    {cmd.statut === 'ENVOYEE' && (
                      <button
                        onClick={async () => {
                          try {
                            const full = await commandeAPI.getById(cmd.id).then(r => r.data);
                            setReception(full);
                          } catch {
                            toast.error('Impossible de charger la commande.');
                          }
                        }}
                        className="btn-sm btn-success text-xs"
                        title="Réceptionner la livraison"
                      >
                        <Package size={12} /> Réceptionner
                      </button>
                    )}
                    {cmd.statut === 'BROUILLON' && (
                      <button
                        onClick={() => annulerMutation.mutate(cmd.id)}
                        className="btn-icon btn-ghost text-slate-400 hover:text-red-600"
                        title="Annuler"
                      >
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CommandeModal
          onClose={() => setModal(false)}
          onSuccess={() => { setModal(false); qc.invalidateQueries(['commandes']); }}
        />
      )}

      {reception && (
        <ReceptionModal
          commande={reception}
          onClose={() => setReception(null)}
          onSuccess={() => { setReception(null); qc.invalidateQueries(['commandes']); }}
        />
      )}
    </div>
  );
}
