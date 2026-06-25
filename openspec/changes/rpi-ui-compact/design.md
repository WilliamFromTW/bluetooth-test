# Design: RPi UI Compact Layout

## Architecture / Layout Alterations

### Left Panel (Device List & Filters)
- **Scan Button Relocation**: Move `<button id="scanBtn">` from its current dedicated `div.action-buttons` into the `<h2>` header area. It will be styled as a small secondary button (`btn secondary small`) alongside the text "過濾與掃描".
- **Remove Connect Button Reference**: The dedicated `<button id="connectBtn">` is no longer needed in the UI since connections are single-click on the list items. Keep it hidden in HTML but accessible to JS, or migrate JS logic away from it. To be safe with minimal JS change, we can leave it hidden but move it out of the layout flow.
- **Filter Inputs**: Add inline CSS or adjust global CSS to make `.input-group input` smaller in padding or font-size if needed, though relocating the scan button usually saves ~60px already.

### Right Panel (Command & Results)
- **Send Command Card**: 
  - Change `<h2>` font-size slightly if needed.
  - Reduce the input field padding and button padding to make it flatter.
- **Test Results Split View**:
  - The `div` containing `#responseDisplay` and `#resultDisplay` is currently `display: flex`.
  - We will enforce `flex-basis: 50%; max-width: 50%; box-sizing: border-box;` on BOTH `#responseDisplay` and `#resultDisplay`. This guarantees a rigid 1:1 split, preventing `result-display`'s `6rem` text from expanding beyond 50% of the container width.

## Risk Analysis
- **JS Event Bindings**: The `#scanBtn` ID must remain intact since `app.js` relies on it. Moving it within the DOM won't break event listeners attached by ID.
- **Responsiveness**: The rigid 50% split in the result card might be tight for very long response texts, but `word-break: break-all` and `overflow-y: auto` are already in place, so it will handle it gracefully via scrolling.
