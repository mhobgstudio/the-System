---
name: streak-toggle-enhancement-plan
description: Implementation plan for enhancing the streak view toggle container
---

# Context
The user wants to improve the `view-toggle-container` functionality to modify the `streak-container` view modes (Dashboard, Detailed, Compact). Specifically, in `Detailed` mode, it should display a list of all historical/previous streak titles and related streak details, not just the current one. Currently, these buttons only manipulate container classes without granular interactivity with streak components.

# Recommended Approach
1. **Event-Driven Architecture**: Introduce a custom event system using `window.dispatchEvent` inside the `view-toggle-container` logic in `index.html` (or `app.js`) to signal view changes.
2. **Modular UI Injection**: Update `data/streak-enhanced.js` to listen for these `viewChange` events.
3. **Dynamic View Rendering**: Handle view-specific UI updates within `data/streak-enhanced.js`:
    - When switched to `Detailed` view, dynamically render a list of previous milestones (based on `EXPANDED_STREAK_TITLES`) into the `streak-container` or a newly created sub-container.
    - Ensure CSS classes (e.g., `.container.detailed-view`) continue to manage broad layout shifts, while the JS handles the content-specific enhancement.
4. **Historical Streak Titles**: Implement a mechanism to filter/display previous milestones. Logic could look like:
    ```javascript
    function renderDetailedStreakStats() {
       // Filter EXPANDED_STREAK_TITLES for milestones achieved up to current streak
    }
    ```

# Critical Files
- `/media/heavenly-dev/Ventoy/TerminalProjects/My System/index.html` (view toggle listener)
- `/media/heavenly-dev/Ventoy/TerminalProjects/My System/data/streak-enhanced.js` (UI logic)
- `/media/heavenly-dev/Ventoy/TerminalProjects/My System/styles.css` (view specific styles)

# Verification
- Switch views via the UI and verify that the `Detailed` view updates to display historical milestone titles and more granular data.
- Ensure the streak container persists correctly when switching between themes and views.
- Test that the original layout transitions (CSS-based) are not hindered by the new JS functionality.
