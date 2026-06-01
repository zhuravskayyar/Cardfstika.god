# League Icon Assets

Runtime league ids use the new medieval titles. Add final SVG icons with these names:

- `league-novice-3.svg`, `league-novice-2.svg`, `league-novice-1.svg` = Послушник III / II / I
- `league-squire-3.svg`, `league-squire-2.svg`, `league-squire-1.svg` = Зброєносець III / II / I
- `league-knight-3.svg`, `league-knight-2.svg`, `league-knight-1.svg` = Лицар III / II / I
- `league-commander-3.svg`, `league-commander-2.svg`, `league-commander-1.svg` = Командор III / II / I
- `league-paladin-3.svg`, `league-paladin-2.svg`, `league-paladin-1.svg` = Паладин III / II / I
- `league-inquisitor-3.svg`, `league-inquisitor-2.svg`, `league-inquisitor-1.svg` = Інквізитор III / II / I
- `league-master-3.svg`, `league-master-2.svg`, `league-master-1.svg` = Магістр Ордену III / II / I

Rank rule: `3` is III, `2` is II, `1` is I and the strongest inside the title.

The duel UI first resolves the new filename. If it is missing, it can fall back to legacy files such as `league-gray-3.svg`; if no icon exists, it renders a safe text badge.
