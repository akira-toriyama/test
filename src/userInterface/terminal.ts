import { Table } from "https://deno.land/x/cliffy@v0.25.0/table/mod.ts";
import Kia from "https://deno.land/x/kia@0.4.1/mod.ts";
import { Select } from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";

export type BorderColorSetter = (p: string) => string;

type CreateTemplateRender = (
  pp: {
    borderColorSetter: BorderColorSetter;
  },
) => (
  p: {
    value: string;
  },
) => void;
export const createTemplateRender: CreateTemplateRender = (pp) => (p) => {
  console.clear();

  new Table()
    .header([p.value])
    .chars({
      "top": pp.borderColorSetter("─"),
      "topMid": pp.borderColorSetter("┬"),
      "topLeft": pp.borderColorSetter("┌"),
      "topRight": pp.borderColorSetter("┐"),
      "bottom": pp.borderColorSetter("─"),
      "bottomMid": pp.borderColorSetter("┴"),
      "bottomLeft": pp.borderColorSetter("└"),
      "bottomRight": pp.borderColorSetter("┘"),
      "left": pp.borderColorSetter("│"),
      "leftMid": pp.borderColorSetter("├"),
      "mid": pp.borderColorSetter("─"),
      "midMid": pp.borderColorSetter("┼"),
      "right": pp.borderColorSetter("│"),
      "rightMid": pp.borderColorSetter("┤"),
      "middle": pp.borderColorSetter("│"),
    })
    .border(true)
    .render();
};

export const spinner = new Kia();

export const separator = Select.separator(
  "------------------------",
);
