extern crate serde;
use lazy_static::lazy_static;
use rand::seq::SliceRandom;
use rand::thread_rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const UP: i8 = 1;
pub const RIGHT: i8 = 2;
pub const DOWN: i8 = 4;
pub const LEFT: i8 = 8;

lazy_static! {
    pub static ref COL_DIRECTION_OFFSETS: HashMap<i8, i32> = {
        [(LEFT, -1), (RIGHT, 1), (UP, 0), (DOWN, 0)]
            .iter()
            .cloned()
            .collect()
    };
    pub static ref ROW_DIRECTION_OFFSETS: HashMap<i8, i32> = {
        [(LEFT, 0), (RIGHT, 0), (UP, -1), (DOWN, 1)]
            .iter()
            .cloned()
            .collect()
    };
    pub static ref OPPOSITE_DIRECTIONS: HashMap<i8, i8> = {
        [(LEFT, RIGHT), (RIGHT, LEFT), (UP, DOWN), (DOWN, UP)]
            .iter()
            .cloned()
            .collect()
    };
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrefectRectangularMazeNoLoops {
    pub start: Position,
    pub end: Position,
    pub rows_and_columns: Vec<Vec<i8>>,
}

#[derive(Clone, Copy, Serialize, Deserialize)]
pub struct Position {
    pub row: i32,
    pub col: i32,
}

pub fn shuffle_directions() -> Vec<i8> {
    let mut directions = vec![UP, RIGHT, DOWN, LEFT];
    directions.shuffle(&mut thread_rng());
    directions
}
