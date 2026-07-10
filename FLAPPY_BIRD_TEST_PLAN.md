# Flappy Bird Manual Test Plan

## Overview
This test plan covers the core functionality of the Flappy Bird browser game, including gameplay mechanics, state transitions, shop features, persistence, and edge cases. Each test is designed to be executed manually by a human tester without requiring code knowledge.

**Game Setup**: Open `flappy_bird.html` directly in a web browser (Chrome, Firefox, Edge, Safari). No build step or dependencies required.

**Canvas Dimensions**: 400px × 600px  
**Key UI Elements**: Score display (center-top), coin counter (top-right), shop button (idle state, center-bottom), dash indicator (top-left during play)

---

## Test Environment & Prerequisites

### Browser Requirements
- Chrome, Firefox, Edge, or Safari (latest stable version)
- JavaScript enabled
- localStorage enabled for persistence tests
- DevTools Console access (for verification steps)

### Pre-Test Checklist
1. Open `flappy_bird.html` in a fresh browser tab
2. Verify the game canvas appears centered with a dark background and starfield
3. Confirm the title screen displays "FLAPPY BIRD" with instructions
4. Open DevTools (F12 or Right-click → Inspect → Console tab)

### Cleanup Between Tests
- Clear browser localStorage between test suites: DevTools → Application → Storage → Local Storage → Delete all entries
- Reload the page after clearing
- Or use Private/Incognito window for isolated tests

---

## Test Suite 1: Core Gameplay — Idle State

### TC-001: Game Starts in Idle State with Correct UI
**Preconditions**: Fresh page load, no prior localStorage data  
**Test Steps**:
1. Load `flappy_bird.html` in the browser
2. Observe the canvas for 2 seconds without any input
3. Look at the center of the screen
4. Check the bottom-center area for a button

**Expected Result**:
- Starfield background animates (stars twinkle)
- Yellow bird centered on the canvas
- "FLAPPY BIRD" title displayed in cyan
- Instruction text: "// PRESS SPACE OR TAP //" 
- Smaller text: "[ B ] DASH — BREAK PIPES — EVERY 5 PTS"
- "BEST: 0    COINS: 0" displayed at bottom
- Yellow "[ SHOP ]" button visible at bottom-center

**Pass Criteria**: All UI elements appear correctly positioned and styled  
**Notes**: This is the game's home screen before any gameplay begins

---

### TC-002: Idle State → Play State via Space Bar
**Preconditions**: Game in idle state (fresh load)  
**Test Steps**:
1. With focus on the canvas, press the Space bar once
2. Observe the screen for 1 second

**Expected Result**:
- Title and instructions disappear
- Bird is no longer centered; gravity takes effect
- Score counter (top-center) shows "0" in cyan
- Game enters active play mode (see TC-003 for gameplay)

**Pass Criteria**: Space bar transitions the game to play state  
**Notes**: Bird will begin falling due to gravity and may collide with pipes if the player doesn't jump

---

### TC-003: Idle State → Play State via Canvas Click
**Preconditions**: Game in idle state (fresh load)  
**Test Steps**:
1. Click anywhere on the canvas (e.g., center at 200×300)
2. Observe the screen for 1 second

**Expected Result**:
- Title and instructions disappear
- Bird begins falling; game enters play state
- Score counter visible

**Pass Criteria**: Canvas click transitions the game to play state  
**Notes**: Clicking outside the SHOP button in idle state triggers gameplay

---

## Test Suite 2: Core Gameplay — Play State

### TC-004: Jump Mechanic — Space Bar During Play
**Preconditions**: Game in play state (started with space or click)  
**Test Steps**:
1. Press Space bar to start the game
2. Observe the bird falling for ~1 second
3. Press Space bar once
4. Watch the bird's motion for 1 second
5. Press Space bar again

**Expected Result**:
- After first space press: Bird jumps upward (velocity becomes negative)
- Bird briefly stops falling and moves up
- After second space press: Bird jumps again
- Each jump is responsive and immediate

**Pass Criteria**: Each space press triggers an upward jump  
**Notes**: Bird has momentum; without jumping, it falls due to gravity. Multiple jumps should be possible in succession.

---

### TC-005: Jump Mechanic — Canvas Click During Play
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game (press Space or click canvas)
2. Let the bird fall for ~1 second
3. Click on the canvas (e.g., at 200×300)
4. Wait 1 second
5. Click the canvas again

**Expected Result**:
- Bird jumps upward on each click
- Responsiveness is immediate and consistent

**Pass Criteria**: Canvas clicks trigger jumps during play  
**Notes**: Input routing correctly identifies clicks as jump commands in play state

---

### TC-006: Scoring — Passing Through a Pipe Gap
**Preconditions**: Game in play state, no collisions yet  
**Test Steps**:
1. Start the game
2. Navigate the bird through at least 2 consecutive pipe gaps without collisions
3. Observe the score counter (top-center)

**Expected Result**:
- Score increments by 1 for each pipe passed
- Score displays in cyan at the top center
- Yellow "+1" text floats upward from the bird when a point is scored
- Yellow spark particles burst from the bird

**Pass Criteria**: Score increases for each successful pipe passage  
**Notes**: Score only increments when the bird completely passes a pipe (bird's x-position > pipe's right edge)

---

### TC-007: Coin Accumulation During Play
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Score 5 points (pass 5 pipes without dying)
3. Observe the coin counter in the top-right corner
4. Check the idle state (die or restart) to see the coin total

**Expected Result**:
- Coin counter in top-right increments with each point scored
- Coins earned = score achieved
- When the game ends, the earned coins are added to the total

**Pass Criteria**: Coins accumulate during play at a 1:1 ratio with score  
**Notes**: Coins are saved when the bird dies (onDeath saves to localStorage)

---

### TC-008: Gravity and Falling Physics
**Preconditions**: Game in play state, no pipes immediately below  
**Test Steps**:
1. Start the game
2. Do not jump; let the bird fall naturally
3. Observe the bird's descent over 3 seconds
4. Count the bird's downward acceleration visually

**Expected Result**:
- Bird falls smoothly and accelerates downward
- Bird rotates slightly downward as it falls (visual rotation based on velocity)
- Bird's descent is predictable and consistent

**Pass Criteria**: Gravity effect is noticeable and realistic  
**Notes**: The bird's rotation angle increases with downward velocity (vy * 0.05)

---

### TC-009: Dash Mechanic — Earn and Use Dash Charge
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game and score 5 points (to earn 1 dash charge: 5 ÷ 5 = 1)
2. Observe the top-left corner for the "DASH [B]" indicator with charge pips
3. Confirm 1 pip is filled (colored cyan)
4. Press the B key
5. Observe the bird's motion and visual effects

**Expected Result**:
- After 5 points: one charge pip is filled in the dash indicator
- Pressing B activates a dash; the bird moves horizontally with a cyan streak effect
- Bird moves faster horizontally while dashing
- Pipes touched during a dash are destroyed instead of causing death
- Dash lasts for ~14 frames with visual trail effect

**Pass Criteria**: Dash charges earned at correct intervals (every 5 points); dash is activatable and effective  
**Notes**: Dash requires the `B` key. Each charge can be used once and lasts for DASH_DURATION (14 frames).

---

### TC-010: Dash — Breaking Pipes
**Preconditions**: Game in play state with at least 1 dash charge earned  
**Test Steps**:
1. Score at least 5 points to earn a dash charge
2. Position the bird to collide with an upcoming pipe
3. Just before collision, press B to activate dash
4. Observe the pipe and particle effects

**Expected Result**:
- Dash is activated; the bird becomes protected from collision
- The pipe breaks (disappears from the game)
- Green/cyan particle debris explodes outward
- Flash shards appear at pipe gap locations
- Game continues (no death)

**Pass Criteria**: Dashing through a pipe destroys it and prevents death  
**Notes**: Dash can be used strategically to break through pipes, earning points without dying

---

## Test Suite 3: Core Gameplay — Death and Restart

### TC-011: Collision with Pipe — Bird Dies
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Deliberately collide with a pipe (do not jump or jump poorly to hit a pipe)
3. Observe the screen

**Expected Result**:
- Bird stops moving when hitting the pipe
- Colorful debris particles explode from the bird's position
- State changes to 'dead' (no more gameplay possible)
- Death overlay appears (see TC-012)

**Pass Criteria**: Collision detection works; bird dies on impact  
**Notes**: Collision checks if the bird's radius overlaps with the pipe boundaries (considering the gap)

---

### TC-012: Death Overlay — Game Over Screen
**Preconditions**: Bird has just collided and died  
**Test Steps**:
1. After collision, observe the overlay that appears
2. Read all text and UI elements on the screen
3. Check the high scores list
4. Look for instructions to restart

**Expected Result**:
- Red-bordered neon panel appears (centered on canvas)
- "GAME OVER" text in red/pink
- "SCORE: X   +X COINS" displayed in gold (showing points earned and coins gained)
- "HIGH SCORES" label
- Up to 5 previous high scores listed as "#01 XX", "#02 XX", etc.
- Top score (#01) is highlighted in gold with a shadow
- "TAP OR SPACE TO RESTART" instruction at the bottom
- Previous scores remain visible (persistent)

**Pass Criteria**: Death overlay displays score, coins, and high scores correctly  
**Notes**: High scores are stored in localStorage and persist across sessions

---

### TC-013: Restart from Dead State — Space Bar
**Preconditions**: Bird is dead; death overlay visible  
**Test Steps**:
1. From the dead state, press Space bar
2. Observe the screen after ~0.5 seconds

**Expected Result**:
- Death overlay disappears
- Game resets to idle state (title screen visible)
- Bird is repositioned to center
- Score counter resets to 0
- High scores remain visible in the idle overlay

**Pass Criteria**: Space bar restarts the game from dead state  
**Notes**: Coins earned in the last round were already added to totalCoins when death occurred

---

### TC-014: Restart from Dead State — Canvas Click
**Preconditions**: Bird is dead; death overlay visible  
**Test Steps**:
1. From the dead state, click anywhere on the canvas
2. Observe the screen after ~0.5 seconds

**Expected Result**:
- Death overlay disappears
- Game resets to idle state
- Score resets to 0
- Bird returns to center

**Pass Criteria**: Canvas click restarts the game  
**Notes**: Clicking any part of the canvas in dead state triggers restart (jump() function)

---

### TC-015: Floor Collision — Bird Hits Floor
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Do not jump; let the bird fall naturally until it hits the bottom floor
3. Observe the collision detection

**Expected Result**:
- When bird's y position + radius exceeds floor boundary (H - 50 = 550), bird dies
- Death overlay appears (same as TC-012)
- Particles burst from bird's position

**Pass Criteria**: Hitting the floor causes death  
**Notes**: The floor is a visual grid at the bottom of the canvas (height 550px threshold)

---

### TC-016: Ceiling Collision — Bird Hits Ceiling
**Preconditions**: Game in play state with multiple rapid jumps  
**Test Steps**:
1. Start the game
2. Press Space (or click) repeatedly to jump multiple times in rapid succession
3. Try to make the bird reach the top of the screen

**Expected Result**:
- When bird's y position - radius goes below 0 (above the top), bird dies
- Death overlay appears
- Debris particles burst from bird's position

**Pass Criteria**: Hitting the ceiling boundary causes death  
**Notes**: Ceiling is at y = 0 (top of canvas)

---

## Test Suite 4: Shop — Navigation and UI

### TC-017: Open Shop from Idle State
**Preconditions**: Game in idle state (title screen visible)  
**Test Steps**:
1. From the idle state, locate the yellow "[ SHOP ]" button at the bottom-center
2. Click directly on the button (approximately x: 200, y: 323 relative to canvas)
3. Observe the screen transition

**Expected Result**:
- Idle overlay and title disappear
- Full-screen dark overlay appears (semi-transparent black)
- Cyan-bordered neon panel appears centered on canvas
- Panel header displays "// COLOR SHOP //" in cyan
- Current coin total shows below the header: "X coins"
- 8 color items are displayed in a 2-column grid (4 rows)
- Each color item shows: bird preview, color label, status (EQUIPPED, TAP EQUIP, or price)
- Red "[ CLOSE ]" button appears at the bottom

**Pass Criteria**: Shop opens successfully and displays all UI elements  
**Notes**: Shop overlays on top of idle state; gameplay does not occur while shop is open

---

### TC-018: Close Shop with Close Button
**Preconditions**: Shop is open  
**Test Steps**:
1. Locate the red "[ CLOSE ]" button at the bottom of the shop panel
2. Click the button (approximately x: 200, y: 532 relative to canvas)
3. Observe the screen

**Expected Result**:
- Shop overlay disappears
- Idle state screen returns (title, best score, coins, SHOP button visible)
- Game remains in idle state

**Pass Criteria**: Close button successfully closes the shop  
**Notes**: Clicking outside the shop area does NOT close it; only the [ CLOSE ] button or a click outside the panel does

---

### TC-019: Browse All 8 Shop Colors
**Preconditions**: Shop is open  
**Test Steps**:
1. Observe all 8 colors displayed in the shop:
   - Row 1: Classic (yellow), Sky (blue)
   - Row 2: Rose (pink), Mint (green)
   - Row 3: Fire (red), Royal (purple)
   - Row 4: Gold (gold), Legendary (dark with pink wing)
2. Confirm each color displays:
   - A small bird preview in that color
   - Color name/label
   - Price or status

**Expected Result**:
- All 8 SHOP_COLORS are visible and properly colored
- Each item has distinct branding and visual style
- Labels are readable: Classic, Sky, Rose, Mint, Fire, Royal, Gold, Legendary
- Prices are visible for locked colors

**Pass Criteria**: All shop colors are displayed correctly  
**Notes**: Free color is "Classic" (yellow); others have prices ranging from 10 to 6767 coins

---

## Test Suite 5: Shop — Purchasing and Equipping

### TC-020: Purchase Color with Sufficient Coins
**Preconditions**: 
- Game has ≥ 10 coins (from a previous play session or manual test setup)
- Shop is open
- "Sky" color (10 coins) is not yet unlocked

**Test Steps**:
1. In the shop, locate the "Sky" color item
2. Confirm the price displays "10" with a coin icon
3. Click on the Sky color item
4. Observe the screen immediately and then after 0.5 seconds

**Expected Result**:
- Click is registered
- Item border changes from dark to cyan (owned color)
- Status text changes from "10" (price) to "TAP EQUIP" in green
- Color name remains "Sky"
- Coin total in the top-left of the shop decreases by 10
- The bird preview on the shop items now displays a Sky-colored bird

**Pass Criteria**: Coin is deducted; color is unlocked and marked as available to equip  
**Notes**: Purchased colors are automatically equipped; the next purchase will equip that color

---

### TC-021: Purchase Color with Insufficient Coins
**Preconditions**: 
- Game has < 50 coins (to ensure insufficient funds for "Fire")
- Shop is open
- "Fire" color (50 coins) is not yet unlocked

**Test Steps**:
1. In the shop, locate the "Fire" color item
2. Confirm the price displays "50" and is grayed out (player can't afford it)
3. Click on the Fire color item
4. Observe the screen after 0.5 seconds

**Expected Result**:
- Click is registered but nothing happens
- Coin total does NOT decrease
- Fire color remains locked (status shows grayed-out price)
- No purchase occurs
- Shop remains open

**Pass Criteria**: No purchase occurs when coins are insufficient  
**Notes**: Unaffordable items display grayed-out prices (#445566 color)

---

### TC-022: Equip Previously Purchased Color
**Preconditions**: 
- "Sky" color has been previously purchased and unlocked
- Shop is open
- A different color is currently active (e.g., Classic)

**Test Steps**:
1. In the shop, locate the "Sky" color item
2. Confirm the status shows "TAP EQUIP" in green
3. Click on the Sky color item
4. Observe the screen after 0.5 seconds

**Expected Result**:
- Sky color becomes the active color
- Item border changes to gold (#f9ca24)
- Status text changes to "▶ EQUIPPED" in gold with a highlight
- The bird in the game preview (if visible) changes to Sky blue
- Sky item now shows as equipped; previous active color reverts to "TAP EQUIP"

**Pass Criteria**: Previously purchased color can be equipped  
**Notes**: Only one color can be active at a time. Equipping switches the active color immediately.

---

### TC-023: Classic Color Always Free and Available
**Preconditions**: Fresh game (no purchases)  
**Test Steps**:
1. Open the shop
2. Locate the "Classic" (yellow) color at the top-left
3. Observe its status and border color

**Expected Result**:
- Classic color has a gold border (indicating active/equipped)
- Status shows "▶ EQUIPPED" in gold
- No price is displayed
- Classic is the default active color from game start

**Pass Criteria**: Classic color is free, available, and pre-equipped  
**Notes**: Classic is the baseline color; it cannot be purchased because price is 0 and it's always free

---

## Test Suite 6: Persistence — localStorage

### TC-024: Coins Persist Across Page Reload
**Preconditions**: Game has earned and saved some coins (e.g., score 10 in a play session)  
**Test Steps**:
1. Play the game and score at least 10 points
2. Let the bird die (coins are automatically saved on death via onDeath → saveData)
3. Note the coin total displayed in the idle overlay (e.g., "COINS: 10")
4. Reload the page (F5 or Ctrl+R)
5. Wait for the game to load
6. Check the coin total displayed in the idle overlay

**Expected Result**:
- After reload, the coin total is the same as before (e.g., "COINS: 10")
- Coins earned from the previous session are preserved
- localStorage contains the correct totalCoins value

**Pass Criteria**: Coin total persists across page reload  
**Notes**: Coins are saved in gameData.totalCoins via saveData() function

---

### TC-025: High Scores Persist Across Page Reload
**Preconditions**: Game has recorded high scores in a previous session  
**Test Steps**:
1. If no high scores exist, play the game, score some points (e.g., 15), and die
2. Note the high scores in the death overlay and idle overlay (e.g., "#01 15")
3. Reload the page (F5 or Ctrl+R)
4. Wait for the game to load
5. Check the high scores displayed in the idle overlay

**Expected Result**:
- High scores are displayed exactly as before the reload
- Top score is shown as "#01 XX"
- Subsequent scores follow in order
- Scores are limited to top 5 (older lower scores may be dropped)

**Pass Criteria**: High scores persist across page reload  
**Notes**: High scores are sorted descending and limited to 5 entries (highScores array)

---

### TC-026: Unlocked Colors Persist Across Page Reload
**Preconditions**: At least one additional color has been purchased (e.g., Sky for 10 coins)  
**Test Steps**:
1. Play the game, earn 10+ coins, and die
2. Open the shop and purchase the Sky color (10 coins)
3. Confirm Sky shows "TAP EQUIP" status and border is cyan
4. Close the shop
5. Reload the page (F5 or Ctrl+R)
6. Wait for the game to load
7. Open the shop and check the Sky color status

**Expected Result**:
- Sky color still shows "TAP EQUIP" status (unlocked)
- Border is cyan (owned color)
- No purchase dialog or coin deduction occurs
- The color remains in the unlockedColors array

**Pass Criteria**: Unlocked colors persist across page reload  
**Notes**: Unlocked colors are stored in gameData.unlockedColors array

---

### TC-027: Active Color Persists Across Page Reload
**Preconditions**: A non-default color has been equipped (e.g., Sky)  
**Test Steps**:
1. Open the shop and equip a color other than Classic (e.g., Sky)
2. Confirm the shop displays "▶ EQUIPPED" for Sky and bird preview is blue
3. Close the shop and observe the bird's color on the title screen (should be blue)
4. Reload the page (F5 or Ctrl+R)
5. Wait for the game to load
6. Observe the bird's color in the idle state (title screen)

**Expected Result**:
- Bird displays in the previously equipped color (e.g., blue Sky)
- Opening the shop confirms the same color shows "▶ EQUIPPED"
- activeColor in localStorage matches the currently displayed bird color

**Pass Criteria**: Active color persists across page reload  
**Notes**: Active color is stored in gameData.activeColor and read on game initialization

---

### TC-028: All Data Resets When localStorage is Cleared
**Preconditions**: Game has saved data (coins, high scores, unlocked colors)  
**Test Steps**:
1. Open DevTools (F12)
2. Go to Application tab → Storage → Local Storage
3. Select the entry for the current page/domain
4. Delete all entries or clear localStorage
5. Reload the page (F5 or Ctrl+R)
6. Wait for the game to load
7. Observe the idle state and open the shop

**Expected Result**:
- Coin total resets to 0
- High scores list is empty (displays "BEST: 0")
- All shop colors except Classic are locked (show prices)
- Classic is the equipped color (has "▶ EQUIPPED" badge)
- Game behaves as if freshly installed

**Pass Criteria**: Clearing localStorage resets all data to defaults  
**Notes**: migrateData() function fills in default values when data is missing

---

## Test Suite 7: State Transitions

### TC-029: Idle → Play Transition
**Preconditions**: Game in idle state  
**Test Steps**:
1. From idle state, press Space or click the canvas
2. Observe the state change over 0.2 seconds

**Expected Result**:
- Title and instructions disappear
- Overlay fades out
- Score counter becomes visible (top-center)
- Coin counter remains visible (top-right)
- Dash indicator appears (top-left)
- Bird falls under gravity
- Pipes begin spawning

**Pass Criteria**: Idle state cleanly transitions to play state  
**Notes**: state variable changes from 'idle' to 'play'

---

### TC-030: Play → Dead Transition
**Preconditions**: Game in play state  
**Test Steps**:
1. Deliberately collide with a pipe or hit the floor
2. Observe the transition over 0.5 seconds

**Expected Result**:
- Bird stops moving and emits particles
- Play state ends immediately
- Overlay becomes visible (death overlay with red border)
- Game Over screen displays
- Input is still accepted (restart is possible)

**Pass Criteria**: Play state cleanly transitions to dead state  
**Notes**: state variable changes from 'play' to 'dead'; particles are spawned; saveData() is called

---

### TC-031: Dead → Idle Transition
**Preconditions**: Game in dead state (death overlay visible)  
**Test Steps**:
1. From the dead state, press Space or click the canvas
2. Observe the screen for 0.5 seconds

**Expected Result**:
- Death overlay disappears
- Idle state is restored (title, best score, coins, SHOP button visible)
- Bird is repositioned to center
- Score resets to 0
- High scores remain (persisted from death)

**Pass Criteria**: Dead state cleanly transitions back to idle state  
**Notes**: init() function is called to reset game state; state changes to 'idle'

---

### TC-032: Idle → Shop Transition
**Preconditions**: Game in idle state  
**Test Steps**:
1. From idle state, click the SHOP button at the bottom-center
2. Observe the screen transition over 0.3 seconds

**Expected Result**:
- Title and instructions disappear
- Shop overlay appears with full-screen semi-transparent background
- Shop panel with cyan border is centered
- All shop items are visible and clickable
- Game state remains 'idle' (gameplay is not possible)
- shopState variable is set to 'shop'

**Pass Criteria**: Idle state transitions to shop overlay  
**Notes**: shopState is a separate variable from state; both idle state and shop state can coexist

---

### TC-033: Shop → Idle Transition
**Preconditions**: Shop is open  
**Test Steps**:
1. From the shop, click the red [ CLOSE ] button at the bottom
2. Observe the screen transition over 0.3 seconds

**Expected Result**:
- Shop overlay disappears
- Idle state screen is restored (title, best score, coins, SHOP button visible)
- Bird remains centered
- Any purchases made in the shop are reflected (coin total updated, colors unlocked)

**Pass Criteria**: Shop overlay closes and idle state resumes  
**Notes**: shopState is set to null; game state remains 'idle'

---

## Test Suite 8: Input Handling

### TC-034: Input Routing — Space Bar in Different States
**Preconditions**: Game in various states  
**Test Steps**:
1. **Idle state**: Press Space → observe transition to play state
2. **Play state**: Press Space → observe bird jumps
3. **Dead state**: Press Space → observe restart to idle state
4. **Shop open**: Press Space → observe no effect (input is ignored)

**Expected Result**:
- Idle: Starts the game
- Play: Bird jumps
- Dead: Game restarts
- Shop: No effect (Space is ignored while shop is open)

**Pass Criteria**: Space bar input is correctly routed to the appropriate handler  
**Notes**: Space bar is ignored in shop state (handleCanvasClick checks if shopState === 'shop' first)

---

### TC-035: Input Routing — Canvas Click in Different States
**Preconditions**: Game in various states  
**Test Steps**:
1. **Idle state (outside SHOP button)**: Click canvas → observe transition to play
2. **Idle state (on SHOP button)**: Click SHOP button → observe transition to shop
3. **Play state**: Click canvas → observe bird jumps
4. **Dead state**: Click canvas → observe restart to idle state
5. **Shop open**: Click on a color item → observe purchase/equip logic, NOT a jump

**Expected Result**:
- Idle (non-SHOP area): Starts the game
- Idle (SHOP button): Opens shop
- Play: Bird jumps
- Dead: Game restarts
- Shop: Executes shop click logic (purchase/equip/close)

**Pass Criteria**: Canvas click input is correctly routed  
**Notes**: handleCanvasClick uses coordinate checks to distinguish between shop clicks and jump commands

---

### TC-036: Touch Input — Mobile/Touch Devices
**Preconditions**: Game open on a touch device or mobile browser  
**Test Steps**:
1. From idle state, tap the canvas
2. Observe the transition to play state
3. Tap the canvas again during play
4. Observe the bird jumping

**Expected Result**:
- Touch input is registered as click events
- Tap transitions from idle to play
- Taps during play trigger jumps
- Touch input behaves identically to mouse clicks

**Pass Criteria**: Touch input is functional on mobile devices  
**Notes**: Game uses canvas.addEventListener('touchstart') to handle touch input

---

### TC-037: Rapid Input — Multiple Clicks/Jumps in Succession
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Rapidly click or press Space 5 times in quick succession (~0.2 seconds apart)
3. Observe the bird's motion

**Expected Result**:
- Each input is registered
- Bird jumps for each input (or attempted jump if velocity/state doesn't allow another)
- No input is lost or dropped
- Game remains responsive

**Pass Criteria**: Rapid input is handled correctly without lag  
**Notes**: Game loop runs at ~60 FPS via requestAnimationFrame; rapid input should be smooth

---

### TC-038: Input During State Transitions
**Preconditions**: Transitioning between states  
**Test Steps**:
1. From idle state, start the game (Space or click)
2. Within 100ms, press Space again
3. Observe whether the second input is registered as a jump

**Expected Result**:
- Rapid input during transitions is handled gracefully
- Game does not crash or become unresponsive
- State transitions complete before subsequent input is processed

**Pass Criteria**: Concurrent input and state transitions are handled safely  
**Notes**: Game uses state machine to prevent invalid transitions (e.g., can't jump if already dead)

---

## Test Suite 9: Visual & Rendering

### TC-039: Bird Color Changes Reflect Active Color
**Preconditions**: Multiple colors have been purchased (e.g., Sky, Rose)  
**Test Steps**:
1. Open the shop and equip Sky color
2. Close the shop and observe the bird in idle state
3. Reopen the shop and switch to Rose color
4. Observe the bird in idle state
5. Close the shop

**Expected Result**:
- Bird color updates immediately when active color changes
- Idle state bird color matches the equipped color
- Bird color remains consistent throughout the session
- Both in idle and play states, the bird displays the correct color

**Pass Criteria**: Bird color renders correctly based on activeColor  
**Notes**: getActiveColorItem() is called in drawBird() to fetch the current color; color includes body, wing, and glow properties

---

### TC-040: Particle Effects — Score Spark Burst
**Preconditions**: Game in play state, bird passing through a pipe  
**Test Steps**:
1. Start the game and navigate through a pipe gap without collision
2. Observe the bird's position when the score increments
3. Watch for particle effects

**Expected Result**:
- Yellow/colored spark particles burst outward from the bird in a circular pattern
- "+1" text floats upward from the bird in gold
- Particles fade out over ~1 second
- Particles move in straight lines outward from the bird

**Pass Criteria**: Particle effects are rendered and animated correctly  
**Notes**: onScore() spawns 12 spark particles in a circle + 1 text particle

---

### TC-041: Particle Effects — Death Explosion
**Preconditions**: Bird has died  
**Test Steps**:
1. Start the game and deliberately collide with a pipe or floor
2. Observe the particle effects immediately after collision

**Expected Result**:
- Colorful debris particles explode from the bird's position
- Particles move outward in all directions (radial burst)
- Particles fade out over ~1 second
- Large burst (24 particles) indicates a dramatic death

**Pass Criteria**: Death particle effects are rendered correctly  
**Notes**: onDeath() spawns 24 debris particles; particles use the bird's active color

---

### TC-042: Dash Visual Effect — Trail and Streak
**Preconditions**: Game in play state with at least 1 dash charge  
**Test Steps**:
1. Score at least 5 points to earn a dash charge
2. Press B to activate dash
3. Observe the visual effects during the dash

**Expected Result**:
- Ghost copies of the bird appear behind the bird in cyan/turquoise
- A horizontal cyan streak appears to the left of the bird
- Both effects fade out as the dash progresses
- Duration is ~14 frames (~230ms at 60 FPS)
- Effect is visually distinct and dramatic

**Pass Criteria**: Dash visual effects are rendered correctly  
**Notes**: isDashing flag triggers trail rendering; dash trail uses cyan (#00f7ff) color

---

### TC-043: HUD Accuracy — Score Counter Display
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game and note the score (should be 0)
2. Pass through 3 pipes
3. Observe the score counter (top-center)
4. Die and restart

**Expected Result**:
- Score counter displays the exact number of pipes passed
- Counter is rendered in large cyan text (40px font)
- Counter is centered horizontally on the canvas
- Counter is positioned near the top (y: 54)
- Counter updates immediately when a pipe is passed

**Pass Criteria**: Score counter is accurate and visible  
**Notes**: Score is drawn via drawHUD(); text is centered at (W/2, 54)

---

### TC-044: HUD Accuracy — Coin Counter Display
**Preconditions**: Game has accumulated coins  
**Test Steps**:
1. Play the game and score points
2. Observe the coin icon and counter in the top-right
3. Die and check the coin total
4. Reload the page and verify the coin counter matches

**Expected Result**:
- Coin icon (gold circle) is visible in the top-right corner
- Coin count is displayed next to the icon in gold text
- Counter updates immediately after earning coins
- Counter persists across page reloads

**Pass Criteria**: Coin counter is accurate and persistent  
**Notes**: Coins are drawn at (W - 40, 28); total coins are read from gameData.totalCoins

---

### TC-045: HUD Accuracy — Dash Indicator
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game (no dash charges yet)
2. Observe the top-left corner for "DASH [B]" indicator
3. Score 5 points to earn a charge
4. Observe the dash indicator again
5. Press B to use the charge

**Expected Result**:
- Before earning charges: 3 empty pips are shown
- After earning 1 charge: 1 filled cyan pip + 2 empty pips
- After earning 2 charges: 2 filled cyan pips + 1 empty pip
- When dash is active (B pressed): 1 white pip (active) + remaining filled pips
- Text "DASH [B]" is visible and accurate

**Pass Criteria**: Dash indicator displays charges and state correctly  
**Notes**: Dash indicator is drawn at top-left (12px from left, 24px from top); pips are rounded rectangles

---

### TC-046: Background Animation — Starfield
**Preconditions**: Game in any state  
**Test Steps**:
1. Load the game and observe the background for 3 seconds
2. In idle state, watch the stars
3. Start the game and observe the stars during play

**Expected Result**:
- Stars twinkle (fade in and out smoothly)
- Stars are scattered across the background in the upper portion
- During play, stars move left (creating a parallax effect with the game world)
- Stars wrap around when they exit the left edge
- Starfield creates a dynamic, animated atmosphere

**Pass Criteria**: Starfield animation is smooth and visible  
**Notes**: Stars are drawn via drawBg(); twinkling is animated via a twinkle phase value

---

### TC-047: Floor Grid Animation
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Observe the bottom of the canvas (the floor area)
3. Watch the grid pattern for 2 seconds

**Expected Result**:
- Grid lines move horizontally (left) as the game progresses
- Grid has a perspective effect (lines converge)
- Grid animates smoothly with the game's movement
- Grid is semi-transparent cyan (#00f7ff)

**Pass Criteria**: Floor grid animation is smooth and creates perspective  
**Notes**: Grid animation is controlled by gridOffset variable; perspective is created via canvas transformations

---

## Test Suite 10: Edge Cases & Stress Tests

### TC-048: Very High Score (Stress Test)
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Using a tool or manual intensive play, accumulate a very high score (50+ points)
3. Observe the score counter and HUD
4. Die and check the high scores list
5. Reload the page and verify the high score persists

**Expected Result**:
- Score counter can display 2-3 digit numbers without overflow or visual issues
- High scores list sorts correctly with the new high score at the top
- Only the top 5 scores are retained (lower scores are dropped)
- High score persists after reload

**Pass Criteria**: Game handles large scores correctly  
**Notes**: highScores array is limited to 5 entries; sorting is done in descending order

---

### TC-049: Very High Coin Count (Stress Test)
**Preconditions**: Game has accumulated many coins (e.g., 1000+)  
**Test Steps**:
1. Using multiple play sessions or manual localStorage manipulation, accumulate 1000+ coins
2. Open the shop and verify the coin counter displays correctly
3. Purchase an expensive color (e.g., Legendary for 6767 coins, if sufficient funds)
4. Observe the coin counter update

**Expected Result**:
- Coin counter displays 4+ digit numbers without overflow
- Shop displays the coin total correctly
- Purchases deduct the correct amount
- No integer overflow or rendering issues occur

**Pass Criteria**: Game handles large coin counts correctly  
**Notes**: Coins are stored as a simple integer (totalCoins); no limits are enforced

---

### TC-050: Rapid Pipe Spawning
**Preconditions**: Game in play state for 30+ seconds  
**Test Steps**:
1. Start the game and try to survive for 30+ seconds
2. Observe the number of pipes on screen (should accumulate over time)
3. Watch for performance degradation (frame rate drops, stuttering)

**Expected Result**:
- Multiple pipes are on screen at the same time (varies based on game speed)
- Old pipes are removed when they exit the left edge
- Game remains responsive and smooth
- No visual glitches or performance issues

**Pass Criteria**: Game handles multiple pipes without performance degradation  
**Notes**: Pipes are spawned every 90 frames and removed when off-screen; garbage collection should manage memory

---

### TC-051: Dash Usage Frequency
**Preconditions**: Game in play state with multiple dash charges available  
**Test Steps**:
1. Score 20+ points to accumulate 4+ dash charges
2. Use each dash in succession (press B, wait for cooldown, press B again)
3. Observe the dash indicator and bird behavior

**Expected Result**:
- Each dash is executed immediately when B is pressed (if a charge is available)
- Dash indicator updates to show remaining charges
- No charging or cooldown period is required between dashes
- Bird remains responsive and can jump/dash continuously

**Pass Criteria**: Dash mechanic is responsive and supports frequent usage  
**Notes**: Each dash consumes exactly one charge; no cooldown is enforced

---

### TC-052: Alternating Jump and Dash (Input Complexity)
**Preconditions**: Game in play state with dash charges available  
**Test Steps**:
1. Score 5+ points to earn a dash charge
2. Alternate between jumping (Space) and dashing (B) in quick succession
3. Example pattern: Space, B, Space, B, Space
4. Observe the bird's behavior

**Expected Result**:
- Both jump and dash inputs are recognized
- Bird behavior changes based on the input (jumps vs. dashes)
- No input lag or missed commands
- Game remains stable and responsive

**Pass Criteria**: Complex input patterns are handled correctly  
**Notes**: Both Space and B are handled in the same keydown event handler

---

### TC-053: Rapid State Transitions
**Preconditions**: Game ready to play  
**Test Steps**:
1. Start the game (Space or click)
2. Immediately click the canvas (within 50ms) to try to open shop
3. Observe the state

**Expected Result**:
- Game enters play state (not shop state)
- Jump command is executed
- No confusion between idle-specific commands (shop button) and play-state commands (jump)

**Pass Criteria**: Rapid state changes are handled correctly without logic errors  
**Notes**: handleCanvasClick checks the current state before executing logic

---

### TC-054: Collision Detection — Bird at Pipe Edge
**Preconditions**: Game in play state  
**Test Steps**:
1. Start the game
2. Time a jump to position the bird's edge just barely inside the top or bottom pipe boundary
3. Observe whether a collision is detected

**Expected Result**:
- Collision detection is precise; bird dies if radius overlaps with pipe boundaries
- Bird can pass through tight gaps if positioned correctly
- Collision is detected at the exact boundary (no off-by-one errors)

**Pass Criteria**: Collision detection is accurate  
**Notes**: collides() function uses bird radius (r - 4 = 14) for collision checks; boundaries are topH and topH + GAP

---

### TC-055: Score Boundary — Single Pipe Pass
**Preconditions**: Game in play state at very low score  
**Test Steps**:
1. Start the game and pass through exactly one pipe
2. Die without passing any additional pipes
3. Observe the score (should be 1)
4. Check the death overlay for "SCORE: 1   +1 COINS"

**Expected Result**:
- Score increments from 0 to 1
- Coin total increases by 1
- High scores list adds this score
- No off-by-one errors or missed score registration

**Pass Criteria**: Score boundary at 0→1 is handled correctly  
**Notes**: Score is an integer; onScore() increments score and totalCoins by 1

---

## Test Suite 11: Cross-Browser Compatibility

### TC-056: Game Runs on Chrome
**Preconditions**: Chrome browser (latest stable)  
**Test Steps**:
1. Open `flappy_bird.html` in Chrome
2. Load the game and run through TC-001 (idle state checks)
3. Play the game for at least 10 seconds
4. Open the shop

**Expected Result**:
- Game loads without errors
- All UI renders correctly
- Canvas animations are smooth
- No JavaScript errors in console
- No visual glitches (colors, fonts, positions)

**Pass Criteria**: Game is fully functional on Chrome  
**Notes**: Chrome is the primary testing browser for canvas-based games

---

### TC-057: Game Runs on Firefox
**Preconditions**: Firefox browser (latest stable)  
**Test Steps**:
1. Open `flappy_bird.html` in Firefox
2. Perform the same tests as TC-056

**Expected Result**:
- Game loads and runs identically to Chrome
- No console errors
- Visual rendering matches Chrome

**Pass Criteria**: Game is fully functional on Firefox  
**Notes**: Firefox has excellent canvas support; any differences are typically minor

---

### TC-058: Game Runs on Safari
**Preconditions**: Safari browser (macOS or iOS)  
**Test Steps**:
1. Open `flappy_bird.html` in Safari
2. Perform the same tests as TC-056
3. If on iOS, test touch input as well

**Expected Result**:
- Game loads and runs identically to Chrome
- Touch input works on iOS
- No performance issues

**Pass Criteria**: Game is fully functional on Safari  
**Notes**: Some canvas features (like roundRect) may require polyfills on older Safari versions

---

### TC-059: Game Runs on Edge
**Preconditions**: Microsoft Edge browser (latest)  
**Test Steps**:
1. Open `flappy_bird.html` in Edge
2. Perform the same tests as TC-056

**Expected Result**:
- Game loads and runs correctly
- No console errors
- Visual rendering is accurate

**Pass Criteria**: Game is fully functional on Edge  
**Notes**: Edge is Chromium-based and should behave identically to Chrome

---

## Summary of Test Coverage

### Coverage by Feature
| Feature | Test Cases | Coverage |
|---------|-----------|----------|
| Core Gameplay | TC-001 to TC-016 | 16 tests |
| Shop | TC-017 to TC-023 | 7 tests |
| Persistence | TC-024 to TC-028 | 5 tests |
| State Transitions | TC-029 to TC-033 | 5 tests |
| Input Handling | TC-034 to TC-038 | 5 tests |
| Visual & Rendering | TC-039 to TC-047 | 9 tests |
| Edge Cases | TC-048 to TC-055 | 8 tests |
| Browser Compatibility | TC-056 to TC-059 | 4 tests |
| **Total** | **59 test cases** | **Complete** |

### Coverage by State Machine
- **Idle State**: TC-001, TC-002, TC-003, TC-017, TC-018, TC-029, TC-032, TC-034, TC-035
- **Play State**: TC-004 to TC-016, TC-029, TC-030, TC-034, TC-035, TC-037
- **Dead State**: TC-011 to TC-016, TC-030, TC-031, TC-034, TC-035
- **Shop State**: TC-017 to TC-023, TC-032, TC-033, TC-034, TC-035

### High-Risk Areas (Prioritized Testing)
1. **Persistence** (TC-024 to TC-028) — Ensures data survives page reloads
2. **Collision Detection** (TC-011, TC-015, TC-016, TC-054) — Core gameplay mechanic
3. **Input Routing** (TC-034 to TC-038) — Ensures correct command execution
4. **Shop Purchasing** (TC-020, TC-021) — Handles coin transactions
5. **State Transitions** (TC-029 to TC-033) — Prevents invalid game states

---

## Test Execution Guidelines

### Test Order
Recommended execution order for efficient testing:
1. **Quick smoke test** (5 minutes): TC-001, TC-002, TC-003, TC-004, TC-006
2. **Core gameplay** (20 minutes): TC-004 to TC-016
3. **Shop functionality** (15 minutes): TC-017 to TC-023
4. **Persistence** (15 minutes): TC-024 to TC-028
5. **State transitions** (10 minutes): TC-029 to TC-033
6. **Input handling** (10 minutes): TC-034 to TC-038
7. **Visual & rendering** (10 minutes): TC-039 to TC-047
8. **Edge cases** (20 minutes): TC-048 to TC-055
9. **Browser compatibility** (30 minutes): TC-056 to TC-059

**Total estimated time**: 2.5 hours for full test coverage

### Test Environment Setup
- Clear browser cache and localStorage before starting
- Use a standard resolution (1920×1080 or larger)
- Disable browser extensions that might interfere (ad blockers, etc.)
- Test on both desktop and mobile/tablet (if applicable)

### Reporting Test Results
For each test case, record:
- **Pass/Fail** status
- **Actual Result** (what was observed)
- **Expected Result** (from test case)
- **Bug Report** (if failed, include steps to reproduce)
- **Date Tested** and **Tester Name**

### Bug Reporting Format
```
Test Case: TC-XXX: [Title]
Status: FAIL
Expected: [What should happen]
Actual: [What actually happened]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Severity: [Critical/High/Medium/Low]
Environment: [Browser, OS, Screen size]
```

---

## Final Notes

This test plan provides comprehensive coverage of the Flappy Bird game's core features, state machine, shop, and persistence mechanisms. Each test case is self-contained and can be executed independently. 

**Key Success Criteria**:
- All 59 test cases pass
- No console errors in DevTools
- Game remains responsive across all features
- Data persists correctly across page reloads
- State transitions are clean and predictable
- Visual rendering is consistent across browsers

**Known Limitations**:
- This plan assumes the game files are loaded locally via `file://` protocol
- Some features (like CORS-dependent data) may behave differently on actual web servers
- Performance testing is limited to visual observation; a profiling tool would be needed for detailed metrics

---

**Version**: 1.0  
**Date**: June 28, 2026  
**Last Updated**: June 28, 2026
