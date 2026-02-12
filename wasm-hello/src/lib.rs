use wasm_bindgen::prelude::*;
use std::sync::{LazyLock, Mutex};

/// Simple state structure for the hello-wasm template
/// This demonstrates the state management pattern used throughout the project.
/// 
/// **Learning Point**: In Rust WASM, we can't have global mutable state directly.
/// Instead, we use `LazyLock<Mutex<State>>` which:
/// - `LazyLock`: Initializes the value on first access (lazy initialization)
/// - `Mutex`: Provides thread-safe access to mutable data
/// 
/// Even though WASM runs single-threaded, `Mutex` satisfies Rust's borrow checker
/// when we need mutable access to shared state across function calls.
struct HelloState {
    /// Counter value that can be incremented
    counter: i32,
    /// Message string that can be set and retrieved
    message: String,
    /// Gum string that can be set and retrieved
    gum: String,
    /// Favorite ice shape that can be set and retrieved
    ice_shape: String,
    /// Decimal value ranging from -10.0 to 10.0
    decimal: f64,
}

impl HelloState {
    /// Create a new HelloState with default values
    fn new() -> Self {
        HelloState {
            counter: 0,
            message: String::from("Rust WASM is so Sigma!"),
            gum: String::from("Hubba Bubba"),
            ice_shape: String::from("Cube"),
            decimal: 0.0,
        }
    }
    
    /// Get the current counter value
    fn get_counter(&self) -> i32 {
        self.counter
    }
    
    /// Increment the counter by 1
    fn increment_counter(&mut self) {
        self.counter += 1;
    }
    
    /// Get the current message
    fn get_message(&self) -> String {
        self.message.clone()
    }
    
    /// Set a new message
    fn set_message(&mut self, message: String) {
        self.message = message;
    }

    /// Get the current gum
    fn get_fave_gum(&self) -> String {
        self.gum.clone()
    }
    
    /// Set a new gum
    fn set_fave_gum(&mut self, gum: String) {
        self.gum = gum;
    }

    /// Get the current favorite ice shape
    fn get_fave_ice_shape(&self) -> String {
        self.ice_shape.clone()
    }

    /// Set a new favorite ice shape
    fn set_fave_ice_shape(&mut self, shape: String) {
        self.ice_shape = shape;
    }

    /// Get the current decimal value
    fn get_decimal(&self) -> f64 {
        self.decimal
    }

    /// Set a new decimal value (clamped to -10.0 to 10.0)
    fn set_decimal(&mut self, value: f64) {
        self.decimal = value.max(-10.0).min(10.0);
    }
}

/// Global state using the LazyLock<Mutex<State>> pattern
/// 
/// **Learning Point**: This is the same pattern used in wasm-astar and other modules.
/// The state is initialized on first access and can be safely mutated across
/// multiple WASM function calls.
/// 
/// **To extend this template**: Add new fields to `HelloState` and implement
/// getter/setter methods. Then expose them via `#[wasm_bindgen]` functions below.
static HELLO_STATE: LazyLock<Mutex<HelloState>> = LazyLock::new(|| Mutex::new(HelloState::new()));

/// Initialize the WASM module
/// This is called once when the module is first loaded.
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Initialize the hello-wasm module
/// 
/// **Learning Point**: This function is called from TypeScript after the WASM module loads.
/// You can add initialization logic here, such as setting up default values or
/// preparing resources.
/// 
/// @param initial_counter - Optional starting value for the counter (defaults to 0)
#[wasm_bindgen]
pub fn wasm_init(initial_counter: i32) {
    let mut state = HELLO_STATE.lock().unwrap();
    state.counter = initial_counter;
}

/// Get the current counter value
/// 
/// **Learning Point**: This demonstrates how to read from the global state.
/// We lock the mutex, read the value, and return it. The lock is automatically
/// released when the function returns.
/// 
/// @returns The current counter value
#[wasm_bindgen]
pub fn get_counter() -> i32 {
    let state = HELLO_STATE.lock().unwrap();
    state.get_counter()
}

/// Increment the counter by 1
/// 
/// **Learning Point**: This demonstrates how to mutate the global state.
/// We lock the mutex, call a mutable method, and the lock is released automatically.
/// 
/// **To extend**: You could add parameters like `increment_by(amount: i32)` to
/// increment by a specific value instead of always 1.
#[wasm_bindgen]
pub fn increment_counter() {
    let mut state = HELLO_STATE.lock().unwrap();
    state.increment_counter();
}

/// Get the current message
/// 
/// **Learning Point**: Strings in Rust need to be converted to JavaScript strings.
/// `wasm-bindgen` handles this automatically when you return a `String` from a
/// `#[wasm_bindgen]` function.
/// 
/// @returns The current message as a JavaScript string
#[wasm_bindgen]
pub fn get_message() -> String {
    let state = HELLO_STATE.lock().unwrap();
    state.get_message()
}

/// Set a new message
/// 
/// **Learning Point**: JavaScript strings are automatically converted to Rust `String`
/// when passed as parameters to `#[wasm_bindgen]` functions.
/// 
/// **To extend**: You could add validation, length limits, or formatting here.
/// 
/// @param message - The new message to set
#[wasm_bindgen]
pub fn set_message(message: String) {
    let mut state = HELLO_STATE.lock().unwrap();
    state.set_message(message);
}

/// Get the current gum
/// 
/// **Learning Point**: Strings in Rust need to be converted to JavaScript strings.
/// `wasm-bindgen` handles this automatically when you return a `String` from a
/// `#[wasm_bindgen]` function.
/// 
/// @returns The current gum as a JavaScript string
#[wasm_bindgen]
pub fn get_fave_gum() -> String {
    let state = HELLO_STATE.lock().unwrap();
    state.get_fave_gum()
}

/// Set a new gum
/// 
/// **Learning Point**: JavaScript strings are automatically converted to Rust `String`
/// when passed as parameters to `#[wasm_bindgen]` functions.
/// 
/// **To extend**: You could add validation, length limits, or formatting here.
/// 
/// @param gum - The new gum to set
#[wasm_bindgen]
pub fn set_fave_gum(gum: String) {
    let mut state = HELLO_STATE.lock().unwrap();
    state.set_fave_gum(gum);
}

/// Get the current favorite ice shape
#[wasm_bindgen]
pub fn get_fave_ice_shape() -> String {
    let state = HELLO_STATE.lock().unwrap();
    state.get_fave_ice_shape()
}

/// Set a new favorite ice shape
#[wasm_bindgen]
pub fn set_fave_ice_shape(shape: String) {
    let mut state = HELLO_STATE.lock().unwrap();
    state.set_fave_ice_shape(shape);
}

/// Get the current decimal value
/// 
/// **Learning Point**: This demonstrates how to work with floating-point numbers
/// in WASM. f64 values are automatically converted between Rust and JavaScript.
/// 
/// @returns The current decimal value (between -10.0 and 10.0)
#[wasm_bindgen]
pub fn get_decimal() -> f64 {
    let state = HELLO_STATE.lock().unwrap();
    state.get_decimal()
}

/// Set a new decimal value
/// 
/// **Learning Point**: The value is clamped to the range [-10.0, 10.0] to ensure
/// it stays within the expected range. This is a common pattern for constrained values.
/// 
/// **To extend**: You could add rounding, step validation, or change constraints here.
/// 
/// @param value - The new decimal value (will be clamped to [-10.0, 10.0])
#[wasm_bindgen]
pub fn set_decimal(value: f64) {
    let mut state = HELLO_STATE.lock().unwrap();
    state.set_decimal(value);
}