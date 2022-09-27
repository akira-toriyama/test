import { main, Validate } from "./gitmojiCommits.ts";
import * as git from "../../externalInterface/git.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";
import * as validation from "../../util/validation.ts";
import * as translator from "../../util/translator.ts";
import * as gitmojis from "../../util/gitmojis.ts";

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
    template: `{{gitmoji}} {{subject}}
  
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
