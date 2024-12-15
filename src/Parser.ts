import { Tokenizer } from "../src/Tokenizer";

interface Token {
  type: string;
  value: string;
}

interface ASTNode {
  type: string;
  [key: string]: any;
}

/**
 * Letter parser: recursive descent implementation.
 */
class Parser {
  private _string: string;
  private _tokenizer: Tokenizer;
  private _lookahead: Token | null;

  /**
   * Initialize the parser.
   */
  constructor() {
    this._string = "";
    this._tokenizer = new Tokenizer();
    this._lookahead = null;
  }

  /**
   * Parses a string into AST.
   */
  parse(string: string): ASTNode {
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
  Program(): ASTNode {
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
  StatementList(stopLookahead: string | null = null): ASTNode[] {
    const statementList: ASTNode[] = [this.Statement()];

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
  Statement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  FunctionDeclaration(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    this._eat("def");
    const name = this.Identifier();
    this._eat("(");
    const params: ASTNode[] =
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
  FormalParameterList(): ASTNode[] {
    const params: ASTNode[] = [];
    while (this._lookahead !== null && this._lookahead.type === ",") {
      this._eat(",");
      params.push(this.Identifier());
    }
    return params;
  }

  /**
   * ReturnStatement
   *  : 'return' OptExpression ';'
   *  ;
   */
  ReturnStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    this._eat("return");
    const argument: ASTNode | null =
      this._lookahead.type !== ";" ? this.Expression() : null;
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
  IterationStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    switch (this._lookahead.type) {
      case "while":
        return this.WhileStatement();
      case "do":
        return this.DoWhileStatement();
      case "for":
        return this.ForStatement();
      default:
        throw new SyntaxError("Unexpected Iteration Statement");
    }
  }

  /**
   * WhileStatement
   *  : 'while' '(' Expression ')' Statement
   *  ;
   */
  WhileStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  DoWhileStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  ForStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    this._eat("for");
    this._eat("(");
    const init: ASTNode | null =
      this._lookahead.type !== ";" ? this.ForStatementInit() : null;
    this._eat(";");
    const test: ASTNode | null =
      this._lookahead.type !== ";" ? this.Expression() : null;
    this._eat(";");
    const update: ASTNode | null =
      this._lookahead.type !== ")" ? this.Expression() : null;
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
  ForStatementInit(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  IfStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    this._eat("if");
    this._eat("(");
    const test = this.Expression();
    this._eat(")");
    const consequent = this.Statement();
    const alternate: ASTNode | null =
      this._lookahead !== null && this._lookahead.type === "else"
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
  VariableStatementInit(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  VariableStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  VarialbleDeclarationList(): ASTNode[] {
    const declarations: ASTNode[] = [];
    while (this._lookahead !== null && this._lookahead.type === ",") {
      this._eat(",");
      declarations.push(this.VariableDeclaration());
    }
    return declarations;
  }

  /**
   * VariableDeclaration
   *  : Identifier OptVariableInitializer
   *  ;
   */
  VariableDeclaration(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    const id = this.Identifier();
    const init: ASTNode | null =
      this._lookahead !== null &&
      this._lookahead.type !== ";" &&
      this._lookahead.type !== ","
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
  VariableInitializer(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    this._eat("SimpleAssignment");
    return this.AssignmentExpression();
  }

  /**
   * EmptyStatement
   * : ';'
   * ;
   */
  EmptyStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  BlockStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    this._eat("{");
    const body: ASTNode[] =
      this._lookahead.type !== "}" ? this.StatementList("}") : [];
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
  ExpressionStatement(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  Expression(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    return this.AssignmentExpression();
  }

  /**
   * AssignmentExpression
   *  : LogicalOrExpression
   *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
   *  ;
   */
  AssignmentExpression(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    const left = this.LogicalOrExpression();

    if (!this._isAssignmentOperator(this._lookahead?.type ?? "")) {
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
  EqualityExpression(): ASTNode {
    return this._BinaryExpression("RelationalExpression", "EqualityOperator");
  }

  /**
   * RelationalExpression
   *  : AdditiveExpression
   *  | AdditiveExpression RelationalOperator RelationalExpression
   */
  RelationalExpression(): ASTNode {
    return this._BinaryExpression("AdditiveExpression", "RelationalOperator");
  }

  /**
   * LeftHandSideExpression
   *  : Identifier
   *  ;
   */
  LeftHandSideExpression(): ASTNode {
    return this.PrimaryExpression();
  }

  /**
   * Identifier
   *  : IDENTIFIER
   *  ;
   */
  Identifier(): ASTNode {
    const name = this._eat("IDENTIFIER").value;
    return {
      type: "Identifier",
      name,
    };
  }

  /**
   * Extra check whether it's valid assignment target.
   */
  _checkValidAssignmentTarget(node: ASTNode): ASTNode {
    if (node.type === "Identifier") {
      return node;
    }
    throw new SyntaxError("Invalid left-hand side in assignment expression");
  }

  /**
   * Whether the token is an assignment operator.
   */
  _isAssignmentOperator(tokenType: string): boolean {
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
  AssignmentOperator(): Token {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  LogicalAndExpression(): ASTNode {
    return this._LogicalExpression("EqualityExpression", "LogicalAnd");
  }

  /**
   * LogicalOrExpression
   *  : LogicalAndExpression LogicalOr LogicalOrExpression
   *  | LogicalAndExpression
   *  ;
   */
  LogicalOrExpression(): ASTNode {
    return this._LogicalExpression("LogicalAndExpression", "LogicalOr");
  }

  /**
   * AdditiveExpression
   *  : MultiplicativeExpression
   *  | AdditiveExpression AdditiveOperator MultiplicativeExpression
   *  ;
   */
  AdditiveExpression(): ASTNode {
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
  MultiplicativeExpression(): ASTNode {
    return this._BinaryExpression("UnaryExpression", "MultiplicativeOperator");
  }

  /**
   * UnaryExpression
   *  : LeftHandSideExpression
   *  | AdditiveOperator UnaryExpression
   *  | LogicalNot UnaryExpression
   *  ;
   */
  UnaryExpression(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

    let operator: string | undefined;
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
  _LogicalExpression(buildName: string, operatorToken: string): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  _BinaryExpression(buildName: string, operatorToken: string): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  PrimaryExpression(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  _isLiteral(tokenType: string): boolean {
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
  ParenthesizedExpression(): ASTNode {
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
  Literal(): ASTNode {
    if (this._lookahead === null) {
      throw new SyntaxError("Unexpected end of input");
    }

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
  BooleanLiteral(value: boolean): ASTNode {
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
  NullLiteral(): ASTNode {
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
  StringLiteral(): ASTNode {
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
  NumericLiteral(): ASTNode {
    const token = this._eat("NUMBER");
    return {
      type: "NumericLiteral",
      value: Number(token.value),
    };
  }

  /**
   * Expects a token of a given type.
   */
  _eat(tokenType: string): Token {
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
    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }
}

interface Parser {
  [key: string]: any;
}

export { Parser };
