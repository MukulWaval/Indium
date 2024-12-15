import path = require("path");
import { GrammarUpdater } from "./GrammarUpdater";

const updater = new GrammarUpdater(
  path.posix.join(__dirname, "..", "src", "Parser.ts"),
  path.posix.join(__dirname, "..", "README.md"),
  path.posix.join(__dirname, "..", "grammar", "grammar.md")
);

updater.Update();
