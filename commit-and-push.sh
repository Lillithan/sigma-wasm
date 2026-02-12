#!/bin/bash
cd /workspaces/sigma-wasm
git add pages/hello-wasm.html src/routes/hello-wasm.ts src/styles.css wasm-hello/src/lib.rs
git commit -m "feat: Complete Decimal slider - HTML, CSS, TypeScript, and Rust

- Add decimal-slider with range -100 to 100 representing -10.0 to 10.0
- Implement responsive slider styling with custom thumb and track designs
- Add get_decimal() and set_decimal() WASM functions with value clamping
- Add decimal field (f64) to HelloState struct with initialization
- Implement complete TypeScript event handlers:
  * Slider input handler - converts slider value to decimal
  * Number input sync - updates slider when input changes
  * Button handler - validates and sets decimal value
  * Enter key support - allows quick input without button click
- Add full WASM module validation with decimal function checks
- Display updates in real-time with toFixed(1) formatting
- All UI elements properly type-narrowed for safety"
git push origin master
