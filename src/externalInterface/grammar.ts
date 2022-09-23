// TODO envは引数から
import * as translator from "./translator.ts";

const makeUrl = (p: { txt: string }) =>
  `https://api.textgears.com/grammar?key=${
    Deno.env.get("GRAMMAR_API_KEY")
  }&text=${encodeURI(p.txt)}`;

type GrammarCheckResponse = null | {
  status: boolean;
  response: {
    result: boolean;
    errors: Array<
      {
        id: string;
        offset: number;
        length: number;
        description: {
          en: string;
        };
        bad: string;
        better: Array<string>;
        type: "spelling";
      }
    >;
  };
};

/**
 * @see https://textgears.com/api#grammar
 */
export const grammarCheck = (p: { txt: string }) =>
  fetch(makeUrl(p))
    .then<GrammarCheckResponse>((v) => v.ok ? v.json() : null)
    .then(async (v) => {
      const allowTexts = p.txt.match(/`(.*?)`/g) || [];

      const errors = v?.response.errors
        .map((vv) => ({
          description: {
            en: vv.description.en,
          },
          bad: vv.bad,
          better: vv.better,
        }))
        .filter((o) => !allowTexts.some((txt) => txt === `\`${o.bad}\``)) || [];

      const translatedTxt = await Promise.all(
        errors.map((e) =>
          translator.translate({
            txt: e.description.en,
          })
        ),
      );

      return errors.map((e, i) => ({
        ...e,
        description: {
          ...e.description,
          [Deno.env.get("DEEPL_TARGET_LANG")]: translatedTxt.at(i),
        },
      }));
    })
    .catch(console.error);
