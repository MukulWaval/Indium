const path = require("path");

class GrammerUpdater {
  constructor(
    sourcePath,
    destPath,
    secondPath = path.posix.join(__dirname, "..", "grammar", "grammar.md")
  ) {
    this._sourcePath = sourcePath;
    this._destPath = destPath;
    this._secondPath = secondPath;
  }

  Update() {
    const source = this._readFile(this._sourcePath);
    const comments = this._extractComments(source);
    const stripedComments = this._stripComments(comments);
    const filteredComments = this._filterComments(stripedComments);
    const grammar = this._parseGrammer(filteredComments);
    const documentation = this._generateDocumentation(grammar);
    const docSource = this._readFile(this._destPath);
    const finalDocumentation = this._replaceOldDoc(docSource, documentation);
    this._writeToFile(this._destPath, finalDocumentation);
    console.log("\nGrammar updated successfully.");
  }

  _readFile(path) {
    const fs = require("fs");
    try {
      const content = fs.readFileSync(path, "utf8");
      return content;
    } catch (err) {
      console.error(`Error reading file from path: ${path}`);
      console.error(err);
      return null;
    }
  }

  _extractComments(inputString) {
    const docCommentRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = inputString.match(docCommentRegex);
    return matches || [];
  }

  _filterComments(input) {
    return input.filter((line) => line.includes(" : "));
  }

  _stripComments(comments) {
    return comments.map((comment) => {
      return comment
        .replace(/^\/\*\*?/, "")
        .replace(/\*\/$/, "")
        .replace(/^\s*\* ?/gm, "")
        .trim();
    });
  }

  _parseGrammer(inputStrings) {
    return inputStrings.map((str) => {
      let [namePart, containsPart] = str.split(":").map((part) => part.trim());
      let name = namePart.split("*")[0].trim();
      let contains = containsPart.split("|").map((part) => {
        return part.split("*")[0].trim().split("\n")[0];
      });
      return {
        name: name,
        contains: contains,
      };
    });
  }

  _generateDocumentation(grammar) {
    var result = "";
    grammar.forEach(function (rule, i) {
      result += i != 0 ? "\n\n" : "";
      const indent = " ".repeat(rule.name.length);
      result += rule.name + ": " + rule.contains[0];
      for (var j = 1; j < rule.contains.length; j++) {
        result += "\n" + indent + "| " + rule.contains[j];
      }
      result += ";";
    });
    this._writeToFile(this._secondPath, "```ebnf\n" + result + "\n```");
    return result;
  }

  _replaceOldDoc(inputString, newContent) {
    const startMarker = "<!-- GrammarStart -->" + "\n```ebnf";
    const endMarker = "```\n" + "<!-- GrammarEnd -->";
    const startIndex = inputString.indexOf(startMarker);
    if (startIndex === -1) {
      throw new Error(`Start marker "${startMarker}" not found.`);
    }
    const endIndex = inputString.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      throw new Error(`End marker "${endMarker}" not found.`);
    }
    const beforeSection = inputString.substring(
      0,
      startIndex + startMarker.length
    );
    const afterSection = inputString.substring(endIndex);
    const resultString =
      beforeSection + "\n" + newContent + "\n" + afterSection;
    return resultString;
  }

  _writeToFile(path, content) {
    const fs = require("fs");
    try {
      fs.writeFileSync(path, content);
    } catch (error) {
      console.error(error);
    }
  }
}
module.exports = {
  GrammerUpdater,
};
