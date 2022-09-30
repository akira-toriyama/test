import { Table, wait } from "../deps.ts";

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

const _spinner = wait("");

export const spinner = {
  start: (p: { text: string }) => {
    console.clear();
    _spinner.start().text = p.text;
  },
  stop: () => _spinner.stop(),
} as const;
