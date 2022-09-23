import { Table } from "https://deno.land/x/cliffy@v0.25.0/table/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

const borderColor = colors.green;
type Render = (p: {
  value: string;
}) => void;
export const render: Render = (p) => {
  console.clear();
  new Table()
    .header([
      p.value,
    ])
    .chars({
      "top": borderColor("─"),
      "topMid": borderColor("┬"),
      "topLeft": borderColor("┌"),
      "topRight": borderColor("┐"),
      "bottom": borderColor("─"),
      "bottomMid": borderColor("┴"),
      "bottomLeft": borderColor("└"),
      "bottomRight": borderColor("┘"),
      "left": borderColor("│"),
      "leftMid": borderColor("├"),
      "mid": borderColor("─"),
      "midMid": borderColor("┼"),
      "right": borderColor("│"),
      "rightMid": borderColor("┤"),
      "middle": borderColor("│"),
    })
    .border(true)
    .render();
};
