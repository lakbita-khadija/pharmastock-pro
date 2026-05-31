# PharmaStock Pro — Frontend
# React 18 + Tailwind CSS + React Query

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env.local

# 3. Démarrer le serveur de développement
npm start
```

## Variables d'environnement (.env.local)

```
REACT_APP_API_URL=http://localhost:8080/api/v1
```

## Structure du projet

```
src/
├── api/
│   ├── axiosClient.js       # Client HTTP + intercepteurs JWT
│   └── services.js          # Tous les appels API par module
├── context/
│   └── AuthContext.jsx      # État global d'authentification
├── components/
│   └── layout/
│       ├── MainLayout.jsx   # Layout principal (sidebar + header)
│       ├── Sidebar.jsx      # Navigation latérale avec rôles
│       └── Header.jsx       # Barre supérieure + alertes
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── medicaments/
│   │   ├── MedicamentsPage.jsx
│   │   ├── MedicamentDetail.jsx
│   │   └── MedicamentModal.jsx
│   ├── stock/
│   │   └── StockPage.jsx
│   ├── ventes/
│   │   ├── VentesPage.jsx
│   │   └── NouvelleVentePage.jsx
│   ├── commandes/
│   │   ├── CommandesPage.jsx
│   │   └── CommandeModal.jsx
│   ├── alertes/
│   │   └── AlertesPage.jsx
│   ├── rapports/
│   │   └── RapportsPage.jsx
│   ├── utilisateurs/
│   │   ├── UtilisateursPage.jsx
│   │   └── UtilisateurModal.jsx
│   └── inventaire/
│       └── InventairePage.jsx
├── routes/
│   └── AppRoutes.jsx        # Routes protégées par rôle
├── index.css                # Tailwind + composants custom
└── App.jsx                  # Providers globaux
```

## Stack

| Librairie | Usage |
|---|---|
| React 18 | UI |
| React Router v6 | Navigation |
| TailwindCSS 3 | Styles |
| @tanstack/react-query | Cache + fetching |
| axios | Appels HTTP |
| react-hook-form | Formulaires |
| recharts | Graphiques |
| react-hot-toast | Notifications |
| lucide-react | Icônes |
| date-fns | Dates |

## Rôles et accès

| Rôle | Dashboard | Ventes | Stock | Commandes | Rapports | Utilisateurs |
|---|---|---|---|---|---|---|
| ADMIN | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| PHARMACIEN | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ |
| CAISSIER | ✔ | ✔ | Lecture | ✘ | ✘ | ✘ |
| GESTIONNAIRE_STOCK | ✔ | ✘ | ✔ | ✔ | Partiel | ✘ |
