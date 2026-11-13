# Bilan de la séance — Semaine 3

- **Qu’ai-je appris ?**  
  J’ai découvert la distinction entre les guides (*feedforward*, comme `.github/copilot-instructions.md` ou le cahier des charges) qui orientent l’agent en amont, et les senseurs (*feedback*, comme `oxlint`, `tsc` et `vitest`) qui vérifient le résultat produit. J’ai aussi appris qu’une suite de tests qui passe au vert ne garantit pas à elle seule que tous les cas limites et de sécurité (ex. refus sans session, contrôle de propriété) d’une exigence sont réellement couverts.

- **Qu’est-ce qui a bien fonctionné ?**  
  Donner à l’agent un contexte structuré (la matrice de traçabilité EF-32 / EF-33) lui a permis de cibler précisément les 7 scénarios manquants dans `backend/tests/applications.test.ts` sans toucher au code applicatif. L’exécution systématique de `npm run check` après chaque ajout a immédiatement validé le lint, le typage, les tests et le build.

- **Qu’est-ce qui a moins bien fonctionné ?**  
  Lors de l’exploration initiale et de l’audit des supports Web 2, l’agent a tendance à vouloir tout lister de manière exhaustive ou à proposer des règles génériques (comme sur l’accessibilité ou JWT) qui dépassent le cadre strict du projet. Il a fallu relire les fichiers réels et recentrer ses propositions pour éviter d’alourdir inutilement les consignes.