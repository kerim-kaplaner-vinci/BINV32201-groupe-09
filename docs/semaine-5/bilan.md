# Bilan de la séance

## Qu'ai-je appris ?

J'ai compris le rôle de MCP : Copilot est le client, et Playwright MCP est un serveur local, joignable en HTTP sur `localhost`, qui lui fournit des outils pour piloter un navigateur. J'ai découvert que l'agent ne « voit » pas la page comme une image, mais à travers un snapshot de l'arbre d'accessibilité : il désigne un élément par une référence (`e141`) que le serveur traduit en code Playwright (`getByRole(...)`). J'ai aussi appris qu'un test ne vaut que s'il échoue quand le code est cassé : désactiver temporairement le filtre de recherche m'a permis de le prouver.

## Qu'est-ce qui a bien fonctionné ?

- Écrire et committer les scénarios avant de solliciter Copilot : les résultats attendus étaient précis (« 1 offre », message exact), ce qui rendait les écarts faciles à repérer.
- Donner du contexte dans les prompts : la connexion de démonstration, le délai de 300 ms avant la recherche et le fait qu'une simple vérification de présence ne suffit pas. Copilot a ainsi produit des assertions solides (`toHaveCount(2)` sur les lignes, absence de l'offre non publiée) au lieu d'une suite de clics.
- Ne pas me fier au compte rendu de l'agent : j'ai suivi le navigateur piloté par MCP et lancé moi-même les tests deux fois, puis `npm run check`.
- La vérification par défaut volontaire : les deux tests ont échoué sur leurs assertions et non sur la connexion, puis ont repassé après la restauration.

## Qu'est-ce qui a moins bien fonctionné ?

- La mise en route de MCP : VS Code affichait le serveur comme « arrêté », et il a fallu le démarrer manuellement depuis `MCP: List Servers`.
- Les appels d'outils apparaissent sous un nom lisible (« Type text ») plutôt que sous leur nom technique (`browser_type`), ce qui les rend difficiles à retrouver pour la documentation.
- La sandbox de Copilot empêche de lancer le navigateur : l'agent génère les tests mais ne peut pas les exécuter, donc je dois lui transmettre les résultats à la main.
- Le serveur MCP enregistre ses snapshots dans `.playwright-mcp/` à la racine du projet : il faut penser à l'exclure du dépôt.
