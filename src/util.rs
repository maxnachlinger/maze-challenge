use js_sys::*;
use lazy_static::lazy_static;
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

pub fn shuffle_directions() -> Vec<i8> {
    let mut directions = vec![UP, RIGHT, DOWN, LEFT];
    let mut tmp: i8;
    let mut i = directions.len() - 1;
    let mut j: usize;

    while i > 0 {
        j = Math::floor(Math::random() * (i as f64 + 1.0)) as usize;
        tmp = directions[j];
        directions[j] = directions[i];
        directions[i] = tmp;
        i -= i;
    }
    return directions;
}
