const expect = require("chai").expect;

const div3 = require('../examples/ex1-evaluator-div3');
const beaver = require('../examples/ex2-machine-busy-beaver');
const Turing = require('../src/index');



describe("Div3 tests", function() {
  function checkDiv3(tm) {
    for(let i=1;i<100;++i) {
      const result = tm.process(i);
      expect(result).to.equal((result % 3) === 1 ? true : false);
    }
  }

  it("From code", function() {
    checkDiv3(new Turing.Evaluator(div3));
  });

  it("From binary", function() {
    checkDiv3(Turing.Evaluator.importFromBinary("10010000110110100"));
  });

  it("From integer", function() {
    checkDiv3(Turing.Evaluator.importFromInteger(74164));
  });

});

describe("Div3 export", function() {
  it("As integer", function() {
    let tm = new Turing.Evaluator(div3);
    expect(tm.exportAsBinary()).to.equal("10010000110110100");
  });
});



describe("Busy beaver tests", function() {

  function checkBeaver(tm) {
    let results = tm.process("0", true);
    let expecting = [
      "000x00",
      "0001x0",
      "000*10",
      "00x110",
      "0x1110",
      "x11110",
      "1*1110",
      "11*110",
      "111*10",
      "1111*0",
      "11111x",
      "1111*1",
      "111*11"
    ];

    let idx = 0;
    tm.exportStateTransitions(results.trace, (state, line) => {
      // A typical callback to output results:
      //console.log(`${state} :: ${line}`);
      expect(line).to.equal(expecting[idx]);
      ++idx;
    })
  }

  it("From code", function() {
    checkBeaver(new Turing.Machine(beaver));
  });


  it("From binary", function() {
    checkBeaver(Turing.Machine.importFromBinary("11011001001001001001101010001001100100100100100110100100100110"));
  });

});

describe("Busy beaver export", function() {
  it("As integer", function() {
    let tm = new Turing.Machine(beaver);
    expect(tm.exportAsBinary()).to.equal("11011001001001001001101010001001100100100100100110100100100110");
  });
});

