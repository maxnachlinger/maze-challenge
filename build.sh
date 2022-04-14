#!/bin/bash

set -euo pipefail

TARGET=wasm32-unknown-unknown
BINARY=target/$TARGET/release/maze_challenge.wasm

cargo build --target $TARGET --release
wasm-strip $BINARY
wasm-opt -o docs/maze_challenge.wasm -Oz docs/maze_challenge.wasm
