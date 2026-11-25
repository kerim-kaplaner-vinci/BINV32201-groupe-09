# Bilan de la semaine 5 — MCP et tests end-to-end avec Playwright

## 1. Scénarios

Les scénarios sont décrits dans [`e2e/recherche-offres/scenarios.md`](../../e2e/recherche-offres/scenarios.md). Ils ont été rédigés et commités avant toute exécution ou génération de tests par Copilot.

| Numéro | Scénario | Saisie | Résultat attendu |
|---|---|---|---|
| 1 | Recherche avec résultat (cas nominal) | `application`, connecté comme l'étudiant Lucas Dupont | « 1 offre » : seule « Application React de gestion de flotte » est affichée |
| 2 | Recherche sans résultat (cas limite) | `blockchain`, connecté comme l'étudiant Lucas Dupont | Message « Aucune offre ne correspond à la recherche. », aucun tableau ni compteur |

**Justification du choix**

- **Scénario 1** : un seul parcours vérifie trois règles de la semaine 9 à la fois, à savoir le filtrage par titre, l'insensibilité à la casse (`application` contre « Application ») et la visibilité réservée aux offres publiées. Le seed contient « Migration d'une application vers le cloud », une offre attribuée (`ASSIGNED`) dont le titre contient aussi le mot recherché. Sans elle, la règle de visibilité ne serait pas réellement testée, ce qui était déjà une faiblesse relevée en semaine 4.
- **Scénario 2** : il vérifie que l'interface distingue une recherche sans résultat d'une liste vide en général, grâce au message spécifique.
- Les mots recherchés sont sans accent, car le `LIKE` de SQLite n'ignore la casse que pour les caractères ASCII.
- La recherche ne modifie aucune donnée : en partant du seed (`npm run db:reset`), les tests sont répétables sans nettoyage.

## 2. Playwright MCP

**Configuration** : le serveur Playwright MCP a été lancé dans un terminal avec `npx -y @playwright/mcp@latest --isolated --port 8931`, puis déclaré dans `.mcp.json` à la racine (serveur `playwright`, type `http`, URL `http://localhost:8931/mcp`). Au premier essai, VS Code affichait le serveur comme arrêté : il a fallu le démarrer depuis `MCP: List Servers` → `Start Server`.

**Scénario exécuté** : scénario 1. **Résultat : conforme.** Copilot s'est connecté comme Lucas Dupont, a ouvert « Offres », a saisi `application` et a relevé « 1 offre » avec uniquement « Application React de gestion de flotte » (Lumen Digital). « Migration d'une application vers le cloud » et les autres offres publiées n'apparaissaient pas. Aucun fichier n'a été modifié et aucun script n'a été généré. J'ai vu le navigateur être piloté et j'ai constaté le même résultat à l'écran.

**Appels d'outils observés** (8 appels dans le premier groupe : `Navigate to a URL`, `Page snapshot`, deux `Click`…)

1. **`browser_click`** (« Click ») :
   - entrée : `target: "e30"`, `element: "le bouton utilisateur de démonstration Lucas Dupont"` ;
   - sortie : le code Playwright réellement exécuté, `await page.getByRole('button', { name: 'Lucas Dupont' }).click();`, l'URL (`http://localhost:5173/`), le titre de la page (`Gesta`) et un lien vers le snapshot enregistré.
2. **`browser_type`** (« Type text ») :
   - entrée : `target: "e141"`, `element: "le champ Rechercher par titre"`, `text: "application"` ;
   - sortie : `await page.getByRole('searchbox', { name: 'Rechercher par titre' }).fill('application');`.
3. **`browser_snapshot`** (« Page snapshot », après la saisie) : renvoie l'arbre d'accessibilité de `/offres` au format YAML. On y lit `searchbox "Rechercher par titre" [ref=e141]: application`, `paragraph: 1 offre` et une seule ligne de données dans le tableau, `row "Application React de gestion de flotte Lumen Digital 2026-2027 P2 Publiée"`.

Les références `e30` et `e141` viennent du snapshot : l'agent désigne un élément par sa référence dans l'arbre d'accessibilité, et le serveur MCP le traduit en sélecteur Playwright (`getByRole`).

Captures : `docs/semaine-5/captures/`.

## 3. Playwright Test

**Fichiers créés ou modifiés**

- `playwright.config.ts` : `testDir: "./e2e"`, `baseURL: "http://localhost:5173"`, projet chromium, `webServer` qui lance `npm run dev` avec `reuseExistingServer: true` ;
- `package.json` (racine) : script `test:e2e` (`playwright test`) ;
- `.gitignore` : dossiers générés par Playwright ;
- `e2e/recherche-offres/recherche-offres.spec.ts` : deux tests, un par scénario.

**Principales assertions**

Chaque test se connecte lui-même comme Lucas Dupont et vérifie d'abord que le titre « Offres de stage » et le tableau sont affichés. La saisie se fait ensuite dans `getByLabel("Rechercher par titre")`.

- *Scénario 1* :
  - `getByText("1 offre")` est visible ;
  - les lignes du tableau ont `toHaveCount(2)` (l'en-tête plus une offre), ce qui prouve le filtrage puisque « Application React… » est déjà visible avant la recherche ;
  - la ligne contient « Application React de gestion de flotte » et « Lumen Digital » ;
  - les cellules « Migration d'une application vers le cloud » (règle de visibilité) et « API REST de facturation » (filtrage) ont `toHaveCount(0)`.
- *Scénario 2* :
  - le message « Aucune offre ne correspond à la recherche. » est visible ;
  - le message « Aucune offre à afficher. » est absent ;
  - il n'y a aucun tableau et aucun compteur `/^\d+ offres?$/`.

Les sélecteurs reposent sur les rôles et les libellés accessibles, sans classe CSS. Il n'y a aucun `waitForTimeout` : les `expect` attendent automatiquement la réponse de la recherche, déclenchée 300 ms après la saisie.

**Exécutions** (`npx playwright test`, lancé par moi, car la sandbox de Copilot bloque le navigateur)

| Exécution | Résultat |
|---|---|
| 1 | 2 passed (3.0 s) |
| 2 | 2 passed (2.7 s) |
| En mode `--headed` | 2 passed (6.1 s) |

**`npm run check`** : réussi.

- Lint : 0 avertissement et 0 erreur dans les deux workspaces.
- Typecheck : réussi.
- Backend : 10 fichiers et 137 tests passés.
- Frontend : 7 fichiers et 50 tests passés.
- Build : réussi.

`npm run check` ne lance pas les tests E2E, qui se lancent explicitement avec `npx playwright test` ou `npm run test:e2e`.

## 4. Vérification : le test détecte-t-il un défaut ?

**Défaut introduit temporairement** dans `backend/src/repositories/offers.repository.ts` : le filtre par titre a été désactivé.

```diff
- AND (@pattern IS NULL OR o.title LIKE @pattern ESCAPE '\\')
+ AND (@pattern IS NULL OR 1 = 1)
```

**Résultat** : 2 tests échoués, chacun sur une assertion du résultat.

- Scénario 1 : `expect(getByText('1 offre')).toBeVisible()` échoue (`element(s) not found`), car toutes les offres visibles restent affichées.
- Scénario 2 : `expect(getByText('Aucune offre ne correspond à la recherche.')).toBeVisible()` échoue, car un tableau s'affiche à la place du message.

Les échecs viennent bien du défaut et non de la configuration ou de la connexion. Dans les deux tests, la connexion, l'ouverture de la page « Offres » et l'affichage du tableau ont été vérifiés avec succès avant la saisie ; seule l'assertion sur le résultat de la recherche échoue.

**Après restauration** (`git checkout -- backend/src/repositories/offers.repository.ts`) : 2 passed (3.3 s). `git status` confirme qu'aucun défaut ne reste dans le code.

## 5. Comparaison

**1. Que permet Playwright MCP dans la conversation avec l'agent ? Quelle action précise avez-vous vu passer par un outil MCP ?**

Playwright MCP donne à l'agent des outils pour piloter un vrai navigateur pendant la conversation : naviguer, cliquer, saisir du texte et lire l'état de la page. L'agent ne voit pas une image de la page mais un snapshot de l'arbre d'accessibilité, dans lequel chaque élément a une référence. J'ai vu par exemple l'appel `browser_type` avec `target: "e141"` et `text: "application"`, que le serveur a exécuté sous la forme `page.getByRole('searchbox', { name: 'Rechercher par titre' }).fill('application')`.

**2. Qu'apportent les scripts Playwright Test que le compte rendu d'un test par MCP n'apporte pas ?**

Un script est versionné, relisible et réexécutable à l'identique sans agent ni conversation, par exemple dans une chaîne CI/CD. Ses assertions sont explicites et donnent un verdict déterministe (passé ou échoué), alors que le compte rendu MCP est une interprétation de l'IA qu'il faut vérifier soi-même. Le script a aussi prouvé qu'il détecte une régression : il a échoué quand le filtre a été désactivé.

**3. Dans quel cas préféreriez-vous une exploration interactive avec MCP ? Dans quel cas préféreriez-vous un test automatisé ?**

Je préférerais MCP pour explorer rapidement une fonctionnalité nouvelle ou mal connue, pour vérifier un comportement ponctuel ou reproduire un bug, ou pour découvrir les sélecteurs et les étapes d'un parcours avant d'écrire un test. Je préférerais un test automatisé pour tout comportement qui doit rester vrai dans le temps : vérifier qu'une modification ne casse rien, l'intégrer à la CI et obtenir un résultat reproductible. Les deux approches sont complémentaires : MCP aide à explorer, Playwright Test conserve les vérifications.

## Conversations Copilot

- [`conversation-1.md`](conversation-1.md) : lecture des règles EF-30, du bilan de semaine 4 et du seed et exécution du scénario 1 avec Playwright MCP
- [`conversation-2.md`](conversation-2.md) : configuration de Playwright Test et génération des tests
