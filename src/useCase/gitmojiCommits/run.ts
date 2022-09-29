import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";
import * as git from "~/src/externalInterface/git.ts";
import * as validation from "~/src/util/validation.ts";
import * as translator from "~/src/util/translator.ts";
import * as gitmojis from "~/src/util/gitmojis.ts";
import * as gitHub from "~/src/externalInterface/gitHub.ts";
import * as terminal from "~/src/userInterface/terminal.ts";
import { main, Validate } from "./gitmojiCommits.ts";

terminal.spinner.start({ text: "initialize..." });
const issues = await gitHub.fetchIssues()
  .then((v) => (
    v.map((vv) => ({
      name: `#${vv.number}
   ${colors.green.bold("title:")} ${vv.title}
   ${colors.green.bold("body:")} ${vv.body}`,
      value: `#${vv.number}`,
    }))
  ))
  .then((r) =>
    r.map((v) => ({
      ...v,
      value: `Close ${v.value}`,
    }))
  ).then((r) => {
    return [
      { name: "Not selected", value: "Not selected" },
      { name: "---------------------------------", value: "", disabled: true },
      ...r,
    ];
  })
  .finally(
    terminal.spinner.stop,
  );

const validate: Validate = (input) => {
  return validation.validateGrammar({
    input,
    grammarAuthKey: Deno.env.get("GRAMMAR_API_KEY"),
  })
    .then(async (r) => {
      if (r.type === "valid") {
        return r;
      }

      const translated = await translator.translate({
        messages: r.reason,
        translate: {
          targetLang: Deno.env.get("DEEPL_TARGET_LANG"),
          authKey: Deno.env.get("DEEPL_AUTH_KEY"),
        },
      });

      if (translated.length === 0) {
        return { type: "valid" } as const;
      }

      return {
        type: "error",
        reason: translated,
      } as const;
    })
    .catch((e) => {
      console.error(e);
      // It can't be helped
      return { type: "valid" } as const;
    });
};

main({
  userInterFace: {
    targetHighlighter: colors.bold.bgGreen,
    borderColorSetter: colors.green.bold,
    template: `{{gitmoji}}: {{subject}} {{issue}}
  
{{body}}`,
  },
  question: {
    gitmoji: {
      options: gitmojis.gitmojis,
    },
    subject: {
      validate: (input) => {
        if (input.length === 0) {
          return Promise.resolve({ type: "error", reason: "🖕🖕🖕🖕🖕" } as const);
        }
        return validate(input);
      },
    },
    issues: {
      options: issues,
    },
    body: {
      validate: (input) => {
        if (input.length === 0) {
          return Promise.resolve({ type: "valid" } as const);
        }
        return validate(input);
      },
    },
  },
})
  .then((v) => git.setCommitMessage({ message: v }))
  .catch(console.error);
