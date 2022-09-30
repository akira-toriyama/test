import { colors } from "../../deps.ts";
import * as git from "../../externalInterface/git.ts";
import * as validation from "../../util/validation.ts";
import * as translator from "../../util/translator.ts";
import * as gitmojis from "../../util/gitmojis.ts";
import * as gitHub from "../../externalInterface/gitHub.ts";
import * as terminal from "../../userInterface/terminal.ts";
import { main, Validate } from "./gitmojiCommits.ts";
import { notify } from "../../externalInterface/notification.ts";

terminal.spinner.start({ text: "initialize..." });

const env = {
  grammarApiKey: Deno.env.get("GRAMMAR_API_KEY"),
  deeplTargetLang: Deno.env.get("DEEPL_TARGET_LANG"),
  deeplAuthKey: Deno.env.get("DEEPL_AUTH_KEY"),
} as const;

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
  ).then((r) => [
    { name: "Not selected", value: "Not selected" },
    {
      name: "---------------------------------",
      value: "",
      disabled: true,
    },
    ...r,
  ])
  .finally(
    terminal.spinner.stop,
  );

const validate: Validate = (input) =>
  validation.validateGrammar({
    input,
    grammarApiKey: env.grammarApiKey,
  })
    .then(async (r) => {
      if (r.type === "valid") {
        return r;
      }

      const translated = await translator.translate({
        messages: r.reason,
        translate: {
          deeplTargetLang: env.deeplTargetLang,
          deeplAuthKey: env.deeplAuthKey,
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
      notify({ title: "validate", message: e });
      console.error(e);
      // It can't be helped
      return { type: "valid" } as const;
    });

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
          return Promise.resolve(
            { type: "error", reason: "Please enter" } as const,
          );
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
  .catch((e) => {
    notify({ title: "run", message: e });
    console.log(e);
  });
