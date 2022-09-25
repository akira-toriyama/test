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
import Kia from "https://deno.land/x/kia@0.4.1/mod.ts";

const initialize = async (p: { template: string }) => {
  const [issues] = await Promise.all([
    gitHub.fetchIssues(),
  ]);
  class State {
    constructor(public template: string) {}
  }
  const state = new State(p.template);
  return { issues, state };
};

const main = async (p: { template: string }) => {
  console.clear();
  const kia2 = new Kia();
  kia2.start("initialize...");
  const { issues, state } = await initialize({
    template: p.template,
  });
  kia2.succeed("initialize...");

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
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "type",
          }),
        });

        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });
        await next();
      },
    },
    {
      name: "scope",
      message: "Select a scope.",
      type: Select,
      options: [
        { name: "Not selected", value: "_" },
        { name: "aaa", value: "aaa" },
        { name: "bbb: Major", value: "bbb" },
      ],
      search: true,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "scope",
          }),
        });

        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        // カスタム
        state.template = state.template.replace(
          "(_)",
          "",
        ).trim();
        await next();
      },
    },
    {
      name: "gitmoji",
      message: "Select a gitmoji.",
      type: Select,
      options: gitmoji.getGitmojis(),
      search: true,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "gitmoji",
          }),
        });

        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
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

        console.clear();
        const kia = new Kia();
        kia.start("Submitting...");

        return grammar.grammarCheck({
          txt: input,
          grammarAuthKey: Deno.env.get("GRAMMAR_API_KEY"),
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
            console.clear();
            console.error(util.subject.fmt(r));

            kia.fail("xxx");
            // error
            return "";
          });
      },
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "subject",
          }),
        });

        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
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
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "issue",
          }),
        });

        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        // カスタム
        state.template = state.template.replace(
          / Close #_/,
          "",
        ).trim();

        await next();
      },
    },
    {
      name: "body",
      message: "Enter body.",
      type: Input,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });
        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "body",
          }),
        });
        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        // カスタム
        state.template = state.template.replace(/\r?\n{2,}/, "\n\n").trim();
        await next();
      },
    },
    {
      name: "breakingChange",
      message: "Enter breakingChange.",
      type: Input,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });
        terminal.render({
          value: templateService.templateHighlight({
            template: state.template,
            name: "breakingChange",
          }),
        });
        await next();
      },
      after: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        // カスタム-
        state.template = state.template.replace(/BREAKING CHANGE: $/, "")
          .trim();
        await next();
      },
    },
  ])
    .then(() => state.template)
    .catch((e) => {
      console.error(e);
      return "";
    });
};

export const run = () => {
  const template =
    `{{type}}({{scope}}): {{gitmoji}} {{subject}} Close #{{issue}}

{{body}}
BREAKING CHANGE: {{breakingChange}}`;

  main({ template })
    .then((v) => git.setCommitMessage({ message: v }))
    .catch(console.error);
};
