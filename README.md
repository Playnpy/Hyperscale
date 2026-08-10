# HYPERSCALE — Compute Empire

Jeu de gestion (tycoon) en HTML/CSS/JS vanilla, sans dépendance ni build. Thème : bâtis et exploite un empire de centres de données qui vend de la puissance de calcul à des clients IA.

## Lancer en local

Ouvre simplement `index.html` dans un navigateur, ou sers le dossier avec un petit serveur statique (recommandé pour éviter les restrictions `file://`) :

```bash
npx serve .
# ou
python3 -m http.server 8000
```

## Déploiement sur Vercel

Aucune configuration nécessaire : c'est un site 100% statique.

```bash
npm i -g vercel
vercel
```

Ou via le dashboard Vercel : "Add New Project" → importe ce dossier/repo → Framework Preset = **Other** → Deploy. `vercel.json` est déjà présent pour servir les fichiers statiques tels quels.

## Structure

```
index.html   → structure de l'interface (boot screen + shell de jeu)
style.css    → design system (tokens couleur/typo, layout, composants)
game.js      → toute la logique de jeu (état, boucle, rendu, sauvegarde)
```

## Mécaniques de jeu implémentées

- **Ressources & capacités** : cash (avec indicateur de flux net +/-$/jour), énergie (MW), compute CPU et GPU (PFLOPS, jauges séparées), stockage (TB), réputation, points de recherche, et **alloys rares** (ressource tardive débloquée par la recherche).
- **Facilities par catégorie** : 8 tuiles sur le tableau de bord (Power, CPU, GPU, Storage, Cooling, Security, R&D, Supply Chain). Cliquer une tuile ouvre une fenêtre dédiée avec une grille d'emplacements (6 au départ, extensibles par lots de 4, coût croissant ×2,2) où l'on construit uniquement les bâtiments propres à cette catégorie — fini le mélange dans une grille unique.
- **Deux tiers de bâtiments par catégorie** : un bâtiment standard dès le départ (Solar Farm, CPU Rack, GPU Cluster, Storage Vault, Cooling Unit, Security Hub, R&D Lab) + un bâtiment avancé tier 2 débloqué par une recherche dédiée et coûtant des alloys rares (Nuclear Reactor, Neuromorphic Array, Quantum Accelerator, Holographic Archive, Cryo-Cooling Array, AI Sentinel Grid, Quantum Lab, Orbital Mining Array). Amélioration de niveau sans plafond fixe : le cap augmente avec la recherche (3 → jusqu'à 10+).
- **Personnel** : 5 types d'employés, dont l'**Account Manager** — automatise l'acceptation des contrats (progression cumulative, plus de managers = rythme plus rapide) une fois la phase de lancement manuelle passée.
- **Contrats clients** : génération dynamique (entraînement IA, inférence, stockage) + contrats **Enterprise** (2,5×–5× plus gros) dès 70 de réputation. Acceptation manuelle possible à tout moment, mais l'auto-accept prend le relais en milieu/fin de partie.
- **Arbre de recherche à niveaux multiples** : la plupart des technologies se rachètent plusieurs fois (jusqu'à 5-8 niveaux, coût croissant à chaque achat) pour un sink de recherche permanent, plus 8 technologies de déblocage (coûtant recherche + alloys rares) donnant accès aux bâtiments tier 2.
- **Supply Chain** : facility cachée qui se débloque automatiquement après un certain total de niveaux de recherche — génère les alloys rares nécessaires aux technologies et bâtiments avancés.
- **Système de Prestige (IPO)** : dès $750 000 de trésorerie, "Go Public" réinitialise facilities/cash/staff/recherche contre un bonus permanent cumulatif (+15% revenus, +10% réputation par niveau) et un titre d'opérateur évolutif — boucle de rejouabilité infinie.
- **Événements aléatoires** : coupures de courant, canicules, cyberattaques, demande virale, pénuries de GPU, audits réglementaires, trouvailles de salvage.
- **Boucle temporelle** avec contrôle de vitesse (pause/1×/2×/4×), 20 succès, sauvegarde locale, écran de faillite/game over.
- **Onboarding complet** : kit de démarrage gratuit, période de grâce de 7 jours, contrat de démarrage garanti, tutoriel guidé interactif, bulles de conseil contextuelles (Advisor, espacées d'au moins 5 jours), notifications toast positionnées en haut à gauche pour ne rien masquer.
- **UI** en dashboard style "salle serveurs" (LED de statut, jauges CPU/GPU séparées, production affichée directement sur chaque bâtiment), responsive mobile/desktop.

## Notes de conception (v2 — refonte long terme)

Cette version remplace la grille de campus unique par un système de facilities par catégorie, ajoute un arbre de recherche à niveaux multiples, automatise les contrats en fin de partie via les Account Managers, et introduit une ressource rare + des bâtiments tier 2 pour donner un vrai contenu de milieu/fin de partie. Testé via un harnais de simulation headless (construction, expansion, recherche, auto-accept, IPO) pour vérifier l'absence de plantage avant livraison — voir l'historique de conversation pour le détail des vérifications effectuées.

## Notes de conception (v2.1 — équilibrage)

- **Coût de recrutement croissant** : chaque nouvel employé d'un type donné coûte ~15-20% de plus que le précédent (le salaire journalier, lui, reste fixe par unité).
- **Rythme économique ralenti** : entretien des bâtiments +15%, gains des contrats -15% environ. Validé par simulation : une partie jouée "normalement" sur 90 jours progresse de $25k à ~$45-60k sans jamais frôler la faillite, avec une réputation stable autour de 45-50.
- **Conversion tier 1 → tier 2** : une fois la recherche de déblocage effectuée, n'importe quel bâtiment standard existant (ex. Solar Farm) peut être directement converti dans sa version avancée (ex. Nuclear Reactor) depuis sa fenêtre de gestion, avec un crédit de reprise basé sur son niveau actuel — inutile de démolir puis reconstruire.
- **Correctif de cohérence** : le Technicien, qui ne servait à rien mécaniquement, réduit désormais réellement la sévérité des pannes de courant et canicules. Les contrats expirés ne pénalisent plus la réputation s'ils étaient de toute façon impossibles à honorer faute d'infrastructure construite (ex. contrat GPU sans aucun GPU Cluster) — seule la négligence réelle (contrat qu'on pouvait honorer mais qu'on a laissé filer) est sanctionnée.

## Notes de conception (v2.2 — tier 2 exigeant + tier 3 "Singularity")

- **Déblocages tier 2 plus exigeants** : chaque techno de déblocage (Nuclear Program, Quantum Accelerators, etc.) exige désormais un niveau minimum en AI Cyber Shield et Liquid Cooling, plus au moins un bâtiment Cooling et un bâtiment Security réellement construits — impossible de foncer sur une seule catégorie en ignorant le reste.
- **Tier 3 — "Singularity Programs"** : un troisième palier de bâtiments (Fusion Core, Photonic Mesh, Singularity Array, Dimensional Vault, Zero-Point Field, Quantum Encryption Shield, Singularity Think Tank, Fabrication Complex), avec des coûts environ 15-20× supérieurs au tier 2 et des prérequis d'infrastructure bien plus stricts (recherche niveau 5-6, plusieurs bâtiments par catégorie, 3+ bâtiments tier 2 déjà en place). Rythme volontairement beaucoup plus lent, pour un vrai contenu de fin de partie.
- **Singularity Cores** : nouvelle ressource raffinée, produite uniquement par le Fabrication Complex qui consomme des rare alloys pour les transformer lentement — une chaîne de production à deux étages (minerai brut → ressource raffinée) pour le end-game.
- **Chemin de conversion généralisé** : la même mécanique gère maintenant tier1→tier2 ET tier2→tier3, avec crédit de reprise à chaque étape.
- **Récompense "Singularity Mode"** : la construction du tout premier bâtiment tier 3 déclenche une modale de célébration, active un thème visuel scintillant violet/doré sur toute l'interface (bordure du bandeau animée, halo sur les catégories concernées), et débloque un nouveau tier de contrats "Singularity" (7-12× plus gros qu'Enterprise) pour donner un usage concret à ce matériel de pointe.
- Panneau R&D réorganisé en 3 sections (Efficiency & Scaling / Advanced Hardware / Singularity Programs) avec indication claire des prérequis d'infrastructure manquants.
- Testé via simulation headless complète (infra tier2/tier3, chaîne de production Singularity Cores, conversion générique, régression sur le rythme économique et le coût du personnel) avant livraison.