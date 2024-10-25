const { Tokenizer } = require("../src/Tokenizer");

describe("Tokenizer - Initialization", () => {
  let tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });

  test("should initialize tokenizer with empty string", () => {
    tokenizer.init("");
    expect(tokenizer.isEOF()).toBe(true);
    expect(tokenizer.hasMoreTokens()).toBe(false);
  });

  test("should initialize tokenizer with non-empty string", () => {
    tokenizer.init("let x = 42;");
    expect(tokenizer.isEOF()).toBe(false);
    expect(tokenizer.hasMoreTokens()).toBe(true);
  });
});

describe("Tokenizer - All tokens", () => {
  let tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });

  test("should handle whitespace and comments (skipped tokens)", () => {
    tokenizer.init("   // comment \n /* block comment */");
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize symbols and delimiters", () => {
    tokenizer.init("();{},");
    expect(tokenizer.getNextToken()).toEqual({ type: "(", value: "(" });
    expect(tokenizer.getNextToken()).toEqual({ type: ")", value: ")" });
    expect(tokenizer.getNextToken()).toEqual({ type: ";", value: ";" });
    expect(tokenizer.getNextToken()).toEqual({ type: "{", value: "{" });
    expect(tokenizer.getNextToken()).toEqual({ type: "}", value: "}" });
    expect(tokenizer.getNextToken()).toEqual({ type: ",", value: "," });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize keywords", () => {
    tokenizer.init("let if else true false null while do for def return");
    expect(tokenizer.getNextToken()).toEqual({ type: "let", value: "let" });
    expect(tokenizer.getNextToken()).toEqual({ type: "if", value: "if" });
    expect(tokenizer.getNextToken()).toEqual({ type: "else", value: "else" });
    expect(tokenizer.getNextToken()).toEqual({ type: "true", value: "true" });
    expect(tokenizer.getNextToken()).toEqual({ type: "false", value: "false" });
    expect(tokenizer.getNextToken()).toEqual({ type: "null", value: "null" });
    expect(tokenizer.getNextToken()).toEqual({ type: "while", value: "while" });
    expect(tokenizer.getNextToken()).toEqual({ type: "do", value: "do" });
    expect(tokenizer.getNextToken()).toEqual({ type: "for", value: "for" });
    expect(tokenizer.getNextToken()).toEqual({ type: "def", value: "def" });
    expect(tokenizer.getNextToken()).toEqual({
      type: "return",
      value: "return",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize equality operators", () => {
    tokenizer.init("== !=");
    expect(tokenizer.getNextToken()).toEqual({
      type: "EqualityOperator",
      value: "==",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "EqualityOperator",
      value: "!=",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize assignment operators", () => {
    tokenizer.init("= += -= *= /=");
    expect(tokenizer.getNextToken()).toEqual({
      type: "SimpleAssignment",
      value: "=",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "ComplexAssignment",
      value: "+=",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "ComplexAssignment",
      value: "-=",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "ComplexAssignment",
      value: "*=",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "ComplexAssignment",
      value: "/=",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize math operators", () => {
    tokenizer.init("+ - * /");
    expect(tokenizer.getNextToken()).toEqual({
      type: "AdditiveOperator",
      value: "+",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "AdditiveOperator",
      value: "-",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "MultiplicativeOperator",
      value: "*",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "MultiplicativeOperator",
      value: "/",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize relational operators", () => {
    tokenizer.init("> < >= <=");
    expect(tokenizer.getNextToken()).toEqual({
      type: "RelationalOperator",
      value: ">",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "RelationalOperator",
      value: "<",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "RelationalOperator",
      value: ">=",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "RelationalOperator",
      value: "<=",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize logical operators", () => {
    tokenizer.init("&& || !");
    expect(tokenizer.getNextToken()).toEqual({
      type: "LogicalAnd",
      value: "&&",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "LogicalOr",
      value: "||",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "LogicalNot",
      value: "!",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize numbers", () => {
    tokenizer.init("42 1234567890");
    expect(tokenizer.getNextToken()).toEqual({ type: "NUMBER", value: "42" });
    expect(tokenizer.getNextToken()).toEqual({
      type: "NUMBER",
      value: "1234567890",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize strings", () => {
    tokenizer.init("\"hello\" 'world'");
    expect(tokenizer.getNextToken()).toEqual({
      type: "STRING",
      value: '"hello"',
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "STRING",
      value: "'world'",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });

  test("should tokenize identifiers", () => {
    tokenizer.init("x y variable_name");
    expect(tokenizer.getNextToken()).toEqual({
      type: "IDENTIFIER",
      value: "x",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "IDENTIFIER",
      value: "y",
    });
    expect(tokenizer.getNextToken()).toEqual({
      type: "IDENTIFIER",
      value: "variable_name",
    });
    expect(tokenizer.getNextToken()).toBeNull();
  });
});
