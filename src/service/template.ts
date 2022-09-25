import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

const currentColor = colors.bold.bgGreen;

type TemplateHighlight = (p: {
  template: string;
  name: string;
}) => string;
export const templateHighlight: TemplateHighlight = (p) =>
  p.template
    .replace(
      new RegExp(p.name),
      currentColor(p.name),
    )
    .replace(new RegExp("{{", "g"), "")
    .replace(new RegExp("}}", "g"), "");

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
