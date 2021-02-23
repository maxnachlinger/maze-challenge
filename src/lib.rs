extern crate serde;
use crate::check_solution::check_rectangular_maze_solution;
use crate::generate_maze::generate_rectangular_maze;
use crate::util::{Position, PrefectRectangularMazeNoLoops};
use wasm_bindgen::prelude::*;

mod check_solution;
mod generate_maze;
mod util;

#[wasm_bindgen]
pub fn generate_maze(num_rows: i32, num_cols: i32) -> JsValue {
    let maze = generate_rectangular_maze(num_rows, num_cols);
    JsValue::from_serde(&maze).unwrap()
}

#[wasm_bindgen]
pub fn check_solution(maze_json: &JsValue, solution_json: &JsValue) -> JsValue {
    let maze: PrefectRectangularMazeNoLoops = maze_json.into_serde().unwrap();
    let solution: Vec<Position> = solution_json.into_serde().unwrap();
    let check_solution_result = check_rectangular_maze_solution(maze, solution);
    JsValue::from_serde(&check_solution_result).unwrap()
}

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
    Ok(())
}
