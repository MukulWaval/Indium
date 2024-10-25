const { Tokenizer } = require("../src/Tokenizer");

describe("Tokenizer", () => {
  describe("Initialization", () => {
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

  describe("Token Types", () => {
    let tokenizer;

    beforeEach(() => {
      tokenizer = new Tokenizer();
    });

    describe("Comments", () => {
      test("should handle whitespace and comments (skipped tokens)", () => {
        tokenizer.init("   // comment \n /* block comment */");
        expect(tokenizer.getNextToken()).toBeNull();
      });
    });

    describe("Symbols and Delimeters", () => {
      test("should tokenize symbol '('", () => {
        tokenizer.init("(");
        expect(tokenizer.getNextToken()).toEqual({ type: "(", value: "(" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize symbol ')'", () => {
        tokenizer.init(")");
        expect(tokenizer.getNextToken()).toEqual({ type: ")", value: ")" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize symbol '{'", () => {
        tokenizer.init("{");
        expect(tokenizer.getNextToken()).toEqual({ type: "{", value: "{" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize symbol '}'", () => {
        tokenizer.init("}");
        expect(tokenizer.getNextToken()).toEqual({ type: "}", value: "}" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize delimeter ';'", () => {
        tokenizer.init(";");
        expect(tokenizer.getNextToken()).toEqual({ type: ";", value: ";" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize delimeter','", () => {
        tokenizer.init(",");
        expect(tokenizer.getNextToken()).toEqual({ type: ",", value: "," });
        expect(tokenizer.getNextToken()).toBeNull();
      });
    });

    describe("Keywords", () => {
      test("should tokenize keyword 'let'", () => {
        tokenizer.init("let");
        expect(tokenizer.getNextToken()).toEqual({ type: "let", value: "let" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'if'", () => {
        tokenizer.init("if");
        expect(tokenizer.getNextToken()).toEqual({ type: "if", value: "if" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'else'", () => {
        tokenizer.init("else");
        expect(tokenizer.getNextToken()).toEqual({
          type: "else",
          value: "else",
        });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'true'", () => {
        tokenizer.init("true");
        expect(tokenizer.getNextToken()).toEqual({
          type: "true",
          value: "true",
        });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'false'", () => {
        tokenizer.init("false");
        expect(tokenizer.getNextToken()).toEqual({
          type: "false",
          value: "false",
        });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'null'", () => {
        tokenizer.init("null");
        expect(tokenizer.getNextToken()).toEqual({
          type: "null",
          value: "null",
        });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'while'", () => {
        tokenizer.init("while");
        expect(tokenizer.getNextToken()).toEqual({
          type: "while",
          value: "while",
        });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'do'", () => {
        tokenizer.init("do");
        expect(tokenizer.getNextToken()).toEqual({ type: "do", value: "do" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'for'", () => {
        tokenizer.init("for");
        expect(tokenizer.getNextToken()).toEqual({ type: "for", value: "for" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'def'", () => {
        tokenizer.init("def");
        expect(tokenizer.getNextToken()).toEqual({ type: "def", value: "def" });
        expect(tokenizer.getNextToken()).toBeNull();
      });

      test("should tokenize keyword 'return'", () => {
        tokenizer.init("return");
        expect(tokenizer.getNextToken()).toEqual({
          type: "return",
          value: "return",
        });
        expect(tokenizer.getNextToken()).toBeNull();
      });
    });

    describe("Operators", () => {
      describe("Equality Operators", () => {
        test("should tokenize equality operator '=='", () => {
          tokenizer.init("==");
          expect(tokenizer.getNextToken()).toEqual({
            type: "EqualityOperator",
            value: "==",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize equality operator '!='", () => {
          tokenizer.init("!=");
          expect(tokenizer.getNextToken()).toEqual({
            type: "EqualityOperator",
            value: "!=",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });
      });

      describe("Assignment Operator", () => {
        test("should tokenize assignment operator '='", () => {
          tokenizer.init("=");
          expect(tokenizer.getNextToken()).toEqual({
            type: "SimpleAssignment",
            value: "=",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize assignment operator '+='", () => {
          tokenizer.init("+=");
          expect(tokenizer.getNextToken()).toEqual({
            type: "ComplexAssignment",
            value: "+=",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize assignment operator '-='", () => {
          tokenizer.init("-=");
          expect(tokenizer.getNextToken()).toEqual({
            type: "ComplexAssignment",
            value: "-=",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize assignment operator '*='", () => {
          tokenizer.init("*=");
          expect(tokenizer.getNextToken()).toEqual({
            type: "ComplexAssignment",
            value: "*=",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize assignment operator '/='", () => {
          tokenizer.init("/=");
          expect(tokenizer.getNextToken()).toEqual({
            type: "ComplexAssignment",
            value: "/=",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });
      });

      describe("Math Operators", () => {
        test("should tokenize math operator '+'", () => {
          tokenizer.init("+");
          expect(tokenizer.getNextToken()).toEqual({
            type: "AdditiveOperator",
            value: "+",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize math operator '-'", () => {
          tokenizer.init("-");
          expect(tokenizer.getNextToken()).toEqual({
            type: "AdditiveOperator",
            value: "-",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize math operator '*'", () => {
          tokenizer.init("*");
          expect(tokenizer.getNextToken()).toEqual({
            type: "MultiplicativeOperator",
            value: "*",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });

        test("should tokenize math operator '/'", () => {
          tokenizer.init("/");
          expect(tokenizer.getNextToken()).toEqual({
            type: "MultiplicativeOperator",
            value: "/",
          });
          expect(tokenizer.getNextToken()).toBeNull();
        });
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
});
