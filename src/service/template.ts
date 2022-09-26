import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

const highlighter = colors.bold.bgGreen;
export type Highlighter = typeof highlighter;

type TemplateFillIn = (p: {
  template: string;
  answerVo: Record<string, string | undefined>;
}) => string;
export const templateFillIn: TemplateFillIn = (p) => {
  const kv = Object.entries(p.answerVo);

  const v = kv.shift();
  if (v === undefined) {
    return p.template;
  }

  return templateFillIn({
    template: p.template.replace(`{{${v[0]}}}`, v[1] || ""),
    answerVo: Object.fromEntries(kv),
  });
};

type CreateTemplateHighlighter = (pp: { highlighter: any }) => (p: {
  template: string;
  name: string;
}) => string;
export const createTemplateHighlighter: CreateTemplateHighlighter =
  (pp) => (p) =>
    p.template
      .replace(
        new RegExp(p.name),
        pp.highlighter(p.name),
      )
      .replace(new RegExp("{{", "g"), "")
      .replace(new RegExp("}}", "g"), "");
