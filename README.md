# Indium 🧪💻

Welcome to **Indium**! Indium is a cutting-edge programming language designed to make development easier, faster, and more enjoyable. This repository contains the Indium compiler and all the necessary tools to get you started with this exciting new language. Let's dive in!

## Features ✨

- **Easy-to-Use Syntax**: Indium boasts a clean and intuitive syntax that makes coding a breeze.
- **Powerful Parsing and Tokenizing**: With robust parsing and tokenizing capabilities, Indium ensures your code is processed efficiently.
- **Automated Documentation**: Keep your grammar documentation up-to-date effortlessly with our `DocUpdater` tool.
- **Comprehensive Testing**: Our extensive testing framework ensures your code is reliable and bug-free.

## Getting Started 🚀

To start using Indium, follow these simple steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MukulWaval/Indium.git
   ```
2. **Navigate to the project directory**:
  ```bash
  cd indium
  ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Run the tests**:
   ```bash
   npm test
   ```
## Project Structure 🗂️
Here’s a brief overview of the key components in the Indium project:
 
## Grammar 📚
<!-- GrammarStart -->
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
<!-- GrammarEnd -->

## Contributing 🤝
We welcome contributions! If you’d like to contribute to Indium, please fork the repository and submit a pull request. Be sure to follow our contribution guidelines.

## License 📄
This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact ✉️
For any questions or suggestions, feel free to open an issue or reach out to us directly.

---
Happy coding with Indium! 🎉💻🚀
