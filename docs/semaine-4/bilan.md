# Bilan de la séance

## Qu'ai-je appris ?

J'ai appris qu'un agent peut respecter le TDD sans qu'on le lui rappelle : en demandant simplement la fonctionnalité de recherche, Copilot a lu le skill, écrit les tests d'abord et s'est arrêté pour attendre ma validation avant de toucher au code de production. J'ai aussi compris qu'un test vert ou rouge ne suffit pas : il faut lire les assertions pour savoir ce qu'il prouve réellement (par exemple, un test de visibilité n'a de valeur que s'il existe une offre non publiée portant le mot recherché).

## Qu'est-ce qui a bien fonctionné ?

- La pause de validation du skill : elle m'a obligé à relire les tests avant l'implémentation, et c'est là que j'ai repéré des faiblesses.
- Le contrôle qualité sur les tests rouges : j'ai vérifié qu'ils échouaient pour la bonne raison (paramètre `q` ignoré, champ « Rechercher par titre » absent) et pas à cause d'une erreur de syntaxe ou d'installation.
- Des demandes précises à l'agent : donner les règles métier et le périmètre (accents et recherche approximative exclus) a évité qu'il parte dans toutes les directions.
- La vérification finale : relancer les tests et `npm run check` moi-même plutôt que de me fier à son résumé.

## Qu'est-ce qui a moins bien fonctionné ?

Le premier lot de tests de Copilot avait trois défauts : un test de visibilité trop faible, un test de validation (`INVALID_QUERY`, 100 caractères) qui ajoutait une règle que je n'avais pas demandée, et un test du message « aucune offre » qui ne saisissait aucune recherche. L'agent a aussi ajouté de lui-même une validation de `q` hors consignes, ce qui montre qu'il faut relire le diff pour détecter les ajouts non demandés. Enfin, son message de synthèse était parfois incomplet : il ne répondait pas à toutes mes remarques, donc je devais le relancer pour obtenir des confirmations.
