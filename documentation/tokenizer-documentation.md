```ebnf
Whitespace: spaces
          | tabs
          | newlines;

SingleLineComments: '//' ~[\n]* '\n';

MultiLineComments: '/*' ~['*']*
                 | '/*' ~['*']* '*' ~['/']*
                 | '/*' ~['*']* *' * '/*' ~['*']*
                 | '/*' ~['*']* '*' ~['/']* *' ~['** '*' *'/'];

Semicolon: ';';

OpenBrace: '{';

CloseBrace: '}';

OpenParen: '(';

CloseParen: ')';

Comma: ',';

Keywords: 'let'
        | 'if'
        | 'else'
        | 'true'
        | 'false'
        | 'null'
        | 'while'
        | 'do'
        | 'for'
        | 'def'
        | 'return';

EqualityOperator: '=='
                | '!=';

SimpleAssignment: '=';

ComplexAssignment: '+='
                 | '-='
                 | '*='
                 | '/=';

AdditiveOperator: '+'
                | '-';

MultiplicativeOperator: '*'
                      | '/';

RelationalOperator: '<'
                  | '>'
                  | '<='
                  | '>=';

LogicalAnd: '&&';

LogicalOr: 'PipePipe';

LogicalNot: '!';

Number: [0-9]+;

String: '"' ~["]* '"'
      | "'" ~[']* "'";

Identifier: [a-zA-Z_][a-zA-Z0-9_]*;
```