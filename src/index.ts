import path = require("path");
import { ParserDocumentationUpdater } from "./documentation-updaters/ParserDocumentationUpdater";
import { TokenizerDocumentationUpdater } from "./documentation-updaters/TokenizerDocumentationUpdate";

const parserDocumentationUpdaterupdater = new ParserDocumentationUpdater(
  path.posix.join(__dirname, "..", "src", "Parser.ts"),
  path.posix.join(__dirname, "..", "documentation", "parser-documentation.md")
);
parserDocumentationUpdaterupdater.update();

const tokenizerDocumentationUpdater = new TokenizerDocumentationUpdater(
  path.posix.join(__dirname, "..", "src", "Tokenizer.ts"),
  path.posix.join(
    __dirname,
    "..",
    "documentation",
    "tokenizer-documentation.md"
  )
);
tokenizerDocumentationUpdater.update();
