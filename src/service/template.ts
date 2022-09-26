type TemplateFillIn = (
  p: {
    template: string;
    answerVo: Record<string, string | undefined>;
  },
) => string;
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

export type TargetHighlighter = (p: string) => string;

type PrepareTemplate = (pp: { highlighter: TargetHighlighter }) => (p: {
  template: string;
  name: string;
}) => string;
export const prepareTemplate: PrepareTemplate = (pp) => (p) =>
  p.template
    .replace(
      new RegExp(p.name),
      pp.highlighter(p.name),
    )
    .replace(new RegExp("{{", "g"), "")
    .replace(new RegExp("}}", "g"), "");
