# Matrice de traçabilité EF-32 / EF-33

Référentiel : [`docs/cdc_gesta_developpement.md`](./cdc_gesta_developpement.md).

- **EF-32** : l'étudiant candidate à une offre publiée, avec message facultatif, et peut retirer sa candidature tant qu'elle n'est pas traitée.
- **EF-33** : l'étudiant consulte ses candidatures et leur statut.

## EF-32 — Candidater et retirer

| Cas attendu | Test existant | Assertions utiles | Couverture |
|---|---|---|---|
| Un étudiant candidate à une offre publiée avec un message | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `crée une candidature puis autorise le retrait et la recandidature` | `expect(created.status).toBe(201)` et `expect(created.body.status).toBe("IN_PROGRESS")` | **Couvert** |
| Un étudiant candidate sans message | Même test | La recandidature utilise `.send({ offerId: OFFER.DATA_QUALITY })` et vérifie `status === 201` | **Couvert**, via la recandidature |
| Une offre non publiée refuse la candidature | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse une offre non publiée` | `status === 409` et `error.code === "OFFER_NOT_PUBLISHED"` | **Couvert** |
| Un doublon actif est refusé | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse une candidature active en double` | `status === 409` et `error.code === "DUPLICATE_APPLICATION"` | **Couvert** |
| Une candidature en cours peut être retirée | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `crée une candidature puis autorise le retrait et la recandidature` | `DELETE /applications/:id` puis `expect(withdrawn.status).toBe(204)` ; un GET vérifie ensuite `status === "WITHDRAWN"` | **Couvert** |
| Une candidature retirée peut être recréée | Même test | nouvelle requête POST, `status === 201`, et nouvel identifiant : `reapplied.body.id !== created.body.id` | **Couvert** |
| Une candidature sélectionnée ne peut pas être retirée | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `ne permet pas le retrait d'une candidature sélectionnée` | `status === 409` et `error.code === "APPLICATION_NOT_WITHDRAWABLE"` | **Couvert** pour `SELECTED` |
| Une candidature refusée ne peut pas être retirée | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `ne permet pas le retrait d'une candidature refusée` | `status === 409` et `error.code === "APPLICATION_NOT_WITHDRAWABLE"` | **Couvert** |
| Seul un étudiant peut candidater | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse une candidature par un profil non étudiant` | POST avec un administrateur : `status === 403` et `error.code === "FORBIDDEN"` | **Couvert** |
| Une requête POST sans session est refusée | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse une candidature sans session` | `status === 401` et `error.code === "UNAUTHENTICATED"` | **Couvert** |
| Un étudiant ne peut retirer que sa propre candidature | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse le retrait de la candidature d'un autre étudiant` | `status === 404` et `error.code === "NOT_FOUND"` | **Couvert** |
| Un identifiant de candidature invalide est refusé | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse un identifiant de candidature invalide` | `status === 400` et `error.code === "INVALID_BODY"` | **Couvert** |

### Contrôle complémentaire au niveau SQL

Le comportement doublon/recandidature est aussi vérifié dans [`backend/tests/db/constraints.test.ts`](../backend/tests/db/constraints.test.ts) :

- `refuse deux candidatures actives pour la même offre et le même étudiant` vérifie `toThrow(/UNIQUE/)`.
- `autorise une nouvelle candidature après un retrait` vérifie `not.toThrow()`.

Ces tests vérifient la contrainte de base de données, pas directement le contrat HTTP EF-32.

## EF-33 — Consulter ses candidatures et leur statut

| Cas attendu | Test existant | Assertions utiles | Couverture |
|---|---|---|---|
| Un étudiant peut consulter ses candidatures | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `liste uniquement les candidatures de l'étudiant connecté` | `status === 200`, longueur `1`, puis vérification de tous les champs du DTO avec `toEqual` | **Couvert** |
| Un étudiant ne voit pas les candidatures d'un autre étudiant | Même test | `toHaveLength(1)` et `toEqual` sur l'identifiant de Lucas excluent les autres résultats du seed | **Couvert sur le jeu de données actuel** |
| Le statut « En cours » est exposé | Même test | `response.body[0].status === "IN_PROGRESS"` | **Couvert** |
| Le statut « Retenue » est exposé | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `retourne les statuts sélectionnée, refusée et retirée` | GET de Mateusz et `status === "SELECTED"` | **Couvert** |
| Le statut « Non retenue » est exposé | Même test | GET de Léa et `status === "REJECTED"` | **Couvert** |
| Le statut « Retirée » est exposé | Même test | GET d'Inès et `status === "WITHDRAWN"` | **Couvert** |
| Les candidatures retirées restent consultables | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `crée une candidature puis autorise le retrait et la recandidature` | scénario POST → DELETE → GET avec vérification de l'identifiant, du message et de `WITHDRAWN` | **Couvert** |
| Un profil non étudiant ne peut pas consulter les candidatures | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse l'accès aux profils non étudiants` | `GET /applications` avec un administrateur : `status === 403` et `error.code === "FORBIDDEN"` | **Couvert** |
| Une consultation sans session est refusée | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `refuse une consultation sans session` | `status === 401` et `error.code === "UNAUTHENTICATED"` | **Couvert** |
| La consultation renvoie les champs complets attendus | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), `liste uniquement les candidatures de l'étudiant connecté` | `toEqual` vérifie `id`, offre, entreprise, année, période, message, statut et date | **Couvert** |

## Synthèse

| Exigence | Cas couverts | Cas partiels | Cas absents |
|---|---:|---:|---:|
| EF-32 | candidature publiée, message facultatif, offre non publiée, doublon, retrait accepté, persistance `WITHDRAWN`, recandidature, retraits `SELECTED`/`REJECTED`, contrôle POST et DELETE | filtrage de propriété vérifié sur le seed actuel | Aucun cas prioritaire absent |
| EF-33 | consultation étudiant, filtrage sur l'étudiant courant, statuts `IN_PROGRESS`/`SELECTED`/`REJECTED`/`WITHDRAWN`, historique après retrait, GET sans session, champs complets | filtrage de propriété vérifié sur le seed actuel | Aucun cas prioritaire absent |

Il n'existe pas de test frontend dédié aux candidatures : aucun fichier `frontend/tests/ApplicationsPage.test.tsx` n'est présent. Les tests frontend existants concernent principalement les offres, l'authentification, les entreprises et les guards.

## Tests présents mais hors EF-32/EF-33

- [`backend/tests/db/constraints.test.ts`](../backend/tests/db/constraints.test.ts) : contraintes des offres, contacts, entreprises, stages et dates.
- [`backend/tests/db/migrations.test.ts`](../backend/tests/db/migrations.test.ts) : création des tables, idempotence des migrations et clés étrangères.
- [`backend/tests/db/seed.test.ts`](../backend/tests/db/seed.test.ts) : volumes, idempotence et cohérence du jeu de données.
- [`backend/tests/auth.test.ts`](../backend/tests/auth.test.ts) : mode démo, jetons, comptes désactivés et relecture des rôles.
- [`backend/tests/companies.test.ts`](../backend/tests/companies.test.ts) : accès et recherche des entreprises.
- [`backend/tests/offers.test.ts`](../backend/tests/offers.test.ts) : visibilité des offres par profil et filtre de période.
- [`backend/tests/health.test.ts`](../backend/tests/health.test.ts) : santé de l'API et route inconnue.
- [`backend/tests/permissions.test.ts`](../backend/tests/permissions.test.ts) : prédicats d'autorisation.
- [`frontend/tests/App.test.tsx`](../frontend/tests/App.test.tsx), [`LoginPage.test.tsx`](../frontend/tests/LoginPage.test.tsx), [`CompaniesPage.test.tsx`](../frontend/tests/CompaniesPage.test.tsx), [`OffersPage.test.tsx`](../frontend/tests/OffersPage.test.tsx), [`NavBar.test.tsx`](../frontend/tests/NavBar.test.tsx) et [`guards.test.ts`](../frontend/tests/guards.test.ts) : interface, sessions, offres, entreprises et validation des réponses API.
