import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

const currentColor = colors.bold.bgGreen;

type CleanTemplate = (p: {
  template: string;
  name: string;
}) => string;
export const cleanTemplate: CleanTemplate = (p) =>
  p.template
    .replace(
      new RegExp(p.name),
      currentColor(p.name),
    )
    .replace(new RegExp("{{", "g"), "")
    .replace(new RegExp("}}", "g"), "");

type FillInTemplate = (p: {
  template: string;
  answerVo: Record<string, string | undefined>;
}) => string;
export const fillInTemplate: FillInTemplate = (p) => {
  const kv = Object.entries(p.answerVo);

  const v = kv.shift();
  if (v === undefined) {
    return p.template;
  }

  return fillInTemplate({
    template: p.template.replace(`{{${v[0]}}}`, v[1] || ""),
    answerVo: Object.fromEntries(kv),
  });
};
