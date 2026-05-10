# Firewall Defender: Cyber Breach

## 1. Project Overview
**Firewall Defender: Cyber Breach** is a custom browser game created for a Digital Toolbox final assignment. The project is intentionally lightweight, safe to open in a normal browser, and ready for static GitHub Pages deployment.

## 2. Game Story
You play as a cyber defender protecting a school network during an active attack. Malware spreads through the system, phishing traps block safe routes, and a final breach threatens the network core. Your mission is to secure each zone before the attack reaches critical systems.

## 3. How to Play
- Collect all required security items in each level.
- Avoid malware and trap hazards that damage system integrity.
- Reach the server exit only after collecting all required items.
- Complete all **5 levels** to secure the network and trigger the final victory screen.

## 4. Controls
- **Movement:** `WASD` or `Arrow Keys`
- **UI Buttons:** **Start Defense**, **Next Level**, **Restart Defense**, **Play Again**, **Sound On/Off**

## 5. Level Breakdown
1. **Network Login**
2. **Malware Maze**
3. **Phishing Storm**
4. **Patch Rush**
5. **Core Lockdown**

## 6. Major Gameplay Features
- Exactly 5 playable levels
- Distinct mission text and difficulty progression per level
- Exit remains locked until all required items are collected
- Life loss on malware/trap collision with clear damage feedback
- Functional game over and restart behavior
- Final victory screen only after Level 5 completion

## 7. Visual Features
- Dark cyberpunk background with animated grid/network effects
- Glassmorphism panels for title, HUD, and overlays
- Neon-accented player, enemies, collectibles, traps, and exit visuals
- Dynamic collectible pulse and particle burst effects
- Reactive hit flash when taking damage

## 8. Security and Privacy Hardening
This project is a **low-risk static site design** for class use, not a claim of perfect security.

- Static **HTML, CSS, JavaScript** only (no backend)
- No forms, uploads, login/auth, analytics, or tracking
- No external JavaScript libraries
- No external API or network requests required for gameplay
- Content Security Policy defined via `<meta http-equiv="Content-Security-Policy">`
- Referrer policy set to `no-referrer`
- No secrets or environment files required

## 9. Local Run Instructions
1. Clone or download this repository.
2. Open `index.html` in a modern browser.

## 10. Published Game Link
https://cybercryptonic.github.io/firewall-defender/

## 11. Recommended Manual QA Checklist
1. Open `index.html` and verify the mission briefing appears with no console errors.
2. Start game and confirm HUD values initialize correctly (Level 1, 3 lives, score 0).
3. In each level, verify exit is locked until all required collectibles are gathered.
4. Intentionally collide with malware/traps and confirm lives decrease and player resets.
5. Lose all lives and verify **System Compromised** overlay appears and restart works.
6. Complete Levels 1–4 and verify progression overlay appears and loads the next level.
7. Complete Level 5 and verify final victory overlay appears with **Play Again**.
8. Use **Play Again** and verify run resets to Level 1 with fresh lives and score.
9. Toggle sound button and verify label updates between `Sound: On` and `Sound: Off`.
