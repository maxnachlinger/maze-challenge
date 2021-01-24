extern crate serde;
use crate::generate_maze::{generate_rectangular_maze, PrefectRectangularMazeNoLoops};
use serde::Serialize;
use wasm_bindgen::prelude::*;
use web_sys::console;

mod generate_maze;
mod util;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn generate_maze(num_rows: i32, num_cols: i32) -> JsValue {
    let maze = generate_rectangular_maze(num_rows, num_cols);
    JsValue::from_str(&serde_json::to_string(&maze).unwrap())
}

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
    Ok(())
}
