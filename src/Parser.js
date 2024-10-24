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
   * StatementList
   *  : Statement
   *  | StatementList
   *  ;
   */
  StatementList(stopLookahead = null) {
    const statementList = [this.Statement()];

    while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }

    return statementList;
  }

  /**
   * Statement
   *  : ExpressionStatement
   *  | BlockStatement
   *  | EmptyStatement
   *  | VariableStatement
   *  | IfStatement
   *  | IterationStatement
   *  | FunctionDeclaration
   *  | ReturnStatement
   *  ;
   */
  Statement() {
    switch (this._lookahead.type) {
      case ";":
        return this.EmptyStatement();
      case "if":
        return this.IfStatement();
      case "{":
        return this.BlockStatement();
      case "let":
        return this.VariableStatement();
      case "def":
        return this.FunctionDeclaration();
      case "return":
        return this.ReturnStatement();
      case "while":
      case "do":
      case "for":
        return this.IterationStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * FunctionDeclaration
   *  : 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
   *  ;
   */
  FunctionDeclaration() {
    this._eat("def");
    const name = this.Identifier();

    this._eat("(");

    // OptFormalParameterList
    const params =
      this._lookahead.type !== ")" ? this.FormalParameterList() : [];

    this._eat(")");

    const body = this.BlockStatement();

    return {
      type: "FunctionDeclaration",
      name,
      params,
      body,
    };
  }

  /**
   * FormalParameterList
   *  : Identifier
   *  | FormalParameterList ',' Identifier
   *  ;
   */
  FormalParameterList() {
    const params = [];
    do {
      params.push(this.Identifier());
    } while (this._lookahead.type === "," && this._eat(","));

    return params;
  }

  /**
   * ReturnStatement
   *  : 'return' OptExpression ';'
   *  ;
   */
  ReturnStatement() {
    this._eat("return");
    const argument = this._lookahead.type !== ";" ? this.Expression() : null;
    this._eat(";");
    return {
      type: "ReturnStatement",
      argument,
    };
  }

  /**
   * IterationStatement
   *  : WhileStatement
   *  | DoWhileStatement
   *  | ForStatement
   *  ;
   */
  IterationStatement() {
    switch (this._lookahead.type) {
      case "while":
        return this.WhileStatement();
      case "do":
        return this.DoWhileStatement();
      case "for":
        return this.ForStatement();
    }
  }

  /**
   * WhileStatement
   *  : 'while' '(' Expression ')' Statement
   *  ;
   */
  WhileStatement() {
    this._eat("while");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");
    const body = this.Statement();
    return {
      type: "WhileStatement",
      test,
      body,
    };
  }

  /**
   * DoWhileStatement
   *  : 'do' Statement 'while' '(' Expression ')' ';'
   *  ;
   */
  DoWhileStatement() {
    this._eat("do");
    const body = this.Statement();
    this._eat("while");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");
    this._eat(";");
    return {
      type: "DoWhileStatement",
      body,
      test,
    };
  }

  /**
   * ForStatement
   *  : 'for' '(' OptForStatement ';' OptExpression ';' OptExpression ')' Statement
   *  ;
   */
  ForStatement() {
    this._eat("for");
    this._eat("(");
    const init = this._lookahead.type !== ";" ? this.ForStatementInit() : null;
    this._eat(";");
    const test = this._lookahead.type !== ";" ? this.Expression() : null;
    this._eat(";");
    const update = this._lookahead.type !== ")" ? this.Expression() : null;
    this._eat(")");
    const body = this.Statement();
    return {
      type: "ForStatement",
      init,
      test,
      update,
      body,
    };
  }

  /**
   * ForStatementInit
   *  : VariableStatementInit
   *  | Expression
   *  ;
   */
  ForStatementInit() {
    if (this._lookahead.type === "let") {
      return this.VariableStatementInit();
    }
    return this.Expression();
  }

  /**
   * IfStatement
   *  : 'if' '(' Expression ')' Statement
   *  | 'if' '(' Expression ')' Statement 'else' Statement
   *  ;
   */
  IfStatement() {
    this._eat("if");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");
    const consequent = this.Statement();
    const alternate =
      this._lookahead != null && this._lookahead.type === "else"
        ? this._eat("else") && this.Statement()
        : null;
    return {
      type: "IfStatement",
      test,
      consequent,
      alternate,
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
