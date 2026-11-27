# Bilan global du projet — Gesta

## 1. Ce que j'ai appris sur l'ensemble du projet

- **Encadrer l'agent IA (guides et vérifications)** : J'ai compris qu'un agent IA est efficace uniquement s'il est guidé en amont (consignes dans `.github/copilot-instructions.md`, cahier des charges, architecture) et contrôlé après par des outils automatiques (`npm run check` : lint, typage, tests et build).
- **Garder le contrôle sur les modifications** : Découper le travail, utiliser des *skills* précis (comme l'audit de tests ou le TDD avec validation humaine obligatoire) et restreindre les permissions dans VS Code permet d'éviter que l'agent modifie tout le projet d'un coup ou masque des erreurs.
- **Écrire de vrais tests utiles** : Grâce au TDD et aux matrices de traçabilité, j'ai appris à vérifier les cas limites et la sécurité (droits d'accès par rôle, refus sans connexion) plutôt que de me fier uniquement à des tests qui passent au vert.
- **Distinguer MCP et Playwright Test** : J'ai compris la différence entre **Playwright MCP** (qui sert à piloter le navigateur en direct avec l'agent pour explorer une fonctionnalité) et **Playwright Test** (qui génère des vrais scripts de tests reproductibles sans avoir besoin de l'IA).

## 2. Ce que je n'ai pas appris mais aurais aimé apprendre

- **Automatiser les tests en CI/CD** : Tout a été lancé manuellement en local sur ma machine. J'aurais aimé configurer un pipeline GitHub Actions pour lancer automatiquement tous les tests (`npm run check` et Playwright) à chaque Pull Request.
- **Utiliser des agents en parallèle** : Nous avons travaillé étape par étape sur une seule fonctionnalité à la fois. J'aurais aimé voir comment gérer plusieurs agents en parallèle.