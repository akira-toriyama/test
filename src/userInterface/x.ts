import { Row, Table } from "https://deno.land/x/cliffy@v0.25.0/table/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

export const template = `{{type}}: {{gitmoji}} {{subject}} Close #{{issue}}

{{body}}`;

const t = (p: { tpl: string; name: string }) => {
  const info = colors.bold.bgGreen;

  return p.tpl
    .replace(
      new RegExp(p.name),
      info(p.name),
    )
    .replace(new RegExp("{{", "g"), "")
    .replace(new RegExp("}}", "g"), "");
};

export const co = (p: { tpl: string; name: string }) => {
  return t({ tpl: p.tpl, name: p.name });
};

export const cococo = (
  p: { tpl: string; keyValue: Record<string, string | undefined> },
) => {
  let tt = p.tpl;
  Object.entries(p.keyValue).map((v) => {
    if (typeof v[1] === "string") {
      tt = tt.replace(`{{${v[0]}}}`, v[1]);
    }
  });

  return tt;
  //   p.tpl.replace(`{{${p.name}}}`, p.value);
};

export const ui = (p: { value: string }) => {
  console.clear();
  const bo = colors.green;
  new Table()
    .body([
      ["-"],
      [p.value],
    ])
    .chars({
      "top": bo("─"),
      "topMid": bo("┬"),
      "topLeft": bo("┌"),
      "topRight": bo("┐"),
      "bottom": bo("─"),
      "bottomMid": bo("┴"),
      "bottomLeft": bo("└"),
      "bottomRight": bo("┘"),
      "left": bo("│"),
      "leftMid": bo("├"),
      "mid": bo("─"),
      "midMid": bo("┼"),
      "right": bo("│"),
      "rightMid": bo("┤"),
      "middle": bo("│"),
    })
    .border(true)
    .render();
};
