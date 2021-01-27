## Maze challenge!

> A fun take-home coding assignment for job applicants
s
## Install things

- You need nodejs installed - [here's how to install it](https://nodejs.org/)
- You also need Rust installed - [here's how to do that](https://www.rust-lang.org/tools/install)
- Install `wasm-pack` - [here's a link to that](https://rustwasm.github.io/wasm-pack/installer/)
- Once you have the above, clone this repo and:
  ```sh
  npm ci
  ```

## Run in debug mode

```sh
npm start
```

## Build for release

Builds the project and places it into the `docs` folder.

```sh
npm run build
```

## How to run unit tests

```sh
# Runs tests in Chrome
npm test -- --chrome
```

## Code

- Rust code (which is compiled to WASM) is in [./src](./src)
- Front end HTML is in [./static](./static)
- Front end JS code is in [./js](client)
- I added a [some non-fancy solutions here](./solutions)

## Questions and answers

### Hey why does this use WASM?

I want to generate mazes and test solutions client-side to avoid load on servers.
Of course by giving away the maze generation and solution checking code,
you pretty much give away an algorithm for solving the maze :) WASM helps with
this since solving this silly maze will be simpler than getting anything useful
out of decompiled WASM :)

## TODO

- The UI is pretty awful, it should be fixed up but preferably without a ton of bloat/libraries :)
- The WASM maze-generation is slower than I'd like. The Rust code seems fine, but serializing the resulting maze as a JSON string and deserializing it client-side is not optimal.
- Add tests
