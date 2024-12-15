import * as path from "path";
import * as fs from "fs";

export class GrammarUpdater {
  private _sourcePath: string;
  private _destPath: string;
  private _secondPath: string;

  constructor(
    sourcePath: string,
    destPath: string,
    secondPath: string = path.posix.join(
      __dirname,
      "..",
      "grammar",
      "grammar.md"
    )
  ) {
    this._sourcePath = sourcePath;
    this._destPath = destPath;
    this._secondPath = secondPath;
  }

  public Update(): void {
    const source: string | null = this._readFile(this._sourcePath);
    const comments: string[] = this._extractComments(source || "");
    const stripedComments: string[] = this._stripComments(comments);
    const filteredComments: string[] = this._filterComments(stripedComments);
    const grammar: { name: string; contains: string[] }[] =
      this._parseGrammar(filteredComments);
    const documentation: string = this._generateDocumentation(grammar);
    const docSource: string | null = this._readFile(this._destPath);
    const finalDocumentation: string = this._replaceOldDoc(
      docSource || "",
      documentation
    );
    this._writeToFile(this._destPath, finalDocumentation);
    console.log("\nGrammar updated successfully.");
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
    this._writeToFile(this._secondPath, "```ebnf\n" + result + "\n```");
    return result;
  }

  private _replaceOldDoc(inputString: string, newContent: string): string {
    const startMarker: string = "<!-- GrammarStart -->" + "\n```ebnf";
    const endMarker: string = "```\n" + "<!-- GrammarEnd -->";
    const startIndex: number = inputString.indexOf(startMarker);
    if (startIndex === -1) {
      throw new Error(`Start marker "${startMarker}" not found.`);
    }
    const endIndex: number = inputString.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      throw new Error(`End marker "${endMarker}" not found.`);
    }
    const beforeSection: string = inputString.substring(
      0,
      startIndex + startMarker.length
    );
    const afterSection: string = inputString.substring(endIndex);
    const resultString: string =
      beforeSection + "\n" + newContent + "\n" + afterSection;
    return resultString;
  }

  private _writeToFile(path: string, content: string): void {
    try {
      fs.writeFileSync(path, content);
    } catch (error) {
      console.error(error);
    }
  }
}
