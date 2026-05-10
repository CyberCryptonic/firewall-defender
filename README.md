# Firewall Defender: Cyber Breach

A static 5-level cybersecurity browser game built only with HTML, CSS, and JavaScript.

## Play
Open `index.html` in Chrome or Edge, then click **Start Defense**.

## Core Rules
- Move with **WASD** or **Arrow Keys**.
- Start with **3 lives**.
- Collect all required security assets in each level.
- The server exit stays locked until all assets are collected.
- Touching malware or phishing traps removes one life and resets player position.
- Finish all **exactly 5 levels** to see **Network Secured**.

## Levels
1. Network Login
2. Malware Maze
3. Phishing Storm
4. Patch Rush
5. Core Lockdown

## Tech + Safety
- Static GitHub Pages compatible site.
- No backend, database, auth, forms, uploads, libraries, or network/API calls.
- No `eval`, `new Function`, or `document.write`.
- CSP meta tag included in `index.html`.

## Developer Manual Test Helper (No UI Cheats)
Use this quick path to manually validate all 5 levels without adding cheat buttons:

1. Open `index.html` and click **Start Defense**.
2. For each level, verify in order:
   - Exit starts locked (`Assets` less than required).
   - Collect every asset; check score goes up by **100 per asset** and `Assets` count increments.
   - Confirm exit unlocks only after required assets are collected.
   - Touch one malware/trap once and confirm exactly one life is lost and player resets to spawn.
   - Reach the exit to advance.
3. Repeat until Level 5 is completed; confirm victory appears only after Level 5.
4. Click **Play Again** from victory and confirm full reset: Level 1, 3 lives, score 0, assets reset.

Speed tip for repeat passes: in DevTools, temporarily run `state.lives = 99` to reduce restarts while checking progression logic. Do not commit gameplay cheats or UI debug controls.
