# Firewall Defender: Cyber Breach

A polished, cybersecurity-themed browser arcade game built with **plain HTML, CSS, and JavaScript** for a Digital Toolbox final project.

## Project Overview
In this game, you play as a cyber defender protecting a school network during an active attack. You must collect required security assets and then reach a secure server while avoiding malware and phishing threats.

## How to Play
1. Open `index.html` in Chrome or Edge.
2. Click **Start Defense**.
3. Collect all required items in the current level.
4. Reach the glowing server to complete the level.
5. Finish all 5 levels to win.

## Controls
- **Move:** `W`, `A`, `S`, `D` or Arrow Keys

## Rules
- You start with **3 lives**.
- Hitting malware or phishing traps removes 1 life.
- After a hit, your player resets to start position.
- Score increases when collecting security items.
- The server exit activates only after all required items are collected.

## Level Breakdown
1. **Network Login**  
   Intro level with few enemies, collect 2 security keys.
2. **Malware Maze**  
   More walls and enemies, collect 3 patches.
3. **Phishing Storm**  
   Faster enemies plus red phishing traps, collect safe blue packets.
4. **Patch Rush**  
   Higher pressure with multiple moving malware threats.
5. **Final Breach**  
   Hardest level with dense hazards and core-server objective.

## Features
- Dark cyber visual theme with neon accents.
- Clean HUD showing level, lives, score, and item progress.
- Level names and mission descriptions.
- Collect effects and life-loss warning flash.
- Transition messages between levels.
- Full game-over and win flows with replay buttons.

## Run Locally
No installs or dependencies needed:
- Double-click `index.html`, or
- Open `index.html` in a web browser.

## Publish on GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your default branch), folder `/ (root)`
4. Save.
5. Share the generated GitHub Pages URL.

## What I Learned
- How to structure a complete multi-level browser game with plain JavaScript.
- Designing balanced level difficulty and collision-based mechanics.
- Building a polished UI/HUD experience without frameworks.
- Preparing a static game project for easy GitHub Pages deployment.
