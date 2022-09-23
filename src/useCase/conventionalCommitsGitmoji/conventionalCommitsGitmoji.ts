import {
  Input,
  prompt,
  Select,
} from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";
import * as gitmoji from "../../externalInterface/gitmoji.ts";
import * as grammar from "../../externalInterface/grammar.ts";
import * as gitHub from "../../externalInterface/gitHub.ts";
import * as translator from "../../service/translator.ts";
import * as templateService from "../../service/template.ts";
import * as git from "../../externalInterface/git.ts";
import * as terminal from "../../userInterface/terminal.ts";
import * as util from "./util.ts";

const initialize = async () => {
  const [gitmojis, issues] = await Promise.all([
    gitmoji.fetchGitmojis(),
    gitHub.fetchIssues(),
  ]);

  class State {
    constructor(public value: string) {}
  }

  return { gitmojis, issues, state: new State("") };
};

const main = async (p: { template: string }) => {
  const { gitmojis, issues, state } = await initialize();
  state.value = p.template;

  return prompt([
    {
      name: "type",
      message: "Select a type.",
      type: Select,
      options: [
        { name: "xxx: No release", value: "xxx" },
        { name: "xxo: Patch", value: "xxo" },
        { name: "xox: Minor", value: "xox" },
        { name: "oxx: Major", value: "oxx" },
      ],
      search: true,
      before: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        });

        terminal.render({
          value: templateService.cleanTemplate({
            template: state.value,
            name: "type",
          }),
        });

        await next();
      },
    },
    {
      name: "gitmoji",
      message: "Select a gitmoji.",
      type: Select,
      options: gitmojis,
      search: true,
      before: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        });

        terminal.render({
          value: templateService.cleanTemplate({
            template: state.value,
            name: "gitmoji",
          }),
        });

        await next();
      },
    },
    {
      name: "subject",
      message: "Enter subject.",
      type: Input,
      hint:
        "Surrounding it with an ` allows it. example: Add myFunc -> Add `myFunc`",
      validate: (input) => {
        if (!input) {
          return true;
        }

        return grammar.grammarCheck({
          txt: input,
          grammarAuthKey: Deno.env.get("GRAMMAR_API_KEY") || "",
        })
          .then(async (v) => {
            if (!v) {
              return v;
            }

            const r = await translator.translate({
              messages: v,
              translate: {
                targetLang: Deno.env.get("DEEPL_TARGET_LANG"),
                authKey: Deno.env.get("DEEPL_AUTH_KEY"),
              },
            });
            return r;
          })
          .then((r) => {
            if (util.subject.isValid(r)) {
              return true;
            }
            // TODO 調整
            console.error(util.subject.fmt(r));
            // error
            return "";
          });
      },
      before: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        });

        terminal.render({
          value: templateService.cleanTemplate({
            template: state.value,
            name: "subject",
          }),
        });

        await next();
      },
    },
    {
      name: "issue",
      message: "Select a issue.",
      type: Select,
      options: [{ name: "Not selected", value: "_" }, ...issues],
      search: true,
      before: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        });
        terminal.render({
          value: templateService.cleanTemplate({
            template: state.value,
            name: "issue",
          }),
        });
        await next();
      },
      after: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        })
          .replace(
            / Close #_\r?\n/,
            "\n",
          ).trim();

        await next();
      },
    },
    {
      name: "body",
      message: "Enter body.",
      type: Input,
      before: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        });

        terminal.render({
          value: templateService.cleanTemplate({
            template: state.value,
            name: "body",
          }),
        });
        await next();
      },
      after: async (keyValue, next) => {
        state.value = templateService.fillInTemplate({
          template: state.value,
          keyValue,
        })
          .trim()
          .trim();

        await next();
      },
    },
  ]).then(() => state.value).catch((e) => {
    console.error(e);
    return "";
  });
};

export const run = () => {
  const template = `{{type}}: {{gitmoji}} {{subject}} Close #{{issue}}

{{body}}`;

  main({ template }).then((v) => git.setCommitMessage({ message: v }));
};
