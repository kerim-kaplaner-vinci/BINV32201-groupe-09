# Bilan - Semaine 2 : Gestion des candidatures

## Choix
Lors de la phase de planification, les choix clés suivants ont été validés pour respecter le cahier des charges et l'architecture globale :
- **Absence de doublon actif** : Un étudiant ne peut avoir qu'une seule candidature active (`IN_PROGRESS`) par offre. La recandidature n'est autorisée qu'après le retrait d'une candidature précédente.
- **Offres ciblées** : Seules les offres au statut `PUBLISHED` acceptent des candidatures. Les offres non publiées (`SUBMITTED`, `PENDING`, `ASSIGNED`, `ARCHIVED`) sont exclues et protégées côté serveur.
- **Message optionnel** : Le message d'accompagnement de la candidature est facultatif, aligné sur la possibilité du schéma de base de données (`Nullable`).
- **Isolation stricte** : Chaque étudiant a accès exclusivement à ses propres candidatures. Les vérifications de sécurité et de rôle (`STUDENT`) sont appliquées côté serveur.

## Résultat
- **Ce qui fonctionne** : L'ensemble de la chaîne de candidature (soumission avec/sans message, consultation de l'historique, retrait des candidatures en cours et recandidature) est entièrement fonctionnel et validé.
- **Difficultés et limites** : La gestion précise des statuts autorisant ou bloquant le retrait a demandé un soin particulier pour préserver l'historique sans permettre d'actions incohérentes sur des candidatures déjà traitées (`ACCEPTED`, `REJECTED`, `WITHDRAWN`).

## Modifications
Au total, 26 fichiers ont été ajoutés ou modifiés à travers le projet :
- **Migration & Base de données (`backend/src/db`)** :
  - `002_applications_constraints.sql` : Migration ajoutant les contraintes d'unicité active et de gestion des statuts.
- **Backend (`backend/src` & `backend/tests`)** :
  - `applications.controller.ts`, `applications.service.ts`, `applications.repository.ts`, `application.mapper.ts`, `application.ts` : Implémentation complète de la couche métier et des endpoints de candidature (`POST`, `GET`, `DELETE`).
  - `app.ts`, `permissions.ts` : Intégration des routes et vérification stricte des rôles et autorisations.
  - `applications.http`, `API.md` : Documentation et exemples de requêtes HTTP.
  - `applications.test.ts`, `constraints.test.ts`, `migrations.test.ts` : Suites de tests d'intégration, de migration et de contraintes DB.
- **Frontend (`frontend/src`)** :
  - `ApplicationsPage.tsx`, `ApplicationList.tsx` : Espace "Mes candidatures" avec affichage dynamique des statuts et bouton d'action.
  - `OffersPage.tsx`, `OfferTable.tsx` : Intégration de la soumission de candidature avec masquage automatique pour les offres déjà postulées.
  - `useApplications.ts`, `applications.service.ts`, `application.ts` : Hook React, service API client et types TypeScript.
  - `NavBar.tsx`, `App.tsx`, `index.css` : Mise à jour de la navigation, du routage et des styles.
  - `guards.ts`, `labels.ts` : Utilitaires de sécurité/guards de rôle et formatage des libellés de statuts.
- **Documentation (`docs`)** :
  - `architecture.md` : Mise à jour de la documentation d'architecture globale.

## Validation fonctionnelle
Les cas de test suivants ont été vérifiés avec succès directement dans le navigateur :
1. **Soumission** : Candidature sur une offre publiée effectuée avec succès avec puis sans message.
2. **Rechargement** : Persistance des données et affichage correct du statut (`En cours`) après rafraîchissement.
3. **Retrait** : Retrait d'une candidature `IN_PROGRESS` fonctionnel ; passage du statut à `Retirée`.
4. **Candidatures traitées** : Vérification de l'impossibilité de retirer une candidature aux statuts `Sélectionnée` (`ACCEPTED`) ou `Refusée` (`REJECTED`) (bouton d'action absent).
5. **Doublons** : Disparition du bouton "Candidater" sur l'offre lorsqu'une candidature active est déjà enregistrée.
6. **Isolation des utilisateurs** : Changement d'utilisateur démo vérifié ; l'espace *Mes candidatures* n'affiche que les éléments appartenant à l'utilisateur connecté.

## Qualité
- **Respect de l'architecture** : Respect de la séparation par couches (Repository -> Service -> Controller -> Component React).
- **Lisibilité** : Noms explicites pour les fonctions, typage TypeScript strict et gestion centralisée des libellés (`labels.ts`) et des gardes de sécurité (`guards.ts`).
- **Nettoyage** : Pas de code mort ni de dépendances inutiles ajoutées.

## Tests et commandes
La commande globale de validation a été exécutée dans le terminal :
```bash
npm run check