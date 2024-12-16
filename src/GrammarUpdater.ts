import * as path from "path";
import * as fs from "fs";

export class GrammarUpdater {
  private _sourcePath: string;
  private _destPath: string;

  constructor(
    sourcePath: string = path.posix.join(__dirname, ".", "Parser.ts"),
    destPath: string = path.posix.join(__dirname, "..", "grammar", "grammar.md")
  ) {
    this._sourcePath = sourcePath;
    this._destPath = destPath;
  }

  public Update(): void {
    try {
      const source: string | null = this._readFile(this._sourcePath);
      const comments: string[] = this._extractComments(source || "");
      const stripedComments: string[] = this._stripComments(comments);
      const filteredComments: string[] = this._filterComments(stripedComments);
      const grammar: { name: string; contains: string[] }[] =
        this._parseGrammar(filteredComments);
      const documentation: string = this._generateDocumentation(grammar);
      this._writeToFile(this._destPath, "```ebnf\n" + documentation + "\n```");
      console.log("Grammar updated successfully.");
    } catch (error) {
      console.error("Error updating grammar:", error);
    }
  }

  private _readFile(path: string): string | null {
    try {
      const content: string = fs.readFileSync(path, "utf8");
      return content;
    } catch (err) {
      console.error(`Error reading file from path: ${path}`);
      console.error(err);
      return null;
    }
  }

  private _extractComments(inputString: string): string[] {
    const docCommentRegex: RegExp = /\/\*\*[\s\S]*?\*\//g;
    const matches: string[] | null = inputString.match(docCommentRegex);
    return matches || [];
  }

  private _filterComments(input: string[]): string[] {
    return input.filter((line: string) => line.includes(" : "));
  }

  private _stripComments(comments: string[]): string[] {
    return comments.map((comment: string) => {
      return comment
        .replace(/^\/\*\*?/, "")
        .replace(/\*\/$/, "")
        .replace(/^\s*\* ?/gm, "")
        .trim();
    });
  }

  private _parseGrammar(
    inputStrings: string[]
  ): { name: string; contains: string[] }[] {
    return inputStrings.map((str: string) => {
      let [namePart, containsPart]: string[] = str
        .split(":")
        .map((part: string) => part.trim());
      let name: string = namePart.split("*")[0].trim();
      let contains: string[] = containsPart.split("|").map((part: string) => {
        return part.split("*")[0].trim().split("\n")[0];
      });
      return {
        name: name,
        contains: contains,
      };
    });
  }

  private _generateDocumentation(
    grammar: { name: string; contains: string[] }[]
  ): string {
    let result: string = "";
    grammar.forEach((rule, i) => {
      result += i !== 0 ? "\n\n" : "";
      const indent: string = " ".repeat(rule.name.length);
      result += rule.name + ": " + rule.contains[0];
      for (let j = 1; j < rule.contains.length; j++) {
        result += "\n" + indent + "| " + rule.contains[j];
      }
      result += ";";
    });
    this._writeToFile(this._destPath, "```ebnf\n" + result + "\n```");
    return result;
  }

  private _writeToFile(path: string, content: string): void {
    try {
      fs.writeFileSync(path, content);
    } catch (error) {
      console.error(error);
    }
  }
}

if (require.main === module) {
  const grammarUpdater = new GrammarUpdater();
  grammarUpdater.Update();
}
