# Scénarios E2E — Recherche d'offres par titre (EF-30)

Règles de référence (semaine 9, voir `docs/semaine-4/semaine-4.md`) :

- la recherche porte sur une partie du titre de l'offre ;
- elle ne tient pas compte de la casse (caractères sans accent) ;
- les espaces au début et à la fin de la saisie sont ignorés ;
- un champ vide n'applique aucun filtre de titre ;
- la recherche ne remplace pas les règles de visibilité : un étudiant ne voit que les offres publiées.

## État initial commun

- Base de démonstration recréée avec `npm run db:reset` (serveur arrêté), puis application lancée avec `npm run dev`.
- Frontend : <http://localhost:5173> ; API : <http://localhost:3000>.
- Connexion de démonstration (sans mot de passe) en tant qu'étudiant **Lucas Dupont** (rôle Étudiant).
- Filtre « Période » laissé sur « Toutes les périodes ».
- Offres du seed utiles aux scénarios (`backend/src/db/seed/offersData.ts`) :

| Offre | Statut | Visible pour l'étudiant | Contient « application » |
|---|---|:---:|:---:|
| Application React de gestion de flotte | Publiée (`PUBLISHED`) | Oui | Oui |
| Migration d'une application vers le cloud | Attribuée (`ASSIGNED`) | Non | Oui |
| API REST de facturation | Publiée (`PUBLISHED`) | Oui | Non |
| Tableau de bord de qualité des données | Publiée (`PUBLISHED`) | Oui | Non |
| Assistant conversationnel interne | Publiée (`PUBLISHED`) | Oui | Non |

La recherche ne modifie aucune donnée : aucun nettoyage n'est nécessaire entre deux exécutions.

## Scénario 1 — Recherche avec résultat (cas nominal)

**Objectif** : vérifier que la recherche filtre les offres par titre, sans tenir compte de la casse, et qu'une offre non publiée n'apparaît pas même si son titre correspond.

**Actions dans l'interface**

1. Sur la page « Connexion de démonstration », cliquer sur « Lucas Dupont ».
2. Ouvrir la page « Offres » (`/offres`).
3. Saisir `application` (en minuscules) dans le champ « Rechercher par titre ».
4. Attendre la mise à jour de la liste (la recherche part automatiquement après un court délai).

**Résultat attendu**

- Le compteur affiche « 1 offre ».
- Le tableau contient une seule ligne : « Application React de gestion de flotte » (entreprise Lumen Digital).
- « Migration d'une application vers le cloud » n'est pas affichée, bien que son titre contienne le mot recherché, car elle n'est pas publiée.
- Les autres offres publiées (par exemple « API REST de facturation ») ne sont pas affichées.

## Scénario 2 — Recherche sans résultat (cas limite)

**Objectif** : vérifier qu'une recherche sans correspondance affiche une liste vide avec le message propre à la recherche.

**Actions dans l'interface**

1. Sur la page « Connexion de démonstration », cliquer sur « Lucas Dupont ».
2. Ouvrir la page « Offres » (`/offres`).
3. Saisir `blockchain` dans le champ « Rechercher par titre ».
4. Attendre la mise à jour de la liste.

**Résultat attendu**

- Le message « Aucune offre ne correspond à la recherche. » est affiché (et non le message général « Aucune offre à afficher. »).
- Aucun tableau d'offres n'est affiché.
- Aucun compteur « N offre(s) » n'est affiché.

## Justification du choix des deux cas

- **Scénario 1** : un seul cas vérifie trois règles à la fois, le filtrage par titre, l'insensibilité à la casse (`application` contre « Application ») et la visibilité limitée aux offres publiées. Le seed contient exprès une offre non publiée portant le même mot, sinon la règle de visibilité ne serait pas réellement testée.
- **Scénario 2** : le cas limite vérifie que l'interface distingue une recherche sans résultat d'une liste vide en général, grâce au message spécifique.
- Les mots recherchés sont sans accent, car l'insensibilité à la casse de SQLite (`LIKE`) ne s'applique qu'aux caractères ASCII.
