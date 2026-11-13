## Modifications et vérification

### Tests ajoutés et améliorés (`backend/tests/applications.test.ts`)
Pour combler les lacunes identifiées lors de l'analyse initiale de la matrice de traçabilité, plusieurs nouveaux scénarios et assertions ont été ajoutés dans `backend/tests/applications.test.ts` :
1. **`refuse une consultation sans session`** : Vérifie qu'un `GET /applications` sans en-tête `Authorization` renvoie une erreur HTTP `401` (`UNAUTHENTICATED`).
2. **`refuse une candidature sans session`** : Vérifie qu'un `POST /applications` sans en-tête `Authorization` renvoie une erreur HTTP `401` (`UNAUTHENTICATED`).
3. **`refuse une candidature par un profil non étudiant`** : Vérifie qu'une tentative de candidature avec un profil `ADMIN` est bloquée par le serveur (`403 FORBIDDEN`).
4. **`retourne les statuts sélectionnée, refusée et retirée`** : Vérifie explicitement lors de la consultation `GET` l'exposition des statuts `SELECTED`, `REJECTED` et `WITHDRAWN` sur les étudiants correspondants du jeu de données (`Mateusz`, `Léa`, `Inès`).
5. **Amélioration de `crée une candidature puis autorise le retrait et la recandidature`** : Ajout d'une requête `GET /applications` intermédiaire après le `DELETE` afin de vérifier la persistance en base du statut `WITHDRAWN` (et non uniquement le code HTTP `204`).
6. **`ne permet pas le retrait d'une candidature refusée`** : Vérifie qu'un `DELETE` sur une candidature au statut `REJECTED` échoue avec un code `409` (`APPLICATION_NOT_WITHDRAWABLE`).
7. **`refuse le retrait de la candidature d'un autre étudiant`** : Vérifie l'isolation et le contrôle de propriété en empêchant un étudiant de retirer la candidature d'un autre (`404 NOT_FOUND`).
8. **`refuse un identifiant de candidature invalide`** : Vérifie le rejet d'un identifiant malformé sur la route de suppression (`400 INVALID_BODY`).

> **Exemple de défaut détectable :** Le test `refuse le retrait de la candidature d'un autre étudiant` échouerait immédiatement si la requête SQL de suppression dans `applications.repository.ts` filtrait uniquement sur `WHERE id = ?` en omettant la clause `AND student_id = ?` (faille de sécurité de type IDOR).

### Commandes lancées et résultats
La chaîne complète de validation du projet a été exécutée dans le terminal via la commande globale :

```bash
npm run check
```

**Résultats obtenus :**
- **Linting (`npm run lint`)** : Succès (`oxlint --deny-warnings` : 0 erreur, 0 avertissement sur l'ensemble des workspaces backend et frontend).
- **Vérification des types (`npm run typecheck`)** : Succès (`tsc --noEmit` et `tsc -b` exécutés sans aucune erreur de typage).
- **Tests automatisés (`npm test`)** : Succès — l'intégralité des suites backend (incluant désormais les 13 tests de `applications.test.ts`) et frontend passe au vert.
- **Compilation (`npm run build`)** : Succès — génération du code compilé backend (`dist/`) et du bundle de production frontend (`vite build`) sans erreur.

### Vérifications manuelles et limites
- **Limites techniques** : Le projet ne dispose pas de tests end-to-end automatisés (type Playwright ou Cypress) ni de suite de tests de composants dédiée à `ApplicationsPage.tsx`. Par conséquent, le rendu visuel des badges de statut et le masquage dynamique des boutons d'action dans l'interface ne sont pas couverts par Vitest. De plus, l'isolation des données en lecture (`GET`) est vérifiée sur le périmètre du jeu de données initial (`seed`).
- **Vérifications manuelles effectuées** : Les parcours complets dans l'interface graphique (soumission d'une candidature avec et sans message, disparition du bouton sur une offre déjà postulée, retrait d'une candidature en cours, absence du bouton de retrait pour les candidatures déjà traitées et bascule entre comptes utilisateurs de démonstration) ont été validés manuellement dans le navigateur.