# 💊 PharmaStock — Système de Gestion de Stock pour Officine Pharmaceutique

Application web complète de gestion de stock destinée aux pharmacies : suivi par lot et par date
de péremption, ventes au comptoir, alertes automatiques, traçabilité réglementaire et rapports PDF.

> Projet de Fin d'Année (PFA) — Stack : **React.js** + **Spring Boot 3** + **PostgreSQL** + **JWT**

---

## 📑 Sommaire

1. [Présentation](#1-présentation)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Architecture technique](#3-architecture-technique)
4. [Prérequis (à installer)](#4-prérequis-à-installer)
5. [Installation pas à pas](#5-installation-pas-à-pas)
6. [Lancer le projet](#6-lancer-le-projet)
7. [Comptes de démonstration](#7-comptes-de-démonstration)
8. [Guide d'utilisation par module](#8-guide-dutilisation-par-module)
9. [Structure du projet](#9-structure-du-projet)
10. [Principaux endpoints de l'API](#10-principaux-endpoints-de-lapi)
11. [Dépannage (problèmes fréquents)](#11-dépannage-problèmes-fréquents)
12. [Notes techniques importantes](#12-notes-techniques-importantes)

---

## 1. Présentation

**PharmaStock** est une application de gestion de stock pensée pour les contraintes réelles d'une
pharmacie. Contrairement à un commerce classique, une officine doit gérer :

- des **lots** de fabrication (indispensable en cas de rappel sanitaire) ;
- des **dates de péremption** (un médicament périmé ne peut pas être vendu) ;
- des médicaments **soumis à ordonnance** (contrainte réglementaire) ;
- une **traçabilité complète** de chaque opération.

L'application est découpée en deux parties indépendantes :

- **`pharmastock-backend`** : l'API (le « cerveau »), en Java / Spring Boot. Elle contient toute
  la logique et communique avec la base de données.
- **`pharmastock-frontend`** : l'interface (ce que l'utilisateur voit), en React. Elle parle à
  l'API via des requêtes HTTP.

Les deux se lancent séparément et tournent en même temps.

---

## 2. Fonctionnalités

| Module | Description |
|--------|-------------|
| 🔐 **Authentification** | Connexion sécurisée par jeton JWT, 4 rôles d'utilisateurs. |
| 📊 **Tableau de bord** | Indicateurs clés (valeur du stock, CA du jour, alertes), graphique des ventes. |
| 💊 **Médicaments** | CRUD complet, catégories, seuils, statut de dispensation (libre / sur ordonnance). |
| 📦 **Stock & Lots** | Suivi **par lot**, dates de péremption, filtres (stock faible, péremption proche). |
| 🛒 **Ventes** | Caisse : panier, total TTC, rendu monnaie, **déduction FEFO**, ticket PDF, historique. |
| 📋 **Ordonnances** | Saisie des prescriptions, circuit de validation, lien réglementaire. |
| 🚚 **Commandes** | Cycle fournisseur : création → envoi → réception (création de lot). |
| 🏢 **Fournisseurs** | Gestion des fournisseurs (CRUD). |
| 🔢 **Inventaire** | Comptage physique, calcul automatique des écarts, régularisation. |
| 🔔 **Alertes** | Génération automatique : rupture, stock faible, péremption ; acquittement. |
| 📄 **Rapports** | Rapports PDF professionnels (stock, ventes, péremptions, mouvements). |
| 📜 **Audit** | Journal immuable de toutes les opérations, export CSV. |
| 👥 **Utilisateurs** | Gestion des comptes et des rôles (admin). |

**Concepts métier clés :**

- **FEFO (First Expired, First Out)** : lors d'une vente, le système déduit en priorité les lots
  dont la date de péremption est la plus proche. Cela limite les pertes par péremption.
- **Stock calculé par lot** : le stock d'un médicament n'est pas une valeur fixe, c'est la somme
  des quantités disponibles de ses lots actifs.
- **Traçabilité** : chaque entrée (réception) et sortie (vente, ajustement) est enregistrée.

---

## 3. Architecture technique

Architecture **3 tiers** (client / serveur / base de données) :

```
┌─────────────────┐      HTTP / REST (JSON)      ┌──────────────────┐      JDBC      ┌──────────────┐
│   FRONTEND      │ ───────────────────────────► │     BACKEND      │ ─────────────► │  PostgreSQL  │
│   React.js      │ ◄─────────────────────────── │  Spring Boot 3   │ ◄───────────── │   (port 5433)│
│  (port 3000)    │        + jeton JWT           │   (port 8080)    │                │              │
└─────────────────┘                              └──────────────────┘                └──────────────┘
```

**Backend en couches :** Controller (REST) → Service (logique métier) → Repository (accès données)
→ Entity (tables). Un **Mapper** central transforme les entités en JSON propre.

| Composant | Version |
|-----------|---------|
| Java (JDK) | 17 (ou +) |
| Spring Boot | 3.2.5 |
| Spring Security | 6.x (JWT, BCrypt) |
| Hibernate / JPA | 6.4 |
| PostgreSQL | 16 / 17 |
| React | 18 |
| React Router | 6 |
| React Query | 5 |
| Axios | client HTTP |
| Build | Maven (backend) / npm (frontend) |

---

## 4. Prérequis (à installer)

Avant de commencer, chaque collègue doit installer :

1. **Java JDK 17** (ou supérieur)
   - Vérifier : ouvrir un terminal et taper `java -version` → doit afficher 17 ou +.
2. **Node.js 18+** et **npm** (npm est inclus avec Node.js)
   - Télécharger : https://nodejs.org → version LTS
   - Vérifier : `node -v` et `npm -v`.
3. **PostgreSQL 16 ou 17**
   - Télécharger : https://www.postgresql.org/download/windows/
   - ⚠️ **Bien noter le mot de passe** choisi pour l'utilisateur `postgres` pendant l'installation.
   - pgAdmin (interface graphique) est installé automatiquement avec PostgreSQL.
4. **IntelliJ IDEA** (pour le backend) — https://www.jetbrains.com/idea/ (Community suffit)
5. **VS Code** (recommandé pour le frontend) — https://code.visualstudio.com/

---

## 5. Installation pas à pas

### Étape 1 — Récupérer le projet
Décompresser l'archive du projet. On obtient un dossier `pharmastock-pro/` contenant :
- `pharmastock-backend/`
- `pharmastock-frontend/`

### Étape 2 — Créer la base de données
1. Ouvrir **pgAdmin**.
2. Se connecter au serveur PostgreSQL (mot de passe défini à l'installation).
3. Clic droit sur **Databases** → **Create** → **Database…**
4. Nom de la base : **`pharmastock`** → **Save**.

### Étape 3 — Configurer la connexion à la base
Ouvrir le fichier :
```
pharmastock-backend/src/main/resources/application.properties
```
Vérifier / adapter ces lignes :
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/pharmastock
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=VOTRE_MOT_DE_PASSE
```
- Remplacer `VOTRE_MOT_DE_PASSE` par **votre** mot de passe PostgreSQL.
- ⚠️ **Le port** : mettre `5432` si une seule version de PostgreSQL est installée, ou `5433` si
  plusieurs versions cohabitent. (Pour vérifier le port : dans pgAdmin, clic droit sur le serveur
  → Properties → onglet Connection → Port.)

### Étape 4 — Ouvrir le backend dans IntelliJ
1. IntelliJ → **File → Open** → sélectionner le dossier **`pharmastock-backend`**.
2. Laisser **Maven** télécharger les dépendances (barre de progression en bas). Patienter à la
   première ouverture.

### Étape 5 — Installer les dépendances du frontend
Ouvrir un terminal dans le dossier `pharmastock-frontend` :
```bash
cd pharmastock-frontend
npm install
```
(à faire **une seule fois** ; cela peut prendre quelques minutes.)

---

## 6. Lancer le projet

⚠️ **Il faut lancer les DEUX en même temps**, dans cet ordre.

### 1) Démarrer le backend
Dans IntelliJ, ouvrir la classe `PharmaStockApplication` et cliquer sur ▶ (Run).
Le démarrage est réussi quand la console affiche :
```
Started PharmaStockApplication in X seconds
PharmaStock : donnees de demonstration initialisees.
```
Le backend tourne sur **http://localhost:8080/api/v1** — **laisser cette fenêtre ouverte**.

### 2) Démarrer le frontend
Dans un terminal, sur le dossier `pharmastock-frontend` :
```bash
npm start
```
Le navigateur s'ouvre automatiquement sur **http://localhost:3000**.

### 3) Se connecter
Utiliser un des comptes de démonstration ci-dessous.

---

## 7. Comptes de démonstration

Tous les comptes utilisent le même mot de passe : **`Admin123!`**

| Email | Rôle | Accès principal |
|-------|------|-----------------|
| `admin@pharma.ma` | Administrateur | Tout (y compris utilisateurs et audit) |
| `pharma@pharma.ma` | Pharmacien | Médicaments, stock, ventes, ordonnances, commandes |
| `caissier@pharma.ma` | Caissier | Ventes (caisse) |
| `gestion@pharma.ma` | Gestionnaire de stock | Stock, lots, commandes, inventaire |

Les données de démonstration (10 médicaments, lots, ventes, alertes…) sont créées
**automatiquement** au premier démarrage du backend.

---

## 8. Guide d'utilisation par module

### Ajouter un médicament
**Médicaments** → **Nouveau médicament**. Champs obligatoires : nom commercial, DCI, forme
galénique, dosage, statut de dispensation, prix de vente, seuil minimal.
> Un médicament créé a un **stock de 0** tant qu'aucun lot n'a été reçu (voir Commandes).

### Approvisionner (créer du stock)
1. **Commandes** → **Nouvelle commande** → choisir un fournisseur, ajouter des lignes (médicament,
   quantité, prix) → **Enregistrer**.
2. Sur la commande → **Envoyer**.
3. Puis **Réceptionner** : saisir **numéro de lot** + **date de péremption** + quantité reçue →
   **Valider la réception**. ➡️ Le stock est créé avec sa traçabilité.

### Faire une vente
**Nouvelle vente** → rechercher un produit → l'ajouter au panier → renseigner le paiement →
**Valider**. Le stock est déduit selon **FEFO**. Un **ticket PDF** est téléchargeable depuis
l'historique (icône ⬇️).

### Inventaire
**Inventaire** → **Démarrer un inventaire** → saisir les quantités physiques comptées → **Valider**.
Les écarts (réel − théorique) sont calculés et le stock régularisé.

### Alertes, rapports, audit
- **Alertes** : générées automatiquement (rupture, stock faible, péremption).
- **Rapports** : télécharger un PDF professionnel (ex. rapport de stock).
- **Audit** : consulter le journal des opérations ; export **CSV** possible.

---

## 9. Structure du projet

```
pharmastock-pro/
├── pharmastock-backend/                 # API Spring Boot
│   ├── src/main/java/com/pharmastock/
│   │   ├── controller/                  # points d'entrée REST
│   │   ├── service/                     # logique métier (FEFO, alertes, audit, inventaire…)
│   │   ├── repository/                  # accès aux données (Spring Data JPA)
│   │   ├── entity/                      # entités (tables)
│   │   ├── dto/                         # objets de transfert
│   │   ├── common/                      # Mapper, ApiResponse, SimplePdf (générateur PDF)…
│   │   ├── config/                      # sécurité, initialisation des données (seeder)
│   │   ├── security/                    # JWT (filtre, utilitaires)
│   │   └── PharmaStockApplication.java  # point de démarrage
│   ├── src/main/resources/application.properties   # configuration (BDD, JWT, CORS)
│   └── pom.xml                          # dépendances Maven
│
└── pharmastock-frontend/                # Interface React
    ├── src/
    │   ├── pages/                       # une page par module (ventes, stock, audit…)
    │   ├── components/                  # composants réutilisables
    │   ├── context/                     # AuthContext (gestion de la session)
    │   └── api/services.js              # appels à l'API
    ├── package.json                     # dépendances npm
    └── tailwind.config.js               # thème (couleurs vertes)
```

---

## 10. Principaux endpoints de l'API

Base : `http://localhost:8080/api/v1`

| Méthode | Chemin | Description |
|---------|--------|-------------|
| POST | `/auth/login` | Authentification, renvoie le jeton JWT |
| GET | `/medicaments` | Liste des médicaments (recherche, filtre catégorie) |
| POST | `/medicaments` | Créer un médicament |
| GET | `/stock` | État du stock par médicament |
| GET | `/stock/lots` | Lots et dates de péremption |
| POST | `/ventes` | Enregistrer une vente (déduction FEFO) |
| GET | `/ventes/{id}/ticket` | Ticket PDF d'une vente |
| GET | `/ordonnances` | Registre des ordonnances |
| POST | `/commandes` | Créer une commande fournisseur |
| PUT | `/commandes/{id}/reception` | Réceptionner (créer un lot) |
| POST | `/inventaires` | Démarrer un inventaire |
| PUT | `/inventaires/{id}/valider` | Valider et régulariser |
| GET | `/alertes` | Liste des alertes |
| GET | `/rapports/stock` | Rapport de stock (PDF) |
| GET | `/audit` | Journal d'audit |
| GET | `/audit/export` | Export CSV de l'audit |

> Toutes les réponses (sauf `/auth/login`) sont encapsulées dans `{ "data": ... }`.
> Le jeton JWT doit être envoyé dans l'en-tête `Authorization: Bearer <token>`.

---

## 11. Dépannage (problèmes fréquents)

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `password authentication failed` au démarrage du backend | Mauvais mot de passe dans `application.properties` | Vérifier que le mot de passe = celui de PostgreSQL |
| `database "pharmastock" does not exist` | Base non créée | Créer la base `pharmastock` dans pgAdmin (Étape 2) |
| `Connection refused` / port | Mauvais port PostgreSQL | Vérifier le port (5432 ou 5433) dans pgAdmin → Properties → Connection |
| Le frontend affiche « Erreur serveur » partout | Backend non démarré | Lancer d'abord le backend dans IntelliJ |
| `npm start` échoue | Dépendances manquantes | Refaire `npm install` dans `pharmastock-frontend` |
| Page blanche au lancement | Cache navigateur | Rafraîchir avec **F5**, ou ouvrir la console **F12** pour voir l'erreur |
| Port 8080 ou 3000 déjà utilisé | Une autre instance tourne | Fermer l'ancienne instance, ou changer le port |

**Comptes / mot de passe oubliés ?** Tous les comptes de démo utilisent `Admin123!`.

**Repartir d'une base propre :** dans pgAdmin, supprimer puis recréer la base `pharmastock`, puis
relancer le backend (les données de démo seront régénérées).

---

## 12. Notes techniques importantes

- **Sécurité** : authentification JWT sans état (stateless), mots de passe hachés avec BCrypt,
  contrôle d'accès par rôle, verrouillage de compte après plusieurs échecs.
- **Indépendance base de données** : le projet a d'abord été développé sur H2, puis migré vers
  PostgreSQL **sans modifier le code métier** (seule la configuration change). C'est un atout
  d'architecture grâce à l'ORM (JPA/Hibernate).
- **Génération PDF** : un générateur maison (`SimplePdf`) produit les tickets et les rapports
  professionnels (tableaux, bandeau coloré, pagination, accents) sans dépendance externe lourde.
- **Compatibilité PostgreSQL** : les requêtes de recherche évitent le motif `:param IS NULL` (non
  supporté par PostgreSQL pour l'inférence de type) au profit de valeurs par défaut.
- **CORS** : le backend autorise les requêtes depuis `http://localhost:3000` (frontend).

---

### En résumé pour démarrer vite
```text
1. Installer : Java 17, Node.js, PostgreSQL, IntelliJ, VS Code
2. Créer la base "pharmastock" dans pgAdmin
3. Mettre son mot de passe dans application.properties (vérifier le port)
4. Backend : ouvrir pharmastock-backend dans IntelliJ → Run
5. Frontend : cd pharmastock-frontend → npm install → npm start
6. Se connecter sur http://localhost:3000 avec admin@pharma.ma / Admin123!
```

Bon développement ! 🚀
