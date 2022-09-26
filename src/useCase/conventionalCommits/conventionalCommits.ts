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
import * as validation from "../../service/validation.ts";

class State {
  constructor(public template: string) {}
}
type Initialize = (p: {
  userInterFace: {
    template: string;
    targetHighlighter: templateService.TargetHighlighter;
    borderColorSetter: terminal.BorderColorSetter;
  };
}) => Promise<{
  issues: never[] | {
    name: string;
    value: string;
  }[];
  templateRender: (p: {
    value: string;
  }) => void;
  prepareTemplate: (p: {
    template: string;
    name: string;
  }) => string;
  state: State;
}>;

const initialize: Initialize = async (p) => {
  console.clear();
  terminal.spinner.start("initialize...");

  const [issues] = await Promise.all([
    gitHub.fetchIssues(),
  ]).finally(() => {
    terminal.spinner.succeed();
  });

  return {
    issues,
    templateRender: terminal.createTemplateRender({
      borderColorSetter: p.userInterFace.borderColorSetter,
    }),
    prepareTemplate: templateService.prepareTemplate({
      highlighter: p.userInterFace.targetHighlighter,
    }),
    state: new State(p.userInterFace.template),
  };
};

type Main = (p: {
  question: {
    type: {
      options: SelectOptions["options"];
    };
    scope: {
      options: SelectOptions["options"];
    };
  };
  userInterFace: {
    template: string;
    targetHighlighter: templateService.TargetHighlighter;
    borderColorSetter: terminal.BorderColorSetter;
  };
}) => Promise<string>;

export const main: Main = async (p) => {
  const { issues, state, templateRender, prepareTemplate } = await initialize(
    p,
  );

  return prompt([
    {
      name: "type",
      message: "Select a type.",
      type: Select,
      options: p.question.type.options,
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
      options: p.question.scope.options,
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
      validate: async (input) => {
        console.clear();
        terminal.spinner.start("Submitting...");

        const r = await validation.validate(input)
          .catch((e) => {
            console.error(e);
            // it can't be helped
            return { type: "valid" } as const;
          })
          .finally(() => {
            terminal.spinner.stop();
          });

        if (r.type === "valid") {
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

        console.error(util.subject.fmt(r.reason));

        // error;
        return "";

        // const res = await validation.validate(input)
        //   .then((r) => {
        //     if (util.subject.isValid(r)) {
        //       return true;
        //     }

        //     console.error(util.subject.fmt(r));

        //     state.template = templateService.templateFillIn({
        //       template: state.template,
        //       answerVo: {},
        //     });
        //     templateRender({
        //       value: prepareTemplate({
        //         template: state.template,
        //         name: "subject",
        //       }),
        //     });
        //     console.error(util.subject.fmt(r));

        //     // error
        //     return "";
        //   })
        //   .catch((e) => {
        //     // FIXME
        //     console.log(e);
        //     return true;
        //   })
        //   .finally(() => {
        //     terminal.spinner.stop();
        //   });

        // return res;
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
  ]).then(() => state.template)
    .catch((e) => {
      console.error(e);
      return "";
    });
};
