User: Sans modifier aucun fichier, résume-moi :

1. les règles de la recherche d'offres par titre (EF-30) telles qu'implémentées
dans le code (sensibilité à la casse, recherche partielle, offres visibles
ou non selon le rôle/statut, comportement si champ vide) ;
2. les cas testés listés dans docs/semaine-4.md ;
3. les comptes/rôles et les offres disponibles dans les données de test(seed, fixtures), avec leur titre et leur visibilité ;
4. l'URL locale du frontend et du backend et les commandes pour les lancer.
Cite les fichiers où tu as trouvé chaque information.

Copilot: Search for `EF-30|recherche.*titre|search.*title|title.*search`

Find files matching `**/package.json`

Find files matching `backend/**/*{seed,fixture}*`

Find files matching `**/semaine-4.md`

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/package.json"
}

Read , lines 1 to 180
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/README.md",
  "view_range": [
    1,
    180
  ]
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/db/seed/seed.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/docs/semaine-4/semaine-4.md"
}

Read , lines 1 to 250
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/tests/offers.test.ts",
  "view_range": [
    1,
    250
  ]
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/db/seed/seedTypes.ts"
}

Search for `q\b|LIKE|COLLATE|published|PUBLISHED|title`

Search for `email|password|role|ADMIN|COMPANY|STUDENT|FLEET_APP|application|seed`

Read , lines 55 to 110
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/db/seed/companiesData.ts",
  "view_range": [
    55,
    110
  ]
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/services/offers.service.ts"
}

Read , lines 1 to 158
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/db/seed/offersData.ts",
  "view_range": [
    1,
    158
  ]
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/repositories/offers.repository.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/db/seed/peopleData.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/docs/seed.md"
}

Read , lines 1 to 160
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/frontend/tests/OffersPage.test.tsx",
  "view_range": [
    1,
    160
  ]
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/frontend/src/pages/OffersPage.tsx"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/controllers/offers.controller.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/package.json"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/frontend/package.json"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/tests/helpers/testDatabase.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/frontend/tests/helpers/fetchMock.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/frontend/src/hooks/useOffers.ts"
}

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/backend/src/db/seed/seedIds.ts"
}

Search for `localhost:3000|localhost:5173|API_PORT|vite --host|"dev"`

## 1. Recherche par titre — EF-30

- La recherche porte sur **une sous-chaîne du titre** (`LIKE %texte%`), pas sur la description ni sur des mots-clés séparés. Les caractères `%` et `_` saisis sont traités littéralement.
- La casse est ignorée pour les caractères ASCII avec le `LIKE` SQLite utilisé ici. Le test vérifie notamment `APPLICATION REACT` contre un titre écrit `Application React`; il ne vérifie pas le traitement des variantes de casse Unicode.
- Les espaces au début et à la fin sont supprimés. Si le champ est vide ou ne contient que des espaces, aucun filtre de titre n’est appliqué.
- La recherche s’ajoute au filtre de période et **ne remplace pas** les règles de visibilité :
  - l’administrateur voit toutes les offres, tous statuts confondus ;
  - l’étudiant ne voit que les offres `PUBLISHED` ;
  - un contact ayant le rôle déposant ne voit que les offres qu’il a déposées, quel que soit leur statut ;
  - un contact sans rôle déposant n’a pas accès à la liste (`403`).
- Le paramètre `q` répété ou dépassant 100 caractères est refusé avec `400 INVALID_QUERY`.

Sources : `offers.repository.ts`, `offers.controller.ts`, `offers.service.ts`, `offers.test.ts`.

## 2. Cas EF-30 listés dans le bilan de semaine 4

Le bilan rapporte ces vérifications : recherche sans distinction de casse, espaces externes ignorés, expression complète recherchée, recherche vide, absence de résultat et combinaison avec la période. Il rapporte aussi le cas étudiant pour « application » : l’offre publiée apparaît, tandis que l’offre contenant ce terme mais `ASSIGNED` reste invisible.

Les tests précisent notamment que la recherche vide restitue les offres normalement visibles, qu’une recherche sans correspondance donne une liste vide, et que le frontend envoie `period=P2&q=application` après avoir retiré les espaces de la saisie. Deux tests backend vérifient également le rejet d’un `q` de plus de 100 caractères et d’un paramètre répété. Le bilan indique que `npm run check` a réussi.

Source : `semaine-4.md`.

## 3. Comptes et offres des données de test

Les tests backend créent une base SQLite en mémoire, puis la remplissent avec le seed : ce sont les mêmes données de référence que celles décrites dans `seed.md`.

**Comptes seedés :**
- **Administrateurs** : Anne Leclercq, Philippe Moreau.
- **Étudiants** : Lucas Dupont, Inès Haddad, Mateusz Kowalski, Léa Mertens, Youssef El Amrani, Ioana Popescu, Aminata Diallo, Dmytro Kovalenko et Louis Claes.
- **Contacts déposants** : Claire Dumont, Marc Lejeune, Julien Lambert, Isabelle Collin, Piotr Nowak, Antoine Leroy, Pieter Janssens, Caroline Michel, Sarah Lambotte et Olivier Pirard.
- **Contacts promoteurs** : Nadia Cherif, Julien Lambert, Isabelle Collin, Laura Simon, Fatou Ndiaye, Pieter Janssens, Mehdi Alaoui, Sarah Lambotte, Elena Ivanova et Yann Delcourt.
- **Contacts signataires** : Nadia Cherif, Julien Lambert, Nathalie Renard, Thomas Dubois, Fatou Ndiaye et Pieter Janssens.

Particularités : Bernard Petit est inactif, Hélène Vermeulen n’a aucun rôle, et Yann Delcourt est « à vérifier » ; ils ne sont donc pas des comptes de démonstration ordinaires. Le mode démo n’utilise pas de mot de passe. Sources : `peopleData.ts`, `companiesData.ts`, `README.md`.

| Titre | Statut | Visibilité dans la liste des offres |
|---|---|---|
| Application React de gestion de flotte | `PUBLISHED` | Admin, étudiants ; déposante Claire Dumont |
| Refonte du portail client | `SUBMITTED` | Admin ; déposant Julien Lambert |
| API REST de facturation | `PUBLISHED` | Admin, étudiants ; déposant Marc Lejeune |
| Automatisation des tests de bout en bout | `PENDING` | Admin ; déposant Marc Lejeune |
| Tableau de bord de qualité des données | `PUBLISHED` | Admin, étudiants ; déposant Julien Lambert |
| Migration d’une application vers le cloud | `ASSIGNED` | Admin ; déposant Antoine Leroy |
| Assistant conversationnel interne | `PUBLISHED` | Admin, étudiants ; déposant Piotr Nowak |
| Outil de planification des consultants | `SUBMITTED` | Admin ; déposante Caroline Michel |
| Module de rapports PDF | `ARCHIVED` | Admin ; déposant Marc Lejeune |
| Numérisation d’archives papier | `ARCHIVED` | Admin seulement ; aucun déposant |

Le contact déposant voit seulement **ses propres offres**, pas celles de ses collègues. Source des titres, statuts et déposants : `offersData.ts`. La fixture frontend dans `OffersPage.test.tsx` est distincte : elle contient des réponses simulées pour tester l’interface, et non le catalogue seed complet.

## 4. Lancement local

Depuis la racine du dépôt :

```bash
npm ci
npm run setup   # à faire une fois : prépare l'environnement et la base de démo
npm run dev
```

- Frontend : [http://localhost:5173](http://localhost:5173)
- Backend/API : [http://localhost:3000](http://localhost:3000)

Pour lancer séparément les processus, les scripts sont `npm run dev -w frontend` et `npm run dev -w backend`. Sources : `README.md`, `package.json backend`, `package.json frontend`.

User: 1. Utilise les outils du serveur Playwright MCP pour exécuter le scénario 1
décrit dans e2e/recherche-offres/scenarios.md.
L'application tourne déjà sur [http://localhost:5173/](http://localhost:5173/) : la connexion se fait
en cliquant sur l'utilisateur de démonstration « Lucas Dupont ».
Après la saisie, attends que la liste soit mise à jour (la recherche part
après un court délai) avant de relever le résultat.

Ne modifie pas le code de l'application et ne génère pas de script de test.

À la fin, indique les actions réellement effectuées, les observations
(nombre d'offres affichées et leurs titres) et les écarts éventuels avec le scénario.

Copilot: Search tools
Completed with input: {
  "query": "Playwright MCP browser automation navigate snapshot click fill input wait for locator observe page"
}

Je vais d’abord lire le scénario 1 et ouvrir l’application, puis suivre ses étapes dans le navigateur et attendre le rafraîchissement des résultats.

Navigate to a URL
Completed with input: {
  "url": "http://localhost:5173/"
}
Tool execution failed: Permission denied and could not request permission from user. Copilot needed the user's approval and no one could answer. Feedback: The user denied permission.

Read 
Completed with input: {
  "path": "/Users/kerimkaplaner/IA 2026/Projet/BINV32201-groupe-09/e2e/recherche-offres/scenarios.md"
}

Je n’ai pas pu exécuter le scénario dans le navigateur : l’ouverture de `http://localhost:5173/` a été refusée par l’autorisation Playwright. Je n’ai donc pas cliqué sur Lucas Dupont, saisi la recherche ni observé les résultats.

Le scénario 1 attend **1 offre**, « Application React de gestion de flotte », et l’absence de « Migration d'une application vers le cloud » ainsi que des autres offres. Je ne peux pas confirmer ces résultats sans accès au navigateur. Référence : `scenarios.md`.Je reprends l’exécution avec Playwright : je vais ouvrir l’application, me connecter comme Lucas, effectuer la recherche, puis attendre la mise à jour des résultats.

Navigate to a URL
Completed with input: {
  "url": "http://localhost:5173/"
}

Page snapshot
Completed with input: {
  "depth": 6
}

Find in page snapshot
Completed with input: {
  "text": "Lucas Dupont"
}

Click
Completed with input: {
  "target": "e30",
  "element": "le bouton utilisateur de démonstration Lucas Dupont"
}

Page snapshot
Completed with input: {
  "depth": 6
}

Click
Completed with input: {
  "target": "e123",
  "element": "le lien Offres dans la navigation"
}

Page snapshot
Completed with input: {
  "depth": 6
}

Search tools
Completed with input: {
  "query": "Playwright browser fill searchbox input text then wait for page locator text/count after debounce"
}

Type text
Completed with input: {
  "target": "e141",
  "element": "le champ Rechercher par titre",
  "text": "application"
}

Wait for
Completed with input: {
  "text": "1 offre",
  "time": 10
}

Page snapshot
Completed with input: {
  "depth": 6
}

Scénario 1 exécuté sur [http://localhost:5173/offres](http://localhost:5173/offres).

**Actions effectuées :** j’ai ouvert l’application, cliqué sur l’utilisateur de démonstration « Lucas Dupont », ouvert « Offres », laissé « Toutes les périodes » sélectionné, puis saisi `application`. J’ai attendu l’apparition du compteur « 1 offre » avant de relever la liste.

**Observations :** une offre est affichée : « Application React de gestion de flotte » (Lumen Digital). « Migration d'une application vers le cloud » et les autres offres publiées ne figurent pas dans les résultats.

**Écarts :** le résultat correspond aux attentes du `scénario 1`. Je n’ai pas recréé la base ni relancé le serveur, puisque l’application tournait déjà ; je n’ai modifié aucun fichier et n’ai généré aucun script.