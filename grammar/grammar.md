```ebnf
Program: StatementList;

StatementList: Statement
             | StatementList;

Statement: ExpressionStatement
         | BlockStatement
         | EmptyStatement
         | VariableStatement
         | IfStatement
         | IterationStatement
         | FunctionDeclaration
         | ReturnStatement;

FunctionDeclaration: 'def' Identifier '(' OptFormalParameterList ')' BlockStatement;

FormalParameterList: Identifier
                   | FormalParameterList ',' Identifier;

ReturnStatement: 'return' OptExpression ';';

IterationStatement: WhileStatement
                  | DoWhileStatement
                  | ForStatement;

WhileStatement: 'while' '(' Expression ')' Statement;

DoWhileStatement: 'do' Statement 'while' '(' Expression ')' ';';

ForStatement: 'for' '(' OptForStatement ';' OptExpression ';' OptExpression ')' Statement;

ForStatementInit: VariableStatementInit
                | Expression;

IfStatement: 'if' '(' Expression ')' Statement
           | 'if' '(' Expression ')' Statement 'else' Statement;

VariableStatementInit: 'let' VariableDeclarationList;

VariableStatement: 'let' VarialbleDeclarationList ';';

VarialbleDeclarationList: VarialbleDeclaration
                        | VarialbleDeclarationList ',' VarialbleDeclaration;

VariableDeclaration: Identifier OptVariableInitializer;

VariableInitializer: SimpleAssignment AssignmentExpression;

BlockStatement: '{' OptStatementList '}';

ExpressionStatement: Expression ';';

Expression: AssignmentExpression;

AssignmentExpression: LogicalOrExpression
                    | LeftHandSideExpression AssignmentOperator AssignmentExpression;

EqualityExpression: RelationalExpression EqualityOperator RelationalExpression
                  | RelationalExpression;

RelationalExpression: AdditiveExpression
                    | AdditiveExpression RelationalOperator RelationalExpression;

LeftHandSideExpression: Identifier;

Identifier: IDENTIFIER;

AssignmentOperator: SimpleAssignment
                  | ComplenxAssignment;

LogicalAndExpression: EqualityExpression LogicalAnd LogicalAndExpression
                    | EqualityExpression;

LogicalOrExpression: LogicalAndExpression LogicalOr LogicalOrExpression
                   | LogicalAndExpression;

AdditiveExpression: MultiplicativeExpression
                  | AdditiveExpression AdditiveOperator MultiplicativeExpression;

MultiplicativeExpression: UnaryExpression
                        | MultiplicativeExpression UnaryExpression PrimaryExpression;

UnaryExpression: LeftHandSideExpression
               | AdditiveOperator UnaryExpression
               | LogicalNot UnaryExpression;

PrimaryExpression: Literal
                 | ParenthesizedExpression
                 | Identifier;

ParenthesizedExpression: '(' Expression ')';

Literal: NumericLiteral
       | StringLiteral
       | BooleanLiteral
       | NullLiteral;

BooleanLiteral: 'true'
              | 'false';

NullLiteral: 'null';

StringLiteral: STRING;

NumericLiteral: NUMBER;
```