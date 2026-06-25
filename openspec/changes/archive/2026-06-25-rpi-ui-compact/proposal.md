# Proposal: RPi UI Compact (1024x600 Optimization)

## Problem Statement
The current UI layout is not optimized for 1024x600 resolution displays commonly found on Raspberry Pi industrial screens. The left panel's Bluetooth device list has limited vertical space due to large filter inputs and a huge scan button, resulting in only 3-4 devices being visible without scrolling. The right panel's "Send Command" area is unnecessarily large, and the test results block sometimes suffers from flexbox squishing where the giant OK/NG text crushes the response data box.

## Proposed Solution
1. **Compact Left Panel Control**: Move the "Scan" button to the header section of the left panel as a smaller icon/button to free up a whole row of height. Reduce vertical padding of the filter inputs.
2. **Compact Command Section**: Decrease font sizes and padding in the Send Command input and button on the right panel to yield more vertical height to the test results area.
3. **Rigid Test Result Layout**: Apply strict `flex: 1 1 50%` to the left and right halves of the test result card so that the giant OK/NG text cannot push the response display out of its boundary.

## Scope
- Modify `index.html` structure (Scan button relocation).
- Modify `style.css` (Font sizes, padding, flex constraints).
- No core Bluetooth or backend logic changes.
