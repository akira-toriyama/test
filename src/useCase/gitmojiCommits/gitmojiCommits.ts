import {
  Input,
  prompt,
  Select,
} from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";
import * as templateService from "../../service/template.ts";
import * as terminal from "/src/userInterface/terminal.ts";
// import * as terminal from "../../userInterface/terminal.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

class State {
  constructor(public template: string) {}
  fixTemplateBody() {
    this.template = this.template.replace(/\r?\n{2,}/, "\n").trim();
  }
  fixTemplateIssue() {
    this.template = this.template.replace("{{issue}}", "");
  }
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

const initialize: Initialize = (p) => ({
  templateRender: terminal.createTemplateRender({
    borderColorSetter: p.userInterFace.borderColorSetter || colors.green.bold,
  }),
  prepareTemplate: templateService.prepareTemplate({
    highlighter: p.userInterFace.targetHighlighter || colors.green.bgGreen,
  }),
  state: new State(p.userInterFace.template),
});

export type Validate = (
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
    gitmoji: {
      options: { name: string; value: string }[];
    };
    subject: {
      validate: Validate;
    };
    issues: {
      options: Array<{ name: string; value: string; disabled?: boolean } | any>;
    };
    body?: {
      validate: Validate;
    };
  };
}) => Promise<string>;

export const main: Main = async (p) => {
  const { state, templateRender, prepareTemplate } = await initialize(
    p,
  );

  const validate = async (pp: {
    input: string;
    name: "subject" | "body";
  }) => {
    if (p.question[pp.name]?.validate === undefined) {
      return true;
    }

    terminal.spinner.start({ text: "Submitting..." });
    const r = await p.question[pp.name]?.validate(pp.input)
      .finally(() => terminal.spinner.stop());

    if (r === undefined) {
      return true;
    }

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
        name: pp.name,
      }),
    });

    console.error(JSON.stringify(r.reason, null, 2));

    // error;
    return "";
  };

  const beforeFn = (pp: { answerVo: Record<string, string | undefined> }) => {
    state.template = templateService.templateFillIn({
      template: state.template,
      answerVo: pp.answerVo,
    });

    templateRender({
      value: prepareTemplate({
        template: state.template,
        name: "subject",
      }),
    });
  };

  const afterFn = (pp: { answerVo: Record<string, string | undefined> }) => {
    state.template = templateService.templateFillIn({
      template: state.template,
      answerVo: pp.answerVo,
    });
  };

  return prompt([
    {
      name: "gitmoji",
      message: "Select a gitmoji.",
      type: Select,
      options: p.question.gitmoji.options,
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
      validate: (input) => validate({ input, name: "subject" }),
      before: async (answerVo, next) => {
        beforeFn({ answerVo });
        await next();
      },
      after: async (answerVo, next) => {
        afterFn({ answerVo });
        await next();
      },
    },
    {
      name: "issue",
      message: "Select a issue.",
      type: Select,
      options: p.question.issues.options,
      search: true,
      before: async (answerVo, next) => {
        if (p.question.issues.options.length === 2) {
          state.fixTemplateIssue();
          await next("body");
          return;
        }

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

        await next();
      },
      transform: (v) => v === "Not selected" ? "" : v,
    },
    {
      name: "body",
      message: "Enter body.",
      type: Input,
      hint:
        "Surrounding it with an ` allows it. example: Add myFunc -> Add `myFunc`",
      validate: (input) => validate({ input, name: "body" }),
      before: async (answerVo, next) => {
        beforeFn({ answerVo });
        await next();
      },
      after: async (answerVo, next) => {
        afterFn({ answerVo });
        state.fixTemplateBody();
        await next();
      },
    },
  ]).then(() => state.template)
    .catch((e) => {
      console.error(e);
      return "";
    });
};
