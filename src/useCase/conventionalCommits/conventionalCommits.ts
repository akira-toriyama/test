import {
  Input,
  prompt,
  Select,
  SelectOptions,
} from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";
import * as gitHub from "../../externalInterface/gitHub.ts";
import * as templateService from "../../service/template.ts";
import * as terminal from "../../userInterface/terminal.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

class State {
  constructor(public template: string) {}
}
type Initialize = (p: {
  userInterFace: {
    template: string;
    targetHighlighter?: templateService.TargetHighlighter;
    borderColorSetter?: terminal.BorderColorSetter;
  };
}) => {
  templateRender: (p: {
    value: string;
  }) => void;
  prepareTemplate: (p: {
    template: string;
    name: string;
  }) => string;
  state: State;
};

const initialize: Initialize = (p) => {
  return {
    templateRender: terminal.createTemplateRender({
      borderColorSetter: p.userInterFace.borderColorSetter || colors.green.bold,
    }),
    prepareTemplate: templateService.prepareTemplate({
      highlighter: p.userInterFace.targetHighlighter || colors.green.bgGreen,
    }),
    state: new State(p.userInterFace.template),
  };
};

type Validate = (
  p: string,
) => Promise<
  | {
    type: "valid";
  }
  | {
    type: "error";
    reason: unknown;
  }
>;

type Main = (p: {
  userInterFace: {
    template: string;
    targetHighlighter?: templateService.TargetHighlighter;
    borderColorSetter?: terminal.BorderColorSetter;
  };
  question: {
    type: {
      options: SelectOptions["options"];
    };
    scope?: {
      options: SelectOptions["options"];
    };
    subject?: {
      validate: Validate;
    };
    body?: {
      validate: Validate;
    };
    breakingChange?: {
      validate: Validate;
    };
  };
}) => Promise<string>;

export const main: Main = (p) => {
  const { state, templateRender, prepareTemplate } = initialize(
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
      options: p.question.scope?.options || [],
      search: true,
      before: async (answerVo, next) => {
        if (p.question.scope === undefined) {
          await next("subject");
          return;
        }

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
      name: "subject",
      message: "Enter subject.",
      type: Input,
      hint:
        "Surrounding it with an ` allows it. example: Add myFunc -> Add `myFunc`",
      validate: async (input) => {
        if (p.question.subject?.validate === undefined) {
          return true;
        }

        terminal.spinner.start({ text: "Submitting..." });
        const r = await p.question.subject?.validate(input)
          .finally(() => terminal.spinner.stop());

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

        console.error(JSON.stringify(r.reason, null, 2));

        // error;
        return "";
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
        state.template = state.template.replace(/\r?\n{2,}/, "\n").trim();
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
