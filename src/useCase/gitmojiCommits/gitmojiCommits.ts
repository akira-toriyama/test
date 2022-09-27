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
  removeClosePrefix() {
    this.template = this.template.replace(
      / Close #_/,
      "",
    ).trim();
  }
}

type Initialize = (p: {
  userInterFace: {
    template: string;
    targetHighlighter?: templateService.TargetHighlighter;
    borderColorSetter?: terminal.BorderColorSetter;
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
  terminal.spinner.start({ text: "initialize..." });
  const [issues] = await Promise.all([
    gitHub.fetchIssues(),
  ]).finally(() => {
    terminal.spinner.stop();
  });

  return {
    issues,
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
    subject?: {
      validate: Validate;
    };
  };
}) => Promise<string>;

export const main: Main = async (p) => {
  const { state, templateRender, prepareTemplate } = await initialize(
    p,
  );

  return prompt([
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
  ]).then(() => state.template)
    .catch((e) => {
      console.error(e);
      return "";
    });
};
