const EliasOmega = require("eliasomega");

class Machine {
  #codeBlock;
  // Since our states often have 0, we use the non-negative (i.e. 0+) bijection function
  static #eliasEncoder = new EliasOmega(EliasOmega.biAllIntegers);

  constructor(code) {
    this.#codeBlock = code;
  }

  process(tape = "0", keepAllResults = false) {
    let state = 0;
    let tapeIndex = 0;
    let tapeOffset = 0; // where is the _real_ zero
    let tapeArray = tape.split("");
    let results = [];

    while (state >= 0) {
      let wedo;

      // Grow the tape if necessary
      if (tapeIndex < 0) {
        tapeOffset += -tapeIndex;
        tapeIndex = 0;
        tapeArray.unshift("0");
      } else if (tapeIndex >= tapeArray.length) {
        tapeArray.push("0");
      }

      // Preserve current state
      if (keepAllResults) {
        results.push({
          state: state,
          tape: tapeArray.join(""),
          tapeOffset: tapeOffset,
          tapeIndex: tapeIndex,
        });
      }

      // Process the next state
      if (tapeArray[tapeIndex] === "0") {
        wedo = this.#codeBlock.states[state].f;
      } else if (tapeArray[tapeIndex] === "1") {
        wedo = this.#codeBlock.states[state].t;
      } else {
        throw new Error(
          `Invalid symbol of '${tapeArray[tapeIndex]}'. Only 0 and 1 are permitted.`
        );
      }
      //
      tapeArray[tapeIndex] = wedo.wr ? "1" : "0"; // TODO: support no write operations
      tapeIndex += wedo.mv;
      state = wedo.nxt;
    }

    // Now fill in the left padding, when the tape moved into the negative
    if (keepAllResults) {
      const lhsPadding = results[results.length - 1].tapeOffset;
      const rhsPadding = results[results.length - 1].tape.length; // the tape must always be the widest at the end
      for (let i = results.length; i > 0; ) {
        --i;
        const offsetHere = results[i].tapeOffset;
        const paddingToAddLHS = lhsPadding - offsetHere;

        if (paddingToAddLHS > 0) {
          results[i].tape = "0".repeat(paddingToAddLHS) + results[i].tape;
          results[i].tapeIndex += paddingToAddLHS;
        }
        // Any RHS padding, to ensure everything is the same width?
        const paddingToAddRHS = rhsPadding - results[i].tape.length;
        if (paddingToAddRHS > 0) {
          results[i].tape += "0".repeat(paddingToAddRHS);
        }
      }
    }

    return {
      tape: tapeArray.join(""),
      tapeIndex: tapeIndex,
      tapeOffset: tapeOffset,
      trace: results,
    };
  }

  exportStateTransitions(inputData, outputFn) {
    inputData.forEach((data) => {
      let line = data.tape.substr(0, data.tapeIndex);
      line += data.tape[data.tapeIndex] === "0" ? "x" : "*";
      line += data.tape.substr(data.tapeIndex + 1);

      outputFn(data.state, line);
    });
  }

  exportAsBinary() {
    let value = "1"; // to stop our number starting with 0, and losing the first digit(s)

    let stateCount = this.#codeBlock.states.length;
    value += Machine.#eliasEncoder.encode(stateCount);

    this.#codeBlock.states.forEach((state) => {
      value += Machine.#eliasEncoder.encode(state.f.wr);
      value += Machine.#eliasEncoder.encode(state.f.mv);
      value += Machine.#eliasEncoder.encode(state.f.nxt);

      value += Machine.#eliasEncoder.encode(state.t.wr);
      value += Machine.#eliasEncoder.encode(state.t.mv);
      value += Machine.#eliasEncoder.encode(state.t.nxt);
    });

    return value;
  }

  static importFromInteger(valueInt) {
    const value = valueInt.toString(2);
    return this.importFromBinary(value);
  }

  static importFromBinary(valueBinary) {
    const code = {
      states: [],
    };

    let index = 1; // ignore first bit, which is always 1

    const stateCountDecode = Machine.#eliasEncoder.decode(
      valueBinary.substr(index)
    );
    const stateCount = parseInt(stateCountDecode.result, 10);
    index += stateCountDecode.size;

    for (let i = 0; i < stateCount; ++i) {
      let newState = {
        t: {},
        f: {},
      };

      let tmpDecode;
      tmpDecode = Machine.#eliasEncoder.decode(valueBinary.substr(index)); newState.f.wr = parseInt(tmpDecode.result, 10); index += tmpDecode.size;
      tmpDecode = Machine.#eliasEncoder.decode(valueBinary.substr(index)); newState.f.mv = parseInt(tmpDecode.result, 10); index += tmpDecode.size;
      tmpDecode = Machine.#eliasEncoder.decode(valueBinary.substr(index)); newState.f.nxt = parseInt(tmpDecode.result, 10); index += tmpDecode.size;

      tmpDecode = Machine.#eliasEncoder.decode(valueBinary.substr(index)); newState.t.wr = parseInt(tmpDecode.result, 10); index += tmpDecode.size;
      tmpDecode = Machine.#eliasEncoder.decode(valueBinary.substr(index)); newState.t.mv = parseInt(tmpDecode.result, 10); index += tmpDecode.size;
      tmpDecode = Machine.#eliasEncoder.decode(valueBinary.substr(index)); newState.t.nxt = parseInt(tmpDecode.result, 10); index += tmpDecode.size;

      code.states.push(newState);
    }

    return new Machine(code);
  }
}

module.exports = Machine;
