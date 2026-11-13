# Audit des guides influençant l'agent — Web 2

## 1. Périmètre

### Guides examinés

| Fichier | Nature | Application à l'agent |
|---|---|---:|
| `.github/copilot-instructions.md` | Consignes Copilot, architecture, validation | Oui |
| `.github/pull_request_template.md` | Checklist de contribution et de revue | Indirecte |
| `.vscode/settings.json` | Permissions d'outils | Opérationnelle |
| `README.md`, `docs/architecture.md`, `backend/API.md` | Références de projet | Indirecte |
| `docs/cdc_gesta_developpement.md`, `docs/seed.md`, `docs/matrice_de_tracabilite.md` | Référentiels projet | Indirecte |

Il n'existe pas de `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`,
`.github/instructions/`, `.github/prompts/`, `.cursorrules` ou
`.windsurfrules`. Le seul guide explicitement destiné à Copilot est
`.github/copilot-instructions.md`.

### Corpus Web 2

Les 24 fichiers suivants ont été lus intégralement ; ils sont tous présents,
non vides et exploitables :

`docs/web2/texte/seance-{01,02,03,04,05,06,07,08,09,10,11,12}/slides.md`

`docs/web2/texte/seance-{13,14,15,16,17,18,19,20,21,22,23,24}/slides.md`

Le dossier contient aussi `package.json`, `scripts/`, `.github/workflows/`,
`site/`, une image et une séance complémentaire ; ces éléments ne sont pas des
contenus de cours et ont été ignorés. Aucun fichier demandé ne manque ou n'est
vide.

La numérotation des sources est celle des diapositives Slidev : frontmatter
initial exclu, blocs de configuration rattachés à la diapositive suivante.
Elle peut différer de la pagination des PDF remis (animations ou diapositives
masquées).

## 2. Tableau de comparaison

Les citations ci-dessous proviennent des fichiers réellement lus. Pour une
ligne `Non`, la recherche a porté sur `.github/copilot-instructions.md`,
`.github/pull_request_template.md`, `README.md`, `docs/architecture.md` et
`backend/API.md`.

| Attente ou convention Web 2 (source) | Guide examiné (passage cité) | Correspondance | Écart ou ajout proposé |
|---|---|---|---|
| REST : verbes, chemins, JSON et statuts HTTP (S02, diapos 2 à 7, « Requêtes HTTP », « Conventions REST », « Codes de retour HTTP »). | `.github/copilot-instructions.md`, « Architecture » : consulter `backend/API.md` pour les contrats. `.github/pull_request_template.md`, « Vérifications » : `backend/API.md` et `backend/http/*.http` à jour. | Oui | La convention est couverte. |
| Tester chaque route et documenter paramètres, réponses et erreurs (S02, diapos 8 à 18, « Tests d'API », JSDoc, Markdown et exercice : « mettre à jour la documentation et tester vos routes »). | `.github/pull_request_template.md`, « Vérifications » : tests des cas d'erreur et mise à jour de `backend/API.md`/`backend/http/*.http`. | Oui | La convention est couverte. |
| Séparer authentification et autorisation, et vérifier les droits côté backend (S03, diapos 2, 12 à 14 ; S23, diapo 11 : « Masquer un bouton n'est pas une sécurité »). | `.github/copilot-instructions.md`, « Repository conventions » : « enforce access on the backend, not only by hiding frontend routes ». | Oui | La correspondance est directe. |
| Ne jamais committer la clé secrète ni stocker les mots de passe en clair ; utiliser un hash salé (S03, diapo 9, « Clé secrète » ; S04, diapos 2 et 5). | `.github/copilot-instructions.md`, « Repository conventions » décrit les tokens, mais ne dit rien sur secrets, `.env` ou mots de passe. | Non | Ajouter une règle explicite sur secrets, variables d'environnement et mots de passe. |
| Valider les données externes par `unknown` et type guard (S01, diapo 17, « Type guard » ; S17, diapo 12, « Ne pas faire confiance au stockage »). | `.github/copilot-instructions.md`, « Repository conventions » : `readJson` et type guards pour les réponses JSON frontend. | Partielle | Le guide couvre les réponses frontend, pas toutes les entrées, le stockage local ni la validation backend. |
| Structurer le frontend par responsabilités : `models`, `data`, `utils`, `hooks`, `components`, `pages`, avec le flux `pages → hooks → utils/data → models` (S10, diapo 2 ; S19, diapos 4 et 9). | `.github/copilot-instructions.md`, « Architecture » : `pages → hooks → services/utils → models`, et couches backend séparées. | Oui | Ajouter seulement, si souhaité, la règle « un fichier par composant ou hook ». |
| Props en lecture seule, état immuable, valeurs dérivées et clés de liste stables (S08, diapos 11 et 15 ; S10, diapos 8 et 9 ; S13, diapo 4 ; S14, diapo 12). | Aucun passage correspondant dans les guides examinés. | Non | Ajouter une convention React sur immutabilité, `key` stable et absence d'état redondant. |
| Lint et build doivent révéler les erreurs et warnings ; le code doit être relu (S19, diapos 10 et 11 ; S20, diapo 12). | `.github/copilot-instructions.md`, « Build, test, and lint » impose `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check`, mais ne dit pas de corriger les warnings ou de justifier une désactivation. | Partielle | Préciser que les warnings doivent être corrigés ou justifiés, notamment les règles React. |
| Formulaires contrôlés, conversion explicite et validation frontend sans remplacer le backend (S12, diapos 5 à 12, « Formulaires » et « Valider les données »). | `.github/copilot-instructions.md`, « Repository conventions » parle de type guards JSON, pas de champs contrôlés ni de validation de formulaire. | Non | Ajouter cette règle aux changements frontend. |
| Pour `fetch`, vérifier `response.ok`, distinguer statut HTTP et erreur réseau, prévoir chargement/erreur/données, isoler les appels dans `services/` et configurer le proxy/CORS (S21, diapos 5, 8 et 11 ; S22, diapos 4 à 8 et 13 à 16). | `.github/copilot-instructions.md`, « Repository conventions » impose `readJson`, type guards et l'architecture `pages → hooks → services/utils → models`, mais ne mentionne pas `response.ok`, les trois états ni CORS/proxy. | Partielle | Ajouter `response.ok`, états de requête, URL `/api` et comportement CORS attendu. |
| Le cours enseigne JWT, clé secrète et envoi du token dans `Authorization` (S03, diapos 3, 5, 6 et 9). S23 précise : « le token est envoyé tel quel dans l'en-tête `Authorization` » et montre `localStorage`. | `.github/copilot-instructions.md`, « Repository conventions » : « Authentication tokens contain only `{ kind, id }` » et sont envoyés « as the raw `Authorization` header value, without a `Bearer` prefix ». | Partielle | Le raw header correspond. Le guide impose toutefois un payload `{ kind, id }` sans rappeler JWT, clé secrète ou les limites de `localStorage` ; ce format projet doit être présenté comme un choix Gesta, pas comme le format enseigné par S03/S23. |
| XSS : utiliser `textContent` pour une donnée utilisateur ; React échappe le texte JSX (S05, diapo 15 : « Attention au XSS » et « `textContent` pour les données potentiellement dangereuses » ; S07, diapo 8 : « React protège ainsi contre les attaques XSS »). Accessibilité : S09, diapo 8 décrit l'accessibilité des composants MUI, S09, diapo 12 sépare `variant` et balise sémantique, S11, diapo 12 explique `aria-label`. Ce sont des avertissements et exemples, pas une checklist générale de cours. | Aucun passage correspondant dans les guides examinés ; le modèle de PR demande seulement « Testé dans le navigateur ». | Non | Ajouter, si le projet le souhaite, une vérification minimale XSS et accessibilité ; ne pas présenter les exemples MUI/`aria-label` comme une exigence Web 2 plus large que les passages cités. |
| Paramètres d'URL à convertir et vérifier, avec état introuvable/404 (S15, diapo 12 ; S16, diapos 3 et 4). Effets purs, dépendances complètes et cleanup des timers (S17, diapos 2 à 7 ; S18, diapos 7 à 13). | Aucun passage correspondant dans les guides examinés. | Non | Ajouter des règles React ciblées sur `useParams`, `rules-of-hooks`, `exhaustive-deps` et le nettoyage des effets. |

## 3. Ce qui correspond

- REST, documentation d'API, exemples HTTP et tests d'erreur sont couverts par le
  guide et le modèle de PR.
- La séparation backend/frontend et le contrôle des droits côté backend
  correspondent directement aux séances S02, S03, S19 et S24.
- Le guide impose une chaîne de validation plus large que les seuls tests :
  lint, typecheck, tests et build.
- Le flux frontend `pages → hooks → services/utils → models` correspond à la
  séparation Model/ViewModel/View des séances S19 et S24.
- Le raw token dans `Authorization` correspond au passage explicite de S23 ;
  seule la forme interne `{ kind, id }` est un choix propre à Gesta.

## 4. Ce qui manque ou reste partiel

Les principaux manques sont les secrets et mots de passe, les conventions React
sur l'état, les formulaires, la validation des paramètres, les règles précises
du linter, `fetch`/`response.ok`, CORS/proxy, XSS et les critères
d'accessibilité. Les classements `Partielle` indiquent précisément les cas où
le guide couvre seulement une sous-partie de l'attente Web 2.

Aucune contradiction n'a été trouvée. Le guide Gesta ne contredit pas le cours
sur le raw `Authorization`, mais il restreint le payload à `{ kind, id }` sans
reprendre les exemples JWT de S03 ; il s'agit d'une convention projet, pas d'une
contradiction démontrée.

## 5. Recommandations justifiées

Ces ajouts sont proposés, mais non appliqués aux guides.

1. **Sécurité applicative** — Ajouter secrets hors Git, hash salé, rendu sûr des
   données utilisateur et critères minimaux d'accessibilité. Cela prévient fuite
   de clés, mots de passe compromis, XSS et interfaces inutilisables.
   Formulation possible : « Ne jamais committer un secret ni stocker un mot de
   passe en clair ; ne pas injecter de donnée utilisateur via `innerHTML` ;
   vérifier labels, `alt`, titres sémantiques, clavier et focus. »
2. **Qualité React** — Ajouter immutabilité, props en lecture seule, clés stables,
   absence d'état dérivé redondant, dépendances complètes et cleanup. Cela
   prévient état incohérent, warnings, effets périmés et fuites de timers.
   Formulation possible : « Corriger les warnings React (`rules-of-hooks`,
   `exhaustive-deps`) et nettoyer toute ressource démarrée dans un effet. »
3. **Entrées et formulaires** — Exiger champs contrôlés, conversions, type guards
   et validation frontend/backend, y compris les paramètres d'URL. Cela prévient
   données invalides et pages de détail incohérentes.
4. **Réseau et session** — Exiger `response.ok`, états chargement/erreur/données,
   proxy `/api`, gestion CORS et traitement particulier des réponses 204 ; préciser
   que `{ kind, id }` est le format Gesta tandis que S03 enseigne JWT. Cela
   prévient faux succès HTTP, erreurs CORS et mauvaise lecture des réponses.

## 6. Pratiques non sourcées, à vérifier par l'étudiant

- Niveau WCAG ou pourcentage de conformité ;
- couverture minimale en pourcentage ;
- scan de dépendances, analyse statique de sécurité ou nombre de relecteurs ;
- convention de commits ;
- performance chiffrée, matrice de navigateurs ou responsive obligatoire ;
- obligation d'OpenAPI : S02 présente JSDoc, Markdown et OpenAPI comme formats.

## 7. Limites

- Les PDF remis ne sont pas présents dans le dépôt actuel. Les fichiers Markdown
  portent néanmoins la même séquence et les mêmes titres `S01` à `S24` ; la
  correspondance avec les PDF `seance-01.pdf` à `seance-24.pdf` est donc
  présumée à partir du nom et du titre, à confirmer sur les fichiers remis.
- Les séances citées dans la seconde moitié du cours sont **S16** (paramètres
  URL), **S17** (effets et stockage), **S18** (cleanup), **S19** (MVVM/linter),
  **S20** (relecture), **S21** (fetch), **S22** (CORS/proxy), **S23** (session)
  et **S24** (JWT côté frontend). Elles correspondent donc aux PDF portant ces
  mêmes numéros, sous réserve de vérification matérielle.
- La numérotation est un comptage Slidev, pas une pagination PDF ; animations,
  diapositives masquées ou différences de génération peuvent décaler les pages.
- Les supports hors séances 01 à 24, notamment `seance-complementaire-context`,
  n'ont pas été utilisés dans le tableau principal.

### Fichiers lus

- `.github/copilot-instructions.md`
- `.github/pull_request_template.md`
- `.vscode/settings.json`
- `README.md`, `docs/architecture.md`, `backend/API.md`
- `docs/cdc_gesta_developpement.md`, `docs/seed.md`,
  `docs/matrice_de_tracabilite.md`
- `docs/web2/texte/seance-01/slides.md` à
  `docs/web2/texte/seance-24/slides.md`

### Points à vérifier par l'étudiant

Rouvrir en priorité les citations suivantes dans les supports remis :

1. S03 diapos 5 et 9, S23 diapos 4 à 7 : JWT, clé secrète, `Authorization`,
   `localStorage` et comparaison avec `{ kind, id }`.
2. S05 diapo 15, S07 diapo 8, S09 diapos 8 et 12, S11 diapo 12 : distinguer
   consigne explicite, exemple de code et promesse d'accessibilité d'une
   bibliothèque.
3. **S16 à S18** : conversion des paramètres, pureté, dépendances et cleanup.
4. **S19 à S21** : linter, relecture, services, `response.ok` et états réseau.
5. **S22 à S24** : proxy/CORS, session, token et requêtes authentifiées.
