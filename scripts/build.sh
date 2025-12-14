#!/bin/bash
set -e # If any command fails, script exits immediately

echo "==========================================================="
echo "BUILDING TO WASM"
echo "==========================================================="

THIS_SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$THIS_SCRIPTS_DIR/.."

wasmFilename="wasm_astar"
pkgDir="pkg"

# Check for required tools
if ! command -v cargo &> /dev/null; then
    echo "Error: cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

if ! command -v wasm-bindgen &> /dev/null; then
    echo "Error: wasm-bindgen not found. Install with: cargo install wasm-bindgen-cli"
    exit 1
fi

# Clean previous build
if [ -d "$pkgDir" ]; then
    rm -rf "$pkgDir"
fi
if [ -d "target/wasm32-unknown-unknown" ]; then
    rm -rf "target/wasm32-unknown-unknown"
fi

# Add wasm32 target if not already added
rustup target add wasm32-unknown-unknown 2>/dev/null || true

# Compile to wasm with stable toolchain
echo "Compiling Rust to WASM..."
cargo build --target wasm32-unknown-unknown --release

# Run wasm-bindgen
echo "Running wasm-bindgen..."
wasm-bindgen --target web \
    --out-dir "$pkgDir" \
    "target/wasm32-unknown-unknown/release/$wasmFilename.wasm"

# Optimize wasm output with wasm-opt (replaces deprecated wasm-gc)
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing WASM with wasm-opt..."
    wasm-opt -Os "$pkgDir/${wasmFilename}_bg.wasm" -o "$pkgDir/${wasmFilename}_bg.wasm"
    echo "WASM optimized with wasm-opt"
else
    echo "Warning: wasm-opt not found. WASM will not be optimized."
    echo "  Install with: npm install -g wasm-opt"
    echo "  Or on Alpine/Debian: apk add binaryen / apt-get install binaryen"
fi

echo "Build complete! Output in $pkgDir/"
