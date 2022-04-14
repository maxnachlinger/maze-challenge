## Maze challenge!

> A fun take-home coding assignment for job applicants

## [Demo (this is sent to applicants)](https://maxnachlinger.js.org/maze-challenge/)

## Hey why does this use WASM?

I want to generate mazes and test solutions client-side to avoid load on servers.
Of course by giving away the maze generation and solution checking code,
you pretty much give away an algorithm for solving the maze :) WASM helps with
this since solving this silly maze will be simpler than getting anything useful
out of decompiled WASM :)

## Development

### Code

- Rust code (which is compiled to WASM) is in [./src](./src)
- Front end code is in [./client](client-old)

### Install

- You need nodejs installed - [here's how to install it](https://nodejs.org/)
- You also need Rust installed - [here's how to do that](https://www.rust-lang.org/tools/install)
- Install `wasm-pack` - [here's a link to that](https://rustwasm.github.io/wasm-pack/installer/)
- Once you have the above, clone this repo and:
  ```sh
  npm ci
  ```

### Run in debug mode

```sh
npm start
```

### Build for release

Builds the project and places it into the `docs` folder (which the Github pages demo is built from).

```sh
npm run build
```

### Unit tests

```sh
# Runs tests in Chrome
npm test -- --chrome
```

## TODO

- Serializing between Rust <-> JS seems to be expensive.
- Add tests
