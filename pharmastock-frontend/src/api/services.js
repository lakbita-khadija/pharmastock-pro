// src/api/services.js
// Tous les appels API regroupés par module

import axiosClient from './axiosClient';

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════
const getData = async (promise, fallback = null) => {
  const res = await promise;
  return res?.data ?? fallback;
};

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
export const authAPI = {
  login: async (data) => getData(axiosClient.post('/auth/login', data), {}),
  refreshToken: async () => getData(axiosClient.post('/auth/refresh'), {}),
  changePassword: async (data) => getData(axiosClient.put('/auth/password', data), {}),
};

// ══════════════════════════════════════════
// MÉDICAMENTS
// ══════════════════════════════════════════
export const medicamentAPI = {
  getAll: async (params) => getData(axiosClient.get('/medicaments', { params }), { content: [] }),
  getById: async (id) => getData(axiosClient.get(`/medicaments/${id}`), null),
  create: async (data) => getData(axiosClient.post('/medicaments', data), {}),
  update: async (id, d) => getData(axiosClient.put(`/medicaments/${id}`, d), {}),
  delete: async (id) => getData(axiosClient.delete(`/medicaments/${id}`), {}),
  search: async (q) => getData(axiosClient.get('/medicaments/search', { params: { q } }), []),
  getByBarcode: async (code) => getData(axiosClient.get(`/medicaments/barcode/${code}`), null),
};

// ══════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════
export const categorieAPI = {
  getAll: async () => getData(axiosClient.get('/categories'), []),
  create: async (data) => getData(axiosClient.post('/categories', data), {}),
  update: async (id, d) => getData(axiosClient.put(`/categories/${id}`, d), {}),
  delete: async (id) => getData(axiosClient.delete(`/categories/${id}`), {}),
};

// ══════════════════════════════════════════
// FOURNISSEURS
// ══════════════════════════════════════════
export const fournisseurAPI = {
  getAll: async (params) => getData(axiosClient.get('/fournisseurs', { params }), { content: [] }),
  getById: async (id) => getData(axiosClient.get(`/fournisseurs/${id}`), null),
  create: async (data) => getData(axiosClient.post('/fournisseurs', data), {}),
  update: async (id, d) => getData(axiosClient.put(`/fournisseurs/${id}`, d), {}),
  delete: async (id) => getData(axiosClient.delete(`/fournisseurs/${id}`), {}),
};

// ══════════════════════════════════════════
// STOCK & LOTS
// ══════════════════════════════════════════
export const stockAPI = {
  getStock: async (params) => getData(axiosClient.get('/stock', { params }), []),
  getMouvements: async (medId) => getData(axiosClient.get(`/stock/${medId}/mouvements`), []),
  getLots: async (medId) => getData(axiosClient.get(`/stock/${medId}/lots`), []),
  getAllLots: async (params) => getData(axiosClient.get('/lots', { params }), []),
  bloquerLot: async (lotId) => getData(axiosClient.put(`/lots/${lotId}/bloquer`), {}),
  getLotsByExpiry: async (jours) => getData(axiosClient.get('/lots/expiration', { params: { jours } }), []),
};

// ══════════════════════════════════════════
// VENTES
// ══════════════════════════════════════════
export const venteAPI = {
  getAll: async (params) => getData(axiosClient.get('/ventes', { params }), { content: [] }),
  getById: async (id) => getData(axiosClient.get(`/ventes/${id}`), null),
  create: async (data) => getData(axiosClient.post('/ventes', data), {}),
  annuler: async (id, motif) => getData(axiosClient.delete(`/ventes/${id}`, { data: { motif } }), {}),
  getTicket: async (id) => {
    const res = await axiosClient.get(`/ventes/${id}/ticket`, { responseType: 'blob' });
    return res?.data;
  },
};

// ══════════════════════════════════════════
// ORDONNANCES
// ══════════════════════════════════════════
export const ordonnanceAPI = {
  getAll: async (params) => getData(axiosClient.get('/ordonnances', { params }), { content: [] }),
  getById: async (id) => getData(axiosClient.get(`/ordonnances/${id}`), null),
  create: async (data) => getData(axiosClient.post('/ordonnances', data), {}),
  valider: async (id) => getData(axiosClient.put(`/ordonnances/${id}/valider`), {}),
};

// ══════════════════════════════════════════
// COMMANDES FOURNISSEURS
// ══════════════════════════════════════════
export const commandeAPI = {
  getAll: async (params) => getData(axiosClient.get('/commandes', { params }), { content: [] }),
  getById: async (id) => getData(axiosClient.get(`/commandes/${id}`), null),
  create: async (data) => getData(axiosClient.post('/commandes', data), {}),
  envoyer: async (id) => getData(axiosClient.put(`/commandes/${id}/envoyer`), {}),
  annuler: async (id) => getData(axiosClient.put(`/commandes/${id}/annuler`), {}),
  receptionner: async (data) => getData(axiosClient.post('/receptions', data), {}),
};

// ══════════════════════════════════════════
// ALERTES
// ══════════════════════════════════════════
export const alerteAPI = {
  getAll: async (params) => getData(axiosClient.get('/alertes', { params }), []),
  acquitter: async (id, commentaire) =>
      getData(axiosClient.put(`/alertes/${id}/acquitter`, { commentaire }), {}),
  getCount: async () => getData(axiosClient.get('/alertes/count'), {}),
};

// ══════════════════════════════════════════
// INVENTAIRE
// ══════════════════════════════════════════
export const inventaireAPI = {
  getAll: async () => getData(axiosClient.get('/inventaires'), []),
  demarrer: async (data) => getData(axiosClient.post('/inventaires', data), {}),
  saisir: async (id, d) => getData(axiosClient.put(`/inventaires/${id}/lignes`, d), {}),
  valider: async (id) => getData(axiosClient.put(`/inventaires/${id}/valider`), {}),
  getEcarts: async (id) => getData(axiosClient.get(`/inventaires/${id}/ecarts`), []),
};

// ══════════════════════════════════════════
// RAPPORTS
// ══════════════════════════════════════════
export const rapportAPI = {
  stock: async (params) => {
    const res = await axiosClient.get('/rapports/stock', { params, responseType: 'blob' });
    return res?.data;
  },
  ventes: async (params) => {
    const res = await axiosClient.get('/rapports/ventes', { params, responseType: 'blob' });
    return res?.data;
  },
  peremptions: async (params) => {
    const res = await axiosClient.get('/rapports/peremptions', { params, responseType: 'blob' });
    return res?.data;
  },
  mouvements: async (params) => {
    const res = await axiosClient.get('/rapports/mouvements', { params, responseType: 'blob' });
    return res?.data;
  },
};

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════
export const dashboardAPI = {
  getKpis: async () => getData(axiosClient.get('/dashboard/kpis'), {}),
  getVentesChart: async (period) =>
      getData(axiosClient.get('/dashboard/ventes-chart', { params: { period } }), []),
  getTopMeds: async () => getData(axiosClient.get('/dashboard/top-medicaments'), []),
};

// ══════════════════════════════════════════
// UTILISATEURS
// ══════════════════════════════════════════
export const utilisateurAPI = {
  getAll: async () => getData(axiosClient.get('/utilisateurs'), []),
  getById: async (id) => getData(axiosClient.get(`/utilisateurs/${id}`), null),
  create: async (data) => getData(axiosClient.post('/utilisateurs', data), {}),
  update: async (id, d) => getData(axiosClient.put(`/utilisateurs/${id}`, d), {}),
  deverrouiller: async (id) => getData(axiosClient.put(`/utilisateurs/${id}/deverrouiller`), {}),
  desactiver: async (id) => getData(axiosClient.put(`/utilisateurs/${id}/desactiver`), {}),
};

// ══════════════════════════════════════════
// AUDIT
// ══════════════════════════════════════════
export const auditAPI = {
  getAll: async (params) => getData(axiosClient.get('/audit', { params }), { content: [] }),
  export: async (params) => {
    const res = await axiosClient.get('/audit/export', { params, responseType: 'blob' });
    return res?.data;
  },
};