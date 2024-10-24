/**
 * Letter parser: recursive descent implementation.
 */
const { Tokenizer } = require("../src/Tokenizer");

class Parser {
  /**
   * Initialize the parser.
   */
  constructor() {
    this._string = "";
    this._tokenizer = new Tokenizer();
  }

  /**
   * Parses a string into AST.
   */
  parse(string) {
    this._string = string;
    this._tokenizer.init(string);

    // Prime the tokenizer to obtain the first
    // token which is our lookahead. The lookahead is
    // used for predictive parsing.

    this._lookahead = this._tokenizer.getNextToken();

    // Parse recursively from the main
    // entry point , the Program:

    return this.Program();
  }

  /**
   * Program
   *  : StatementList
   *  ;
   */
  Program() {
    return {
      type: "Program",
      body: this.StatementList(),
    };
  }

  /**
   * Expects a token of a given type.
   */
  _eat(tokenType) {
    const token = this._lookahead;
    if (token == null) {
      throw new SyntaxError(
        `Unexpected end of input, expected: "${tokenType}"`
      );
    }
    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}",` + `expected "${tokenType}"`
      );
    }
    // Advance to next token
    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }
}
module.exports = {
  Parser,
};
