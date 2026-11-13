## Guides et consignes présents

### Consignes pour l’agent IA et l’environnement

- **`.github/copilot-instructions.md`**  
  Guide principal pour Copilot : architecture, conventions, commandes et tests.  
  Exemple : `npm run check` doit exécuter « lint + typecheck + test + build ».

- **`.vscode/settings.json`**  
  Configure les permissions et l’auto-approbation de Copilot/VS Code. Les commandes de lecture sont autorisées, les commandes destructives ou Git modificatrices sont refusées.  
  Exemple : `"/^git (add|commit|push|...)/": false`.

- **`.npmrc`**  
  Impose l’absence de scripts d’installation npm.  
  Exemple : `ignore-scripts=true`.

- **`.nvmrc`**  
  Indique la version Node attendue : `24`.

- **`.github/pull_request_template.md`**  
  Guide de revue humaine et checklist de PR. Il exige notamment `npm run check`, des tests d’erreur, une vérification backend des droits et la mise à jour de `backend/API.md`.  
  Exemple : `- [ ] Les droits sont vérifiés par le backend, pas seulement masqués dans l'interface`.

### Documentation de développement et de génération

- **`README.md`**  
  Guide d’installation, démarrage, commandes, architecture générale et périmètre fonctionnel.  
  Exemple : `npm ci`, `npm run setup`, puis `npm run dev`.

- **`docs/cdc_gesta_developpement.md`**  
  Cahier des charges utilisé comme référence métier pour les développements : acteurs, règles de gestion, exigences fonctionnelles et non fonctionnelles.  
  Exemple : les exigences sont structurées en `EF-xx` et les règles en `RG-xx`.

- **`docs/architecture.md`**  
  Guide d’architecture imposant les flux et responsabilités des couches.  
  Exemple : `controllers → services → repositories → SQLite`.

- **`backend/API.md`**  
  Contrat des routes HTTP, statuts, erreurs et formats JSON.  
  Exemple : une erreur doit avoir la forme `{ "error": { "code": "...", "message": "..." } }`.

- **`docs/seed.md`**  
  Guide des données de démonstration, utilisateurs, statuts et invariants métier attendus.  
  Exemple : `backend/tests/db/seed.test.ts` vérifie que chaque déposant possède le rôle `DEPOSITOR`.

- **`docs/offers-flow.html`**  
  Guide visuel du parcours complet des offres et du filtre par période.  
  Exemple : `OffersPage → useOffers → GET /api/offers?period=P2 → controller → service → repository`.

### Documents historiques contenant des consignes ou résultats

- **`docs/semaine-1/conversation-1.md`**  
  Archive d’échanges Copilot ayant notamment généré les instructions du dépôt. Exemple : demande d’inspecter la structure, la documentation et les manifests avant de rédiger les consignes.

- **`docs/semaine-2/conversation-1.md`**  
  Archive de planification de la fonctionnalité candidatures. Exemple : plan en trois étapes — candidater, consulter, retirer.

- **`docs/semaine-1/bilan.md`** et **`docs/semaine-2/bilan.md`**  
  Comptes rendus, non normatifs. Ils documentent notamment l’usage du mode « Manual permissions » et l’exécution de `npm run check`.

## Senseurs et vérifications automatisées

### Commandes npm

- **`package.json`**  
  Orchestration globale :
  - `npm run lint` : lint des deux workspaces ;
  - `npm run typecheck` : vérification TypeScript ;
  - `npm test` : tests backend et frontend ;
  - `npm run build` : compilation ;
  - `npm run check` : exécution complète de ces contrôles.  
  Exemple : `"check": "npm run lint && npm run typecheck && npm run test && npm run build"`.

- **`backend/package.json`**  
  Capteurs backend :
  - `oxlint --deny-warnings` ;
  - `tsc --noEmit` ;
  - `vitest run` ;
  - compilation `tsc -p tsconfig.build.json`.  
  Exemple : `"lint": "oxlint --deny-warnings"`.

- **`frontend/package.json`**  
  Capteurs frontend :
  - `oxlint --deny-warnings` ;
  - `tsc -b` ;
  - `vitest run` ;
  - `tsc -b && vite build`.  
  Exemple : `"typecheck": "tsc -b"`.

### Lint

- **`backend/.oxlintrc.json`**  
  Vérifie les plugins TypeScript/Oxc/Node, les variables inutilisées, `any` explicites et les comparaisons non strictes.  
  Exemple : `"typescript/no-explicit-any": "error"`.

- **`frontend/.oxlintrc.json`**  
  Vérifie les règles React Hooks, les dépendances d’effets, les composants exportés et le typage.  
  Exemple : `"react/exhaustive-deps": "error"`.

### Typage

- **`backend/tsconfig.json`**  
  TypeScript strict sur le code et les tests.  
  Exemple : `"noUnusedParameters": true`.

- **`backend/tsconfig.build.json`**  
  Vérifie et compile uniquement `src` vers `dist`.

- **`frontend/tsconfig.app.json`**  
  Vérifie `src` et `tests`, sans émission JavaScript.  
  Exemple : `"noEmit": true`.

- **`frontend/tsconfig.node.json`**  
  Vérifie la configuration Vite avec TypeScript strict.

### Tests et configuration de test

- **`backend/vitest.config.ts`**  
  Charge la garde de version Node avant chaque test.

- **`frontend/vite.config.ts`**  
  Configure Vitest avec l’environnement `jsdom` et le setup frontend.

- **`frontend/tests/setup.ts`**  
  Nettoie le DOM et les mocks après chaque test.  
  Exemple : `afterEach(() => { cleanup(); vi.unstubAllGlobals(); })`.

- **`backend/tests/helpers/testApp.ts`**  
  Construit une application backend complète sur SQLite mémoire et fournit `tokenFor(...)`.

- **`backend/tests/helpers/testDatabase.ts`**  
  Crée une base isolée, applique les migrations et charge le seed.

- **`frontend/tests/helpers/fetchMock.ts`**  
  Remplace `fetch` pour simuler les réponses API.

#### Tests backend

- **`backend/tests/auth.test.ts`** : authentification, jetons, comptes désactivés et rôles.
- **`backend/tests/companies.test.ts`** : accès, recherche, visibilité et validation de `q`.
- **`backend/tests/offers.test.ts`** : droits par profil, statuts, tri et filtre de période.
- **`backend/tests/applications.test.ts`** : candidature, retrait, recandidature et isolation étudiant.
- **`backend/tests/health.test.ts`** : santé de l’API et route 404.
- **`backend/tests/permissions.test.ts`** : règles d’accès nommées.
- **`backend/tests/nodeVersion.test.ts`** : compatibilité de version Node.
- **`backend/tests/db/migrations.test.ts`** : création des tables, idempotence des migrations et clés étrangères.
- **`backend/tests/db/constraints.test.ts`** : contraintes SQLite, unicités, statuts, dates et relations.
- **`backend/tests/db/seed.test.ts`** : volumes, idempotence, cohérence métier du seed et règles `RG-04`, `RG-08`, `RG-11`, `RG-13`.

Exemple direct : `it("refuse deux candidatures actives pour la même offre et le même étudiant", ...)`.

#### Tests frontend

- **`frontend/tests/App.test.tsx`** : session, reconnexion et déconnexion.
- **`frontend/tests/LoginPage.test.tsx`** : utilisateurs de démo et erreurs de connexion.
- **`frontend/tests/HomePage.test.tsx`** : affichage de l’utilisateur et erreurs API.
- **`frontend/tests/CompaniesPage.test.tsx`** : affichage, recherche, erreur et expiration de session.
- **`frontend/tests/OffersPage.test.tsx`** : offres, périodes, erreurs et libellés.
- **`frontend/tests/NavBar.test.tsx`** : masquage des offres selon les rôles.
- **`frontend/tests/guards.test.ts`** : validation des réponses JSON par type guards.

### Garde de version Node

- **`backend/src/nodeVersion.ts`** et **`backend/src/requireSupportedNode.ts`**  
  Refusent l’exécution avec une version Node trop ancienne.  
  Exemple : Node 22 doit être au minimum en `22.14`, sinon le programme affiche `Node ... est trop ancien pour ce projet`.

- **`backend/tests/helpers/requireSupportedNode.ts`**  
  Applique cette garde avant les tests.

### Contrôles de base de données

- **`backend/src/db/database.ts`**  
  Active les clés étrangères SQLite : `db.pragma("foreign_keys = ON")`.

- **`backend/src/db/migrate.ts`**  
  Détecte et applique les migrations SQL non encore exécutées, dans l’ordre.

- **`backend/src/db/migrations/001_initial.sql`** et **`002_applications_constraints.sql`**  
  Imposent les contraintes de schéma. Exemple : l’index unique partiel `applications_one_active_per_offer_student` interdit deux candidatures non retirées pour le même étudiant et la même offre.

### Scripts auxiliaires vérifiables

- **`backend/src/db/scripts/init.ts`** : applique migrations et seed, puis affiche un résumé.
- **`backend/src/db/scripts/reset.ts`** : recrée la base et échoue explicitement si elle ne peut pas être supprimée.
- **`backend/src/db/scripts/printSummary.ts`** : affiche migrations, seed et nombre de lignes.
- **`backend/scripts/setupEnv.js`** : génère `backend/.env` et un `JWT_SECRET` aléatoire.
- **`backend/scripts/copyMigrations.js`** : vérifie indirectement que les migrations SQL sont copiées dans `dist`.

### Vérifications manuelles HTTP

Les fichiers REST Client suivants servent de sondes manuelles, mais ne sont pas exécutés automatiquement par `npm test` :

- `backend/http/health.http` : `GET /health`.
- `backend/http/auth.http` : connexions de démo, `/auth/me`, erreurs 401.
- `backend/http/companies.http` : visibilité, recherche et erreurs 400/401.
- `backend/http/offers.http` : visibilité par rôle, période et erreur 403.
- `backend/http/applications.http` : POST, GET et DELETE des candidatures.

Exemple : `backend/http/offers.http` contient `GET http://localhost:3000/offers?period=P1`.

## Absences constatées

- Aucun workflow dans `.github/`` : pas de GitHub Actions/CI.
- Aucun `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `CONTRIBUTING.md`, Husky ou `lint-staged`.
- Aucun outil automatisé de revue de code ; la revue est guidée par le modèle de PR et les tests/lint/typecheck.
- Les fichiers de `dist/`, `node_modules/` et `package-lock.json` présents ne constituent pas des guides ou des senseurs supplémentaires.