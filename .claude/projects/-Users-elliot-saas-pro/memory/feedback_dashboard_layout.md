---
name: Dashboard stats order and date display
description: User wants stats reordered (Clients first, CA last) and today's date shown in "Ma journée" section
type: feedback
---

Réordonner les stats du dashboard : Clients, RDV ce mois, En attente, CA du mois (pas CA en premier).
Ajouter la date du jour dans la section "Ma journée".

**Why:** Le CA en premier n'est pas la priorité visuelle d'un artisan. Clients et RDV sont plus importants au quotidien.

**How to apply:** Modifier l'ordre du tableau stats[] dans src/app/(dashboard)/page.tsx.
