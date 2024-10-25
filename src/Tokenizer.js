/**
 * Tokenizer spec.
 */
const Spec = [
  // WHITESPACE--------------------------------------------------------
  [/^\s+/, null],

  // COMMENTS----------------------------------------------------------
  [/^\/\/.*/, null],
  [/^\/\*[\s\S]*?\*\//, null],

  // SYSMBOLS, DELIMETERS----------------------------------------------
  [/^;/, ";"],
  [/^{/, "{"],
  [/^}/, "}"],
  [/^\(/, "("],
  [/^\)/, ")"],
  [/^,/, ","],

  // KEYWORDS----------------------------------------------------------
  [/^\blet\b/, "let"],
  [/^\bif\b/, "if"],
  [/^\belse\b/, "else"],
  [/^\btrue\b/, "true"],
  [/^\bfalse\b/, "false"],
  [/^\bnull\b/, "null"],
  [/^\bwhile\b/, "while"],
  [/^\bdo\b/, "do"],
  [/^\bfor\b/, "for"],
  [/^\bdef\b/, "def"],
  [/^\breturn\b/, "return"],

  // EQUALITY OPERATORS------------------------------------------------
  [/^[=!]=/, "EqualityOperator"],

  // ASSIGNMENT OPERATORS----------------------------------------------
  [/^=/, "SimpleAssignment"],
  [/^[\*\/\+\-]=/, "ComplexAssignment"],

  // MATH OPERATORS----------------------------------------------------
  [/^[+\-]/, "AdditiveOperator"],
  [/^[*\/]/, "MultiplicativeOperator"],

  // RELATIONAL OPERATORS----------------------------------------------
  [/^[><]=?/, "RelationalOperator"],

  // LOGICAL OPERATORS------------------------------------------------
  [/^&&/, "LogicalAnd"],
  [/^\|\|/, "LogicalOr"],
  [/^!/, "LogicalNot"],

  // NUMBER------------------------------------------------------------
  [/^\d+/, "NUMBER"],

  // STRING------------------------------------------------------------
  [/^"[^"]*"/, "STRING"],
  [/^'[^']*'/, "STRING"],

  // IDENTIFIERS-------------------------------------------------------
  [/^\w+/, "IDENTIFIER"],
];

/**
 * Tokenizer class.
 *
 * Lazily pulls a token from a stream.
 */
class Tokenizer {
  /**
   * Initialize the tokenizer.
   */
  constructor() {
    this._cursor = 0;
    this._string = "";
  }

  /**
   * Initialize the string.
   */
  init(string) {
    this._string = string;
    this._cursor = 0;
  }

  /**
   * Whether tokenizer reaches EOF.
   */
  isEOF() {
    return this._cursor === this._string.length;
  }

  /**
   * Whether we still have tokens.
   */
  hasMoreTokens() {
    return this._cursor < this._string.length;
  }

  /**
   * Obtains the next token.
   */
  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const string = this._string.slice(this._cursor);

    for (const [regex, tokenType] of Spec) {
      const tokenValue = this._matched(regex, string);
      // Can't match this rule, continue.
      if (tokenValue == null) {
        continue;
      }

      // Skip token, e.g. whitespace.
      if (tokenType == null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`);
  }

  /**
   * Matches a token for a regular expression.
   */
  _matched(regex, string) {
    const matched = regex.exec(string);
    if (matched == null) {
      return null;
    }
    this._cursor += matched[0].length;
    return matched[0];
  }
}

module.exports = {
  Tokenizer,
};
