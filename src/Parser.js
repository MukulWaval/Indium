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
   * VariableStatementInit
   *  : 'let' VariableDeclarationList
   *  ;
   */
  VariableStatementInit() {
    this._eat("let");
    const declarations = this.VarialbleDeclarationList();
    return {
      type: "VariableStatement",
      declarations,
    };
  }

  /**
   * VariableStatement
   *  : 'let' VarialbleDeclarationList ';'
   *  ;
   */
  VariableStatement() {
    const variableStatement = this.VariableStatementInit();
    this._eat(";");
    return variableStatement;
  }

  /**
   * VarialbleDeclarationList
   *  : VarialbleDeclaration
   *  | VarialbleDeclarationList ',' VarialbleDeclaration
   *  ;
   */
  VarialbleDeclarationList() {
    const declarations = [];
    do {
      declarations.push(this.VariableDeclaration());
    } while (this._lookahead.type === "," && this._eat(","));
    return declarations;
  }

  /**
   * VariableDeclaration
   *  : Identifier OptVariableInitializer
   *  ;
   */
  VariableDeclaration() {
    const id = this.Identifier();

    // OptVariableInitializer
    const init =
      this._lookahead.type !== ";" && this._lookahead.type !== ","
        ? this.VariableInitializer()
        : null;

    return {
      type: "VariableDeclaration",
      id,
      init,
    };
  }

  /**
   * VariableInitializer
   *  : SimpleAssignment AssignmentExpression
   *  ;
   */
  VariableInitializer() {
    this._eat("SimpleAssignment");
    return this.AssignmentExpression();
  }

  /**
   * EmptyStatement
   * : ';'
   * ;
   */
  EmptyStatement() {
    this._eat(";");
    return {
      type: "EmptyStatement",
    };
  }

  /**
   * BlockStatement
   *  : '{' OptStatementList '}'
   *  ;
   */
  BlockStatement() {
    this._eat("{");

    const body = this._lookahead.type !== "}" ? this.StatementList("}") : [];

    this._eat("}");

    return {
      type: "BlockStatement",
      body,
    };
  }

  /**
   * ExpressionStatement
   *  : Expression ';'
   *  ;
   */
  ExpressionStatement() {
    const expression = this.Expression();
    this._eat(";");
    return {
      type: "ExpressionStatement",
      expression,
    };
  }

  /**
   * Expression
   *  : AssignmentExpression
   *  ;
   */
  Expression() {
    return this.AssignmentExpression();
  }

  /**
   * AssignmentExpression
   *  : LogicalOrExpression
   *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
   *  ;
   */
  AssignmentExpression() {
    const left = this.LogicalOrExpression();

    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }

    return {
      type: "AssignmentExpression",
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    };
  }

  /**
   * EqualityExpression
   *  : RelationalExpression EqualityOperator RelationalExpression
   *  | RelationalExpression
   *  ;
   */
  EqualityExpression() {
    return this._BinaryExpression("RelationalExpression", "EqualityOperator");
  }

  /**
   * RelationalExpression
   *  : AdditiveExpression
   *  | AdditiveExpression RelationalOperator RelationalExpression
   */
  RelationalExpression() {
    return this._BinaryExpression("AdditiveExpression", "RelationalOperator");
  }

  /**
   * LeftHandSideExpression
   *  : Identifier
   *  ;
   */
  LeftHandSideExpression() {
    return this.PrimaryExpression();
  }

  /**
   * Identifier
   *  : IDENTIFIER
   *  ;
   */
  Identifier() {
    const name = this._eat("IDENTIFIER").value;
    return {
      type: "Identifier",
      name,
    };
  }

  /**
   * Extra check whether it's valid assignment target.
   */
  _checkValidAssignmentTarget(node) {
    if (node.type === "Identifier") {
      return node;
    }
    throw new SyntaxError("Invalid left-hand side in assignment expression");
  }

  /**
   * Whether the token is an assignment operator.
   */
  _isAssignmentOperator(tokenType) {
    return (
      tokenType === "SimpleAssignment" || tokenType === "ComplexAssignment"
    );
  }

  /**
   * AssignmentOperator
   *  : SimpleAssignment
   *  | ComplenxAssignment
   *  ;
   */
  AssignmentOperator() {
    if (this._lookahead.type === "SimpleAssignment") {
      return this._eat("SimpleAssignment");
    }
    return this._eat("ComplexAssignment");
  }

  /**
   * LogicalAndExpression
   *  : EqualityExpression LogicalAnd LogicalAndExpression
   *  | EqualityExpression
   *  ;
   */
  LogicalAndExpression() {
    return this._LogicalExpression("EqualityExpression", "LogicalAnd");
  }

  /**
   * LogicalOrExpression
   *  : LogicalAndExpression LogicalOr LogicalOrExpression
   *  | LogicalAndExpression
   *  ;
   */
  LogicalOrExpression() {
    return this._LogicalExpression("LogicalAndExpression", "LogicalOr");
  }

  /**
   * AdditiveExpression
   *  : MultiplicativeExpression
   *  | AdditiveExpression AdditiveOperator MultiplicativeExpression
   *  ;
   */
  AdditiveExpression() {
    return this._BinaryExpression(
      "MultiplicativeExpression",
      "AdditiveOperator"
    );
  }

  /**
   * MultiplicativeExpression
   *  : UnaryExpression
   *  | MultiplicativeExpression UnaryExpression PrimaryExpression
   *  ;
   */
  MultiplicativeExpression() {
    return this._BinaryExpression("UnaryExpression", "MultiplicativeOperator");
  }

  /**
   * UnaryExpression
   *  : LeftHandSideExpression
   *  | AdditiveOperator UnaryExpression
   *  | LogicalNot UnaryExpression
   *  ;
   */
  UnaryExpression() {
    let operator;
    switch (this._lookahead.type) {
      case "AdditiveOperator":
        operator = this._eat("AdditiveOperator").value;
        break;
      case "LogicalNot":
        operator = this._eat("LogicalNot").value;
        break;
    }
    if (operator != null) {
      return {
        type: "UnaryExpression",
        operator,
        argument: this.UnaryExpression(),
      };
    }
    return this.LeftHandSideExpression();
  }

  /**
   * Generic logical expression
   */
  _LogicalExpression(buildName, operatorToken) {
    let left = this[buildName]();

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = this[buildName]();

      left = {
        type: "LogicalExpression",
        operator,
        left,
        right,
      };
    }
    return left;
  }

  /**
   * Generic binary expression
   */
  _BinaryExpression(buildName, operatorToken) {
    let left = this[buildName]();

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = this[buildName]();

      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }
    return left;
  }

  /**
   * PrimaryExpression
   *  : Literal
   *  | ParenthesizedExpression
   *  | Identifier
   *  ;
   */
  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }
    switch (this._lookahead.type) {
      case "(":
        return this.ParenthesizedExpression();
      case "IDENTIFIER":
        return this.Identifier();
      default:
        return this.LeftHandSideExpression();
    }
  }

  /**
   * Whether the token is literal.
   */
  _isLiteral(tokenType) {
    return (
      tokenType === "NUMBER" ||
      tokenType === "STRING" ||
      tokenType === "true" ||
      tokenType === "false" ||
      tokenType === "null"
    );
  }

  /**
   * ParenthesizedExpression
   *  : '(' Expression ')'
   *  ;
   */
  ParenthesizedExpression() {
    this._eat("(");
    const expression = this.Expression();
    this._eat(")");
    return expression;
  }

  /**
   * Literal
   *  : NumericLiteral
   *  | StringLiteral
   *  | BooleanLiteral
   *  | NullLiteral
   *  ;
   */
  Literal() {
    switch (this._lookahead.type) {
      case "NUMBER":
        return this.NumericLiteral();
      case "STRING":
        return this.StringLiteral();
      case "true":
        return this.BooleanLiteral(true);
      case "false":
        return this.BooleanLiteral(false);
      case "null":
        return this.NullLiteral();
    }
    throw new SyntaxError(`Literal: unexpected literal production`);
  }

  /**
   * BooleanLiteral
   *  : 'true'
   *  | 'false'
   *  ;
   */
  BooleanLiteral(value) {
    this._eat(value ? "true" : "false");
    return {
      type: "BooleanLiteral",
      value,
    };
  }

  /**
   * NullLiteral
   *  : 'null'
   *  ;
   */
  NullLiteral() {
    this._eat("null");
    return {
      type: "NullLiteral",
      value: null,
    };
  }

  /**
   * StringLiteral
   *  : STRING
   *  ;
   */
  StringLiteral() {
    const token = this._eat("STRING");
    return {
      type: "StringLiteral",
      value: token.value.slice(1, -1),
    };
  }

  /**
   * NumericLiteral
   *  : NUMBER
   *  ;
   */
  NumericLiteral() {
    const token = this._eat("NUMBER");
    return {
      type: "NumericLiteral",
      value: Number(token.value),
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
