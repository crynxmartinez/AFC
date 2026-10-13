# Persistent navigation — 2026-10-14

Cause: the optional catch-all page mounted `Arena`, including its shared state and entire navigation shell. Changing route segments remounted it and showed the startup screen again.

Fix: the root layout now owns `Arena`; the routed page renders only `ArenaPage`. Shared data, search, header, sidebar, and mobile navigation stay mounted. A route-level loading boundary confines pending content to the main area. Actions continue refreshing shared data after mutations; no private account state is persisted to browser storage.

Validation: production build and all six existing tests passed. Browser checks covered Explore → Contests → Wallet → Back on desktop and Contests → Saved → Contests at 390 × 844. The search value `Magic` persisted, wallet balance remained visible, and only the inner content changed. Screenshot: `screenshots/persistent-navigation.png`.
