/**
 * Tokenizer spec.
 */
interface Token {
  regex: RegExp;
  tokenType: string | null;
}

const Spec: Token[] = [
  // WHITESPACE--------------------------------------------------------
  { regex: /^\s+/, tokenType: null },

  // COMMENTS----------------------------------------------------------
  { regex: /^\/\/.*$/, tokenType: null },
  { regex: /^\/\*[\s\S]*?\*\//, tokenType: null },

  // SYMBOLS, DELIMITERS----------------------------------------------
  { regex: /^;/, tokenType: ";" },
  { regex: /^{/, tokenType: "{" },
  { regex: /^}/, tokenType: "}" },
  { regex: /^\(/, tokenType: "(" },
  { regex: /^\)/, tokenType: ")" },
  { regex: /^,/, tokenType: "," },

  // KEYWORDS----------------------------------------------------------
  { regex: /^\blet\b/, tokenType: "let" },
  { regex: /^\bif\b/, tokenType: "if" },
  { regex: /^\belse\b/, tokenType: "else" },
  { regex: /^\btrue\b/, tokenType: "true" },
  { regex: /^\bfalse\b/, tokenType: "false" },
  { regex: /^\bnull\b/, tokenType: "null" },
  { regex: /^\bwhile\b/, tokenType: "while" },
  { regex: /^\bdo\b/, tokenType: "do" },
  { regex: /^\bfor\b/, tokenType: "for" },
  { regex: /^\bdef\b/, tokenType: "def" },
  { regex: /^\breturn\b/, tokenType: "return" },

  // EQUALITY OPERATORS------------------------------------------------
  { regex: /^[=!]=/, tokenType: "EqualityOperator" },

  // ASSIGNMENT OPERATORS----------------------------------------------
  { regex: /^=/, tokenType: "SimpleAssignment" },
  { regex: /^[\*\/\+\-]=/, tokenType: "ComplexAssignment" },

  // MATH OPERATORS----------------------------------------------------
  { regex: /^[+\-]/, tokenType: "AdditiveOperator" },
  { regex: /^[*\/]/, tokenType: "MultiplicativeOperator" },

  // RELATIONAL OPERATORS----------------------------------------------
  { regex: /^[><]=?/, tokenType: "RelationalOperator" },

  // LOGICAL OPERATORS------------------------------------------------
  { regex: /^&&/, tokenType: "LogicalAnd" },
  { regex: /^\|\|/, tokenType: "LogicalOr" },
  { regex: /^!/, tokenType: "LogicalNot" },

  // NUMBER------------------------------------------------------------
  { regex: /^\d+/, tokenType: "NUMBER" },

  // STRING------------------------------------------------------------
  { regex: /^"[^"]*"/, tokenType: "STRING" },
  { regex: /^'[^']*'/, tokenType: "STRING" },

  // IDENTIFIERS-------------------------------------------------------
  { regex: /^\w+/, tokenType: "IDENTIFIER" },
];

/**
 * Token interface.
 */
interface Tokenized {
  type: string;
  value: string;
}

/**
 * Tokenizer class.
 *
 * Lazily pulls a token from a stream.
 */
class Tokenizer {
  private _cursor: number;
  private _string: string;

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
  public init(string: string): void {
    this._string = string;
    this._cursor = 0;
  }

  /**
   * Whether tokenizer reaches EOF.
   */
  public isEOF(): boolean {
    return this._cursor === this._string.length;
  }

  /**
   * Whether we still have tokens.
   */
  public hasMoreTokens(): boolean {
    return this._cursor < this._string.length;
  }

  /**
   * Obtains the next token.
   */
  public getNextToken(): Tokenized | null {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const string = this._string.slice(this._cursor);

    for (const { regex, tokenType } of Spec) {
      const tokenValue = this._match(regex, string);
      // Can't match this rule, continue.
      if (tokenValue == null) {
        continue;
      }

      // Skip token, e.g., whitespace.
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
  private _match(regex: RegExp, string: string): string | null {
    const matched = regex.exec(string);
    if (matched == null) {
      return null;
    }
    this._cursor += matched[0].length;
    return matched[0];
  }
}

export { Tokenizer, Token };
