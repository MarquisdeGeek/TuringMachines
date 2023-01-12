const EliasOmega = require("eliasomega");

class Evaluator {
  #codeBlock;
  // Since our states often have 0, we use the non-negative (i.e. 0+) bijection function
  static #eliasEncoder = new EliasOmega(EliasOmega.biNonNegativeOnly);

  constructor(code) {
    this.#codeBlock = code;
  }

  process(data) {
    let state = this.#codeBlock.startAt;
    let dataString = data.toString(2);
    let dataIndex = 0;

    do {
      if (dataString[dataIndex] === "0") {
        state = this.#codeBlock.states[state].f;
      } else if (dataString[dataIndex] === "1") {
        state = this.#codeBlock.states[state].t;
      } else {
        throw new Error(
          `Invalid symbol of '${dataString[dataIndex]}'. Only 0 and 1 are permitted.`
        );
      }
      ++dataIndex;
    } while (dataIndex < dataString.length);

    return state === this.#codeBlock.trueIf ? true : false;
  }

  exportAsBinary() {
    let value = "1"; // to stop our number starting with 0, and losing the first digit(s)

    value += Evaluator.#eliasEncoder.encode(this.#codeBlock.startAt);
    value += Evaluator.#eliasEncoder.encode(this.#codeBlock.trueIf);

    this.#codeBlock.states.forEach((state) => {
      value += Evaluator.#eliasEncoder.encode(state.t);
      value += Evaluator.#eliasEncoder.encode(state.f);
    });

    return value;
  }

  static importFromInteger(valueInt) {
    const value = valueInt.toString(2);
    return this.importFromBinary(value);
  }

  static importFromBinary(valueBinary) {
    const code = {
      startAt: 0,
      trueIf: 0,
      states: [],
    };

    let index = 1; // ignore first bit, which is always 1
    const startAtString = Evaluator.#eliasEncoder.decode(valueBinary.substr(index));
    code.startAt = parseInt(startAtString.result, 10);
    index += startAtString.size;

    const trueIfString = Evaluator.#eliasEncoder.decode(valueBinary.substr(index));
    code.trueIf = parseInt(trueIfString.result, 10);
    index += trueIfString.size;

    do {
      const trueState = Evaluator.#eliasEncoder.decode(valueBinary.substr(index));
      index += trueState.size;

      const falseState = Evaluator.#eliasEncoder.decode(valueBinary.substr(index));
      index += falseState.size;

      code.states.push({
        t: trueState.result,
        f: falseState.result,
      });
    } while (index < valueBinary.length);

    return new Evaluator(code);
  }
}

module.exports = Evaluator;
