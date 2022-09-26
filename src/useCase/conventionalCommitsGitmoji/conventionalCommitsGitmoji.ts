import {
  Input,
  prompt,
  Select,
  SelectOptions,
} from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";
import * as gitmoji from "../../externalInterface/gitmoji.ts";
import * as grammar from "../../externalInterface/grammar.ts";
import * as gitHub from "../../externalInterface/gitHub.ts";
import * as translator from "../../service/translator.ts";
import * as templateService from "../../service/template.ts";
import * as terminal from "../../userInterface/terminal.ts";
import * as util from "./util.ts";

const initialize = async (
  p: {
    template: string;
    borderColorSetter: terminal.BorderColorSetter;
    targetHighlighter: templateService.TargetHighlighter;
  },
) => {
  const [issues] = await Promise.all([
    gitHub.fetchIssues(),
  ]);

  return {
    issues,
    templateRender: terminal.createTemplateRender({
      borderColorSetter: p.borderColorSetter,
    }),
    prepareTemplate: templateService.prepareTemplate({
      highlighter: p.targetHighlighter,
    }),
    state: new class {
      constructor(public template: string) {}
    }(p.template),
  };
};

export const main = async (
  p: {
    template: string;
    type: {
      options: SelectOptions["options"];
    };
    scope: {
      options: SelectOptions["options"];
    };
    targetHighlighter: templateService.TargetHighlighter;
    borderColorSetter: terminal.BorderColorSetter;
  },
) => {
  console.clear();
  terminal.sp.start("initialize...");

  const { issues, state, templateRender, prepareTemplate } = await initialize(
    {
      template: p.template,
      borderColorSetter: p.borderColorSetter,
      targetHighlighter: p.targetHighlighter,
    },
  );
  terminal.sp.succeed();

  return prompt([
    {
      name: "type",
      message: "Select a type.",
      type: Select,
      options: p.type.options,
      search: true,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        templateRender({
          value: prepareTemplate({
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
      options: p.scope.options,
      search: true,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        templateRender({
          value: prepareTemplate({
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

        templateRender({
          value: prepareTemplate({
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
        terminal.sp.start("Submitting...");

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

            state.template = templateService.templateFillIn({
              template: state.template,
              answerVo: {},
            });
            templateRender({
              value: prepareTemplate({
                template: state.template,
                name: "subject",
              }),
            });

            console.error(util.subject.fmt(r));

            // error
            return "";
          }).finally(() => {
            terminal.sp.stop();
          });
      },
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        templateRender({
          value: prepareTemplate({
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
      options: [
        { name: "Not selected", value: "_" },
        terminal.separator,
        ...issues,
      ],
      search: true,
      before: async (answerVo, next) => {
        state.template = templateService.templateFillIn({
          template: state.template,
          answerVo,
        });

        templateRender({
          value: prepareTemplate({
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
        templateRender({
          value: prepareTemplate({
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
        templateRender({
          value: prepareTemplate({
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
