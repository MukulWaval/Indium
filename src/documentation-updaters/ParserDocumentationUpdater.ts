import * as path from "path";
import * as fs from "fs";

export class ParserDocumentationUpdater {
  private readonly sourcePath: string;
  private readonly destPath: string;

  /**
   * Constructor to initialize the paths for the source and destination files.
   * @param sourcePath The path to the source TypeScript file containing the parser documentation.
   * @param destPath The path to the destination markdown file where the documentation will be written.
   */
  constructor(
    sourcePath: string = path.posix.join(__dirname, ".", "Parser.ts"),
    destPath: string = path.posix.join(
      __dirname,
      "..",
      "documentation",
      "parser-documentation.md"
    )
  ) {
    this.sourcePath = sourcePath;
    this.destPath = destPath;
  }

  /**
   * Main method to update the parser documentation.
   */
  public update(): void {
    try {
      // Read the source code from the specified file
      const sourceCode = this.readFile(this.sourcePath);
      if (!sourceCode) return;

      // Extract EBNF style comments from the source code
      const comments = this.extractComments(sourceCode);

      // Strip formatting from the extracted comments
      const strippedComments = this.stripComments(comments);

      // Filter out comments that do not contain the expected format
      const filteredComments = this.filterComments(strippedComments);

      // Parse the cleaned-up comments into a structured grammar object
      const grammar = this.parseDocumentation(filteredComments);

      // Generate the final EBNF documentation based on the parsed grammar
      const documentation = this.generateDocumentation(grammar);

      // Write the generated documentation to the destination file
      this.writeFile(this.destPath, "```ebnf\n" + documentation + "\n```");
      console.log("Parser documentation updated successfully.");
    } catch (error) {
      console.error("Error updating parser documentation:", error);
    }
  }

  /**
   * Reads the content of a file synchronously.
   * @param filePath The path to the file to be read.
   * @returns The content of the file as a string or null if an error occurs.
   */
  private readFile(filePath: string): string | null {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return content;
    } catch (error) {
      console.error(`Error reading file from path: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Extracts EBNF style comments from the provided code.
   * @param code The source code to search for comments.
   * @returns An array of extracted comments.
   */
  private extractComments(code: string): string[] {
    const docCommentRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = code.match(docCommentRegex);
    return matches || [];
  }

  /**
   * Filters out comments that do not contain the expected format.
   * @param comments Array of comments to be filtered.
   * @returns An array of filtered comments.
   */
  private filterComments(comments: string[]): string[] {
    return comments.filter((comment) => comment.includes(" : "));
  }

  /**
   * Strips formatting from the extracted comments.
   * @param comments Array of formatted comments.
   * @returns An array of cleaned-up comments.
   */
  private stripComments(comments: string[]): string[] {
    return comments.map((comment) =>
      comment
        .replace(/^\/\*\*?/, "")
        .replace(/\*\/$/, "")
        .replace(/^\s*\* ?/gm, "")
        .trim()
    );
  }

  /**
   * Parses the cleaned-up comments into a structured grammar object.
   * @param lines Array of cleaned-up comments.
   * @returns An array of grammar objects.
   */
  private parseDocumentation(
    lines: string[]
  ): { name: string; contains: string[] }[] {
    return lines.map((line) => {
      const [namePart, containsPart] = line
        .split(":")
        .map((part) => part.trim());
      const name = namePart.split("*")[0].trim();
      const contains = containsPart
        .split("|")
        .map((part) => part.split("*")[0].trim().split("\n")[0]);
      return { name, contains };
    });
  }

  /**
   * Generates the final EBNF documentation based on the parsed grammar.
   * @param grammar Array of grammar objects.
   * @returns A string representing the EBNF documentation.
   */
  private generateDocumentation(
    grammar: { name: string; contains: string[] }[]
  ): string {
    let result = "";
    grammar.forEach((rule, index) => {
      if (index > 0) result += "\n\n";
      const indent = " ".repeat(rule.name.length);
      result += `${rule.name}: ${rule.contains[0]}`;
      for (let j = 1; j < rule.contains.length; j++) {
        result += `\n${indent}| ${rule.contains[j]}`;
      }
      result += ";";
    });

    return result;
  }

  /**
   * Writes the generated documentation to a file.
   * @param filePath The path to the file where the documentation will be written.
   * @param content The content to write to the file.
   */
  private writeFile(filePath: string, content: string): void {
    try {
      fs.writeFileSync(filePath, content);
    } catch (error) {
      console.error("Error writing to file:", error);
    }
  }
}

if (require.main === module) {
  const documentationUpdater = new ParserDocumentationUpdater();
  documentationUpdater.update();
}
