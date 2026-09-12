---
name: quest-stat-reassignment-plan
description: Plan to realign quest rewards with their actual stat effects
---

# Context
The user wants to fix the mismatch between quest rewards and the stats they actually increase. Currently, some quests provide stat increases that don't match their description or intended progression.

# Recommended Approach
1. Identify all quest definitions where stats are defined.
2. Cross-reference these with the stat update logic to see what stats are "actually" increased.
3. Determine the correct mapping between quest rewards (as described) and the internal stat modifications.
4. Modify the quest definition files to ensure consistency.

# Critical Files
- Look for `*quest*` or `*stat*` files in the repository.

# Verification
- Run tests (or manual verification) to ensure that completing a remapped quest correctly increases the intended stat.
