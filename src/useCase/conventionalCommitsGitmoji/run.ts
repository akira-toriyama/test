import { main } from "./conventionalCommitsGitmoji.ts";
import * as git from "../../externalInterface/git.ts";
import * as terminal from "../../userInterface/terminal.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

main({
  template: `{{type}}({{scope}}): {{subject}} Close #{{issue}}

{{body}}
BREAKING CHANGE: {{breakingChange}}`,
  type: {
    options: [
      { name: "xxx: No release", value: "xxx" },
      terminal.separator,
      { name: "xxo: Patch", value: "xxo" },
      { name: "xox: Minor", value: "xox" },
      { name: "oxx: Major", value: "oxx" },
    ],
  },
  scope: {
    options: [
      { name: "Not selected", value: "_" },
      terminal.separator,
      { name: "aaa", value: "aaa" },
      { name: "bbb: Major", value: "bbb" },
    ],
  },
  targetHighlighter: colors.bold.bgGreen,
  borderColorSetter: colors.green.bold,
})
  .then((v) => git.setCommitMessage({ message: v }))
  .catch(console.error);

// TODO 各項目のバリデーションも
