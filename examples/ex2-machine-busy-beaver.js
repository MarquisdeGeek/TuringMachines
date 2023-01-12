let beaver = {
  states: [
    /* 0: A */ { f: { wr: 1, mv: 1, nxt: 1 }, t: { wr: 1, mv: -1, nxt: 2 } },
    /* 1: B */ { f: { wr: 1, mv: -1, nxt: 0 }, t: { wr: 1, mv: 1, nxt: 1 } },
    /* 2: C */ { f: { wr: 1, mv: -1, nxt: 1 }, t: { wr: 1, mv: 1, nxt: -1 } },
  ]
};

module.exports = beaver;
