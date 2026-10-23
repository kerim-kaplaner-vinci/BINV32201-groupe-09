**Qu'ai-je appris ?**
J'ai appris l'importance de gérer strictement l'environnement d'exécution (conflits de versions Node.js) et la nécessité de brider l'agent IA avec le mode "Manual permissions" et un fichier d'instructions (`copilot-instructions.md`) pour auditer chaque proposition sans qu'il n'agisse de son propre chef.

**Qu'est-ce qui a bien fonctionné ?**
L'utilisation de la commande `@workspace` avec un message d'erreur ciblé a été extrêmement efficace. En fournissant l'erreur exacte du test (`Found multiple elements with the text: Autre`), l'agent a su localiser immédiatement le fichier `OffersPage.test.tsx` et proposer la bonne correction (`getByRole` au lieu de `getByText`).

**Qu'est-ce qui a moins bien fonctionné ?**
La résolution des problèmes d'environnement local (l'ancienne version 20.18 de Node bloquée dans `/usr/local/bin/node`) a ralenti la progression. L'agent IA est très performant pour le code, mais les conflits systèmes dans le terminal nécessitent encore une résolution et un nettoyage manuels fastidieux (`rm -rf node_modules`, commandes `sudo`).