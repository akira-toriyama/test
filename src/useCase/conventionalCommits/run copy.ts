import { main } from "./conventionalCommits.ts";
import * as git from "../../externalInterface/git.ts";
import * as terminal from "../../userInterface/terminal.ts";
import * as validation from "../../service/validation.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

main({
  userInterFace: {
    targetHighlighter: colors.bold.bgGreen,
    borderColorSetter: colors.green.bold,
    template: `{{type}}({{scope}}): {{subject}} Close #{{issue}}
  
{{body}}
BREAKING CHANGE: {{breakingChange}}`,
  },
  question: {
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
    subject: {
      validate: (input) =>
        validation.validateGrammar({
          input,
          grammarAuthKey: Deno.env.get("GRAMMAR_API_KEY") || "",
        })
          .catch((e) => {
            console.error(e);
            // It can't be helped
            return { type: "valid" } as const;
          }),
    },
  },
})
  .then((v) => git.setCommitMessage({ message: v }))
  .catch(console.error);

// TODO 各項目のバリデーションも
// body と BREAKING CHANGE にも 翻訳
