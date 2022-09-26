import { Table } from "https://deno.land/x/cliffy@v0.25.0/table/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";
import Kia from "https://deno.land/x/kia@0.4.1/mod.ts";
import { Select } from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";

export type BorderColorColor = typeof colors.green.bold;

type CreateRender = (p: { borderColor: BorderColorColor }) => (p: {
  value: string;
}) => void;
export const createRender: CreateRender = (pp) => (p) => {
  console.clear();

  new Table()
    .header([p.value])
    .chars({
      "top": pp.borderColor("─"),
      "topMid": pp.borderColor("┬"),
      "topLeft": pp.borderColor("┌"),
      "topRight": pp.borderColor("┐"),
      "bottom": pp.borderColor("─"),
      "bottomMid": pp.borderColor("┴"),
      "bottomLeft": pp.borderColor("└"),
      "bottomRight": pp.borderColor("┘"),
      "left": pp.borderColor("│"),
      "leftMid": pp.borderColor("├"),
      "mid": pp.borderColor("─"),
      "midMid": pp.borderColor("┼"),
      "right": pp.borderColor("│"),
      "rightMid": pp.borderColor("┤"),
      "middle": pp.borderColor("│"),
    })
    .border(true)
    .render();
};

const kia = new Kia({ color: "green" });
export const sp = kia;

export const separator = Select.separator(
  "------------------------",
);
