# TuringMachines
Generic class to process and serialise universal Turing machines and evaluators

## About
Developers love to throw around words like "Turing Complete" and "Universal Turing Machines" (and why shouldn't they!?!?) so I figured it was time to write a small module that implemented the same.

This package contains two virtual machines:
* An evaluator, which processes an input stream with a state machine
* A universal machine, with "infinite" length tape

## Usage - the module

When using this as an NPM module, simple use:

```
const Turing = require('universal-turing-machine');
```

instead of
```
const Turing = require('./src/index');
```

## Usage - evaluator

To determine if a number is a multiple of 3, there's a three-state machine to demonstrate this. Test it with:

```
const div3 = require('./examples/ex1-evaluator-div3');
const Turing = require('./src/index');

const machine = new Turing.Evaluator(div3);
const result = machine.process(3);

console.log(result);
```

## Usage - universal machine

To run the basic "busy beaver" example, use:
```
const beaver = require('./examples/ex2-machine-busy-beaver');
const Turing = require('./src/index');

const machine = new Turing.Machine(beaver);
// Initial tape state, and 'true' indicating we want full state traces
const results = machine.process("0", true);

machine.exportStateTransitions(results.trace, (state, line) => {
  // A typical callback to output results:
  console.log(`${state} :: ${line}`);
  // When line shows an 'x' it indicates the tape head position, and it is over a 0
  // When line shows an '*' it indicates the tape head position, and it is over a 1
});
```
## Features

* Automatic tape extensions with the limits are reached (until memory fills)
* Export/import code as binary numbers (`importFromBinary` and `exportAsBinary`)
* Full state lists for programs that complete
* Elias Omega encoding for arbitrary length binary strings

## Testing

This runs basic import/export/process tests for the existing example programs.

```
npm test
```
