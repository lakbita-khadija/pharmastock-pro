# PharmaStock Pro

Système de gestion de stock pour pharmacie — projet PFA.
Frontend **React + Tailwind** (thème vert pharmacie) + backend **Spring Boot** (Java 17).

Ce dépôt contient deux dossiers :

- `pharmastock-frontend/` — l'interface React (inchangée, design vert).
- `pharmastock-backend/` — l'API REST Spring Boot.

---

## Démarrage rapide

Le backend utilise une base **H2 en mode fichier** : aucune installation de base de
données n'est requise. Au premier lancement, des données de démonstration sont créées
automatiquement (comptes, médicaments, lots, ventes, alertes).

### 1. Backend (port 8080)

Prérequis : **Java 17+** et **Maven**.

```bash
cd pharmastock-backend
mvn spring-boot:run
```

L'API est alors disponible sur `http://localhost:8080/api/v1`.

### 2. Frontend (port 3000)

Prérequis : **Node.js 18+**.

```bash
cd pharmastock-frontend
npm install
npm start
```

L'application s'ouvre sur `http://localhost:3000`. Le fichier `.env.local` est déjà
fourni et pointe vers le backend.

---

## Comptes de démonstration

Tous les comptes ont le même mot de passe : **`Admin123!`**

| Rôle                  | Email                |
| --------------------- | -------------------- |
| Administrateur        | `admin@pharma.ma`    |
| Pharmacien            | `pharma@pharma.ma`   |
| Caissier              | `caissier@pharma.ma` |
| Gestionnaire de stock | `gestion@pharma.ma`  |

---

## Fonctionnalités

- **Authentification JWT** avec rôles (ADMIN, PHARMACIEN, CAISSIER, GESTIONNAIRE_STOCK)
  et verrouillage de compte après 5 tentatives.
- **Médicaments** : catalogue, recherche, code-barres, catégories, archivage logique.
- **Stock & lots** : traçabilité par lot, filtres (stock faible, péremptions 30j/7j, périmés).
- **Ventes (caisse)** : déduction **FEFO** automatique (les lots qui périment en premier
  sortent en premier), calcul du rendu monnaie, ticket PDF.
- **Commandes fournisseurs** : bon de commande, envoi, réception (création de lots +
  entrées de stock), statuts (brouillon → envoyée → reçue partielle/totale).
- **Alertes** : génération automatique (ruptures, stock faible, péremptions) + acquittement.
- **Tableau de bord** : KPIs (valeur du stock, CA jour/mois, alertes), graphiques, top médicaments.
- **Ordonnances**, **inventaire** (avec écarts), **utilisateurs**, **journal d'audit**.
- **Rapports PDF** : stock, ventes, péremptions, mouvements.

---

## Console de base de données (H2)

Pendant que le backend tourne :

- URL : `http://localhost:8080/api/v1/h2-console`
- JDBC URL : `jdbc:h2:file:./data/pharmastock`
- Utilisateur : `sa` — mot de passe : *(vide)*

---

## Réinitialiser les données

Les données sont stockées dans `pharmastock-backend/data/`. Pour repartir de zéro :

```bash
# backend arrêté
rm -rf pharmastock-backend/data
```

Au prochain démarrage, le jeu de démonstration sera recréé.

---

## Passer à PostgreSQL (optionnel, pour la production)

1. Dans `pharmastock-backend/pom.xml`, décommentez la dépendance `postgresql`.
2. Dans `src/main/resources/application.properties`, remplacez le bloc `datasource`
   H2 par (voir le commentaire en bas du fichier) :

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/pharmastock
   spring.datasource.driver-class-name=org.postgresql.Driver
   spring.datasource.username=postgres
   spring.datasource.password=VOTRE_MDP
   ```

3. Créez la base : `createdb pharmastock` (ou via pgAdmin).
4. Relancez `mvn spring-boot:run` — les tables sont créées automatiquement
   (`ddl-auto=update`) et les données de démo insérées.

---

## Architecture du backend

```
com.pharmastock
├── config/        SecurityConfig, DataInitializer (seed)
├── security/      JwtUtil, JwtAuthFilter, CustomUserDetailsService
├── common/        ApiResponse, Mapper (entité→Map), PageMapper, SimplePdf, exceptions
├── enums/         Role, LotStatut, TypeMouvement, ...
├── entity/        Utilisateur, Medicament, Lot, Vente, Commande, Alerte, ...
├── repository/    interfaces Spring Data JPA
├── dto/           records de requête (LoginRequest, VenteRequest, ...)
├── service/       logique métier (FEFO, alertes, dashboard, ...)
├── controller/    endpoints REST
└── scheduler/     AlerteScheduler (vérification quotidienne 01h00)
```

**Note technique importante :** les entités ne sont jamais sérialisées directement.
Chaque réponse est construite via `common/Mapper` sous forme de `Map`, ce qui élimine
définitivement les boucles de sérialisation JSON (relations bidirectionnelles) qui
provoquaient les erreurs 500. Toutes les réponses sont encapsulées dans `{ "data": ... }`,
sauf `POST /auth/login` qui renvoie directement `{ token, refreshToken, user }`.
